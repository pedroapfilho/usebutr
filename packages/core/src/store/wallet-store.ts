import { createStore } from "zustand/vanilla";
import type { Account, ChainPlatform, ConnectedWallet, WalletManagerConfig } from "../types";
import type { ConnectionError } from "../types/errors";
import { mapConnectionError } from "../types/errors";
import { WalletStorage } from "../storage";
import type { WalletPersistence } from "../storage";
import { run } from "./wallet-store-helpers";
import { createHydrationCoordinator } from "./hydration";
import { createConnectorLifecycle } from "./connector-lifecycle";
import { type Event, type State, initialState, reducer } from "./reducer";

const CONNECT_TIMEOUT_MS = 90_000;
const DEFAULT_SLOW_CONNECT_THRESHOLD_MS = 5_000;

type ExtractState<S> = S extends { getState: () => infer T } ? T : never;

type RuntimeMembers = {
  _config: WalletManagerConfig;
  hydrateWallets: () => Promise<void>;
  setUserDisconnected: (value: boolean) => void;
  _storage: WalletPersistence;
  tryRestoreFromPending: (connectorId: string) => Promise<void>;
  connectWallet: (
    connectorId: string,
    onSuccess?: (wallet: ConnectedWallet) => void,
    onError?: (error: Error) => void,
  ) => Promise<void>;
  disconnectWallet: (connectorId: string) => void;
  getConnectorInstance: (id: string) => ReturnType<WalletManagerConfig["createConnector"]>;
  refreshWallet: (connectorId: string) => void;
  requestAccounts: (connectorId: string) => Promise<void>;
  reset: () => void;
  resetConnectionStatus: () => void;
  setActiveConnector: (connectorId: string | null) => void;
  setConnectionError: (error: ConnectionError | null) => void;
  setSelection: (chainPlatform: ChainPlatform, connectorId: string | null) => void;
  updateWalletAccount: (connectorId: string, account: Account) => void;
};

type WalletStore = ReturnType<typeof createWalletStore>;
type WalletStoreState = ExtractState<WalletStore>;

const createWalletStore = (config: WalletManagerConfig) => {
  const storageKeyPrefix = config.storageKeyPrefix || "butr";
  const storage = config.storage || new WalletStorage({ keyPrefix: storageKeyPrefix });

  // Storage-error handler. Default: `console.warn` (preserves the
  // pre-`onStorageError` behaviour). Consumer-provided callback routes
  // failures through their telemetry pipeline.
  const reportStorageError = (context: string) => (error: unknown) => {
    if (config.onStorageError) {
      try {
        config.onStorageError(error, context);
      } catch (cbError: unknown) {
        console.warn("[butr] onStorageError threw:", cbError);
      }
      return;
    }
    console.warn(`[butr] ${context}:`, error);
  };

  // Owns the full restore lifecycle: read storage, instantiate adapters,
  // restore in parallel, park entries whose adapter wasn't registered
  // yet, drain parked entries when discovery announces a matching id.
  // `pendingRestores` lives inside the coordinator — the runtime no
  // longer manages the queue directly.
  const hydration = createHydrationCoordinator(
    storage,
    config.createConnector,
    (context, error) => reportStorageError(context)(error),
  );

  return createStore<State & RuntimeMembers>()((set, get) => {
        const dispatch = (event: Event) => {
          set((prev) => reducer(prev, event), false);
        };

        // Fire-and-forget storage writes. Each persister is independent
        // — `persistPool` only writes the pool, `persistSelection` only
        // writes the selection, etc. Some events update one slot
        // (`SELECTION_CHANGED` → `persistSelection`), others update all
        // three (`CONNECT_SUCCEEDED`, hydration). When multiple
        // persisters fire from the same call site, they race —
        // intentionally. Each storage key is durable on its own; the
        // order of resolution doesn't affect correctness. Don't
        // collapse these into a single `persistAll()` helper without
        // first reading the call sites — many of them only need one.
        const persistPool = () => {
          void run(() => storage.setPool(get().pool), reportStorageError("failed to persist pool"));
        };

        // Single entry point for "the pool entry's exposed accounts
        // changed." Three call sites use it: the wallet-event bridge
        // (`accountChanged`), the consumer-facing `updateWalletAccount`
        // action, and the `requestAccounts` action. `active` is set when
        // the caller knows which address is now active (wallet event,
        // manual update); omitted when the caller just refreshed the
        // list and wants the reducer's preserve-or-fallback logic.
        const refreshPoolEntry = (
          connectorId: string,
          accounts: Array<Account>,
          active?: Account,
        ) => {
          dispatch({ accounts, active, connectorId, type: "ACCOUNTS_REFRESHED" });
          persistPool();
        };

        const persistSelection = () => {
          void run(
            () => storage.setSelection(get().selection),
            reportStorageError("failed to persist selection"),
          );
        };

        const persistActive = () => {
          void run(
            () => storage.setActiveConnectorId(get().activeConnectorId),
            reportStorageError("failed to persist active connector"),
          );
        };

        // Owns the "exactly one subscription per connector" invariant,
        // the event-to-handler choreography, and the unsubscribers Map.
        // Attach is idempotent: the runtime calls it after every
        // restore / connect without first checking whether a prior
        // subscription exists.
        const lifecycle = createConnectorLifecycle({
          onAccountChanged: (connectorId, accounts, active) => {
            // Full-replace the accounts array so the pool entry mirrors
            // the wallet's current exposure. Drops the previously-active
            // address on single-account wallets (Phantom EVM/SVM,
            // MetaMask Snap); preserves the multi-account list on
            // MetaMask, Rabby, etc. The wallet tells us which is active.
            refreshPoolEntry(connectorId, [...accounts], active);
          },
          onDisconnected: (connectorId, chainPlatform) => {
            // Mirror an external disconnect into the reducer. Don't call
            // connector.disconnect — the wallet already did the work; the
            // lifecycle bridge has already cleared the subscription. Just
            // dispatch, persist, notify.
            dispatch({ connectorId, type: "DISCONNECTED" });
            if (get().pool.size === 0) {
              void run(() => storage.clearAll(), reportStorageError("failed to clear storage"));
            } else {
              persistPool();
              persistSelection();
              persistActive();
            }
            config.onDisconnect?.(chainPlatform);
          },
        });

        return {
          ...initialState,
          _config: config,
          hydrateWallets: async () => {
            const result = await hydration.hydrate();
            dispatch({
              activeConnectorId: result.activeConnectorId,
              isUserDisconnected: result.isUserDisconnected,
              pool: result.pool,
              selection: result.selection,
              type: "HYDRATED",
            });
            // Wire up wallet-side event subscriptions for every restored
            // connector so account/chain swaps after a refresh keep the
            // reducer in sync without consumer effort.
            for (const [connectorId, wallet] of result.pool) {
              lifecycle.attach(connectorId, wallet.connector);
            }
            // Persist any reconciled values back so future loads stay consistent.
            persistSelection();
            persistActive();
            // Drain: catch the race where a Wallet Standard adapter
            // announced BEFORE hydration finished populating its queue.
            // Without this, the discovery callback's
            // `tryRestoreFromPending(adapter.id)` would have hit the
            // empty queue and silently returned, leaving SVM wallets
            // un-restored on reload. The coordinator's `pendingIds()`
            // is the post-hydrate snapshot; each id resolves
            // independently. Late-restore failures surface per-entry
            // inside `tryRestoreFromPending`.
            void Promise.all(
              hydration.pendingIds().map((id) => get().tryRestoreFromPending(id)),
            );
            // Surface the hydration outcome. Three buckets: restored,
            // pending (waiting for adapter announcement), dropped
            // (genuine restore failures). The default `console.warn`
            // for dropped entries is replaced by this callback when
            // set — consumers route to telemetry / UX hints.
            if (config.onHydrated) {
              try {
                config.onHydrated({
                  dropped: result.dropped,
                  pendingIds: [...result.pendingIds],
                  restoredIds: [...result.pool.keys()],
                });
              } catch (cbError: unknown) {
                console.warn("[butr] onHydrated threw:", cbError);
              }
            } else if (result.dropped.length > 0) {
              // Preserve the pre-`onHydrated` console.warn behaviour
              // when no callback is set, so silent drops still log.
              for (const { connectorId, reason } of result.dropped) {
                console.warn(`[butr] failed to restore connector ${connectorId}:`, reason);
              }
            }
          },
          tryRestoreFromPending: async (connectorId) => {
            // Note: deliberately NOT gating on `isUserDisconnected`.
            // The eager hydration path doesn't check that flag either —
            // stored entries restore on reload regardless of whether
            // the user's most recent action was a disconnect. The
            // late-restore path mirrors that policy for symmetry.
            const outcome = await hydration.drainPending(connectorId);
            if (!outcome) {
              return;
            }
            if (outcome.kind === "fail") {
              console.warn(`[butr] late restore failed for ${connectorId}:`, outcome.error);
              return;
            }
            // Reuse the reducer's connect-success path so selection /
            // active reconciliation matches a normal connect flow.
            dispatch({ connectorId, entry: outcome.entry, type: "CONNECT_SUCCEEDED" });
            lifecycle.attach(connectorId, outcome.entry.connector);
            persistPool();
            persistSelection();
            persistActive();
            config.onConnect?.(outcome.entry);
          },
          setUserDisconnected: (value: boolean) => {
            dispatch({ type: "USER_DISCONNECTED_SET", value });
            void run(
              () => storage.markUserDisconnected(value),
              reportStorageError("failed to persist disconnect intent"),
            );
          },
          _storage: storage,

          connectWallet: async (connectorId, onSuccess, onError) => {
            get().setUserDisconnected(false);

            const connector = config.createConnector(connectorId);
            if (!connector) {
              throw new Error(`Failed to create connector for ${connectorId}`);
            }

            dispatch({ connectorId, type: "CONNECT_STARTED" });

            // Slow-connect telemetry. Fires once if the wallet doesn't
            // resolve within the configured threshold. Cleared in finally.
            const slowThreshold =
              config.slowConnectThresholdMs ?? DEFAULT_SLOW_CONNECT_THRESHOLD_MS;
            const slowTimer = config.onSlowConnect
              ? setTimeout(() => {
                  try {
                    config.onSlowConnect?.(connectorId);
                  } catch (cbError: unknown) {
                    console.warn("[butr] onSlowConnect threw:", cbError);
                  }
                }, slowThreshold)
              : null;

            try {
              const connectPromise = connector.connect();
              // oxlint-disable-next-line promise/prefer-await-to-then -- suppress unhandled rejection; we await via Promise.race below
              void connectPromise.catch(() => {});
              await Promise.race([
                connectPromise,
                new Promise((_, reject) => {
                  setTimeout(() => {
                    reject(new Error("Connection timeout"));
                  }, CONNECT_TIMEOUT_MS);
                }),
              ]);

              const account = await connector.getAccount();
              if (!account) {
                throw new Error("Failed to get account");
              }

              // Pull all known accounts when the connector supports it.
              const fetchedAccounts = connector.getAccounts
                ? await connector.getAccounts().catch(() => null)
                : null;
              const accounts =
                fetchedAccounts && fetchedAccounts.length > 0 ? fetchedAccounts : [account];

              const entry: ConnectedWallet = { account, accounts, connector };
              dispatch({ connectorId, entry, type: "CONNECT_SUCCEEDED" });

              lifecycle.attach(connectorId, connector);

              persistPool();
              persistSelection();
              persistActive();

              config.onConnect?.(entry);
              onSuccess?.(entry);
            } catch (error) {
              const normalised = mapConnectionError(error);
              dispatch({ error: normalised, type: "CONNECT_FAILED" });
              try {
                await connector.disconnect?.();
              } catch (disconnectError: unknown) {
                console.warn("[butr] disconnect during error recovery failed:", disconnectError);
              }
              try {
                config.onConnectError?.(normalised, connectorId);
              } catch (cbError: unknown) {
                console.warn("[butr] onConnectError threw:", cbError);
              }
              onError?.(error as Error);
              throw error;
            } finally {
              if (slowTimer) {
                clearTimeout(slowTimer);
              }
            }
          },

          disconnectWallet: (connectorId) => {
            get().setUserDisconnected(true);

            const state = get();
            if (!state.isHydrated) {
              return;
            }
            const wallet = state.pool.get(connectorId);
            if (!wallet) {
              return;
            }

            lifecycle.detach(connectorId);

            void run(() => wallet.connector.disconnect?.() ?? Promise.resolve(), console.error);

            const platform = wallet.connector.chainPlatform;
            dispatch({ connectorId, type: "DISCONNECTED" });

            if (get().pool.size === 0) {
              void run(() => storage.clearAll(), reportStorageError("failed to clear storage"));
            } else {
              persistPool();
              persistSelection();
              persistActive();
            }

            config.onDisconnect?.(platform);
          },

          getConnectorInstance: (id) => config.createConnector(id),

          refreshWallet: (connectorId) => {
            dispatch({ connectorId, type: "WALLET_REFRESHED" });
          },

          requestAccounts: async (connectorId) => {
            const entry = get().pool.get(connectorId);
            if (!entry) {
              return;
            }
            // Ask the wallet to open its picker (if supported). EVM
            // wallets honour this via `wallet_requestPermissions`;
            // Wallet Standard wallets typically have no equivalent
            // RPC, so the call resolves immediately and the refresh
            // below simply re-reads the current list.
            await entry.connector.requestAccounts?.();
            const fresh = entry.connector.getAccounts
              ? await entry.connector.getAccounts().catch(() => null)
              : null;
            if (!fresh || fresh.length === 0) {
              return;
            }
            // No `active` — the reducer preserves the current active
            // if it's still in the refreshed list, else picks [0].
            refreshPoolEntry(connectorId, fresh);
          },

          reset: () => {
            get().setUserDisconnected(true);

            const state = get();
            if (!state.isHydrated) {
              return;
            }

            lifecycle.detachAll();

            for (const wallet of state.pool.values()) {
              void run(() => wallet.connector.disconnect?.() ?? Promise.resolve(), console.error);
            }

            void run(() => storage.clearAll(), reportStorageError("failed to clear storage"));

            if (config.onReset) {
              const onReset = config.onReset;
              void run(() => Promise.resolve(onReset()), console.error);
            }

            dispatch({ type: "RESET" });
          },

          resetConnectionStatus: () => {
            dispatch({ type: "STATUS_RESET" });
          },

          setActiveConnector: (connectorId) => {
            dispatch({ connectorId, type: "ACTIVE_CHANGED" });
            persistActive();
          },

          setConnectionError: (error) => {
            dispatch({ error, type: "ERROR_SET" });
          },

          setSelection: (chainPlatform, connectorId) => {
            dispatch({ chainPlatform, connectorId, type: "SELECTION_CHANGED" });
            persistSelection();
          },

          updateWalletAccount: (connectorId, account) => {
            // Manual variant of the wallet-event path. Builds the
            // next accounts list (dedupe-by-address + chain refresh
            // since chain is wallet-level) and routes through
            // ACCOUNTS_REFRESHED so there's one reducer case for
            // "the wallet's exposure changed."
            const entry = get().pool.get(connectorId);
            if (!entry) {
              return;
            }
            const normalise = (addr: string): string => addr.toLowerCase();
            const newChain = account.chain;
            const remapped = entry.accounts.map((a) =>
              a.chain.id === newChain.id
                ? a
                : {
                    chain: newChain,
                    id: `${newChain.id}:${normalise(a.walletAddress)}`,
                    walletAddress: a.walletAddress,
                  },
            );
            const seen = remapped.some(
              (a) => normalise(a.walletAddress) === normalise(account.walletAddress),
            );
            const accounts = seen ? remapped : [...remapped, account];
            refreshPoolEntry(connectorId, accounts, account);
          },
        };
      });
};

export type { WalletStore, WalletStoreState };
export { createWalletStore };
