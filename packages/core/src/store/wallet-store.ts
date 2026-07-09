import { createStore } from "zustand/vanilla";

import { logError, logWarn } from "../logger";
import type { WalletPersistence, WalletSnapshot } from "../storage";
import { WalletStorage } from "../storage/wallet-storage";
import type {
  Account,
  ChainPlatform,
  ConnectedWallet,
  WalletAdapter,
  WalletManagerConfig,
} from "../types";
import type { ConnectionError } from "../types/errors";
import { mapConnectionError } from "../types/errors";

import { createConnectorLifecycle } from "./connector-lifecycle";
import { createHydrationCoordinator } from "./hydration";
import { type Event, type State, initialState, reducer } from "./reducer";
import { createShadowAdapter } from "./shadow-adapter";
import { run } from "./wallet-store-helpers";

/**
 * Build a synchronously-populated `State` from `config.initialState`.
 * Each pool entry becomes a `ConnectedWallet` whose `connector` is a
 * shadow adapter; every connector id enters `reconnectingIds` so
 * consumers can branch on "is this connection verified" without
 * waiting for the async silent reconnect. `isHydrated` flips true
 * synchronously — the consumer's first render sees the persisted
 * state in the live store, not undefined.
 */
const seedStateFromSnapshot = (snapshot: WalletSnapshot): State => {
  const pool = new Map<string, ConnectedWallet>();
  const reconnectingIds = new Set<string>();
  for (const [connectorId, entry] of Object.entries(snapshot.pool)) {
    if (!entry) {
      continue;
    }
    const connector: WalletAdapter = createShadowAdapter(entry);
    pool.set(connectorId, {
      account: entry.account,
      accounts: [...entry.accounts],
      connector,
    });
    reconnectingIds.add(connectorId);
  }
  const selection = new Map<ChainPlatform, string>();
  for (const [platform, connectorId] of Object.entries(snapshot.selection)) {
    if (connectorId && pool.has(connectorId)) {
      selection.set(platform as ChainPlatform, connectorId);
    }
  }
  const activeConnectorId =
    snapshot.activeConnectorId && pool.has(snapshot.activeConnectorId)
      ? snapshot.activeConnectorId
      : (pool.keys().next().value ?? null);
  return {
    ...initialState,
    activeConnectorId,
    isHydrated: true,
    pool,
    reconnectingIds,
    selection,
  };
};

const CONNECT_TIMEOUT_MS = 90_000;
const DEFAULT_SLOW_CONNECT_THRESHOLD_MS = 5000;

const normaliseAddress = (addr: string): string => addr.toLowerCase();

type ExtractState<S> = S extends { getState: () => infer T } ? T : never;

type RuntimeMembers = {
  _config: WalletManagerConfig;
  _storage: WalletPersistence;
  connectWallet: (
    connectorId: string,
    onSuccess?: (wallet: ConnectedWallet) => void,
    onError?: (error: Error) => void,
  ) => Promise<void>;
  disconnectWallet: (connectorId: string) => void;
  getConnectorInstance: (id: string) => ReturnType<WalletManagerConfig["createConnector"]>;
  hydrateWallets: () => Promise<void>;
  refreshWallet: (connectorId: string) => void;
  requestAccounts: (connectorId: string) => Promise<void>;
  reset: () => void;
  resetConnectionStatus: () => void;
  setActiveConnector: (connectorId: string | null) => void;
  setConnectionError: (error: ConnectionError | null) => void;
  setSelection: (chainPlatform: ChainPlatform, connectorId: string | null) => void;
  setUserDisconnected: (value: boolean) => void;
  tryRestoreFromPending: (connectorId: string) => Promise<void>;
  updateWalletAccount: (connectorId: string, account: Account) => void;
};

type WalletStore = ReturnType<typeof createWalletStore>;
type WalletStoreState = ExtractState<WalletStore>;

const createWalletStore = (config: WalletManagerConfig) => {
  const storageKeyPrefix = config.storageKeyPrefix || "butr";
  const storage = config.storage || new WalletStorage({ keyPrefix: storageKeyPrefix });

  const reportStorageError = (context: string) => (error: unknown) => {
    if (config.onStorageError) {
      try {
        config.onStorageError(error, context);
      } catch (cbError: unknown) {
        logWarn("[butr] onStorageError threw:", cbError);
      }
      return;
    }
    logWarn(`[butr] ${context}:`, error);
  };

  // longer manages the queue directly.
  const hydration = createHydrationCoordinator(storage, config.createConnector);

  return createStore<State & RuntimeMembers>()((set, get) => {
    const dispatch = (event: Event) => {
      set((prev) => reducer(prev, event), false);
    };

    const persistPool = (): Promise<void> =>
      run(() => storage.setPool(get().pool), reportStorageError("failed to persist pool"));

    const persistSelection = (): Promise<void> =>
      run(
        () => storage.setSelection(get().selection),
        reportStorageError("failed to persist selection"),
      );

    const persistActive = (): Promise<void> =>
      run(
        () => storage.setActiveConnectorId(get().activeConnectorId),
        reportStorageError("failed to persist active connector"),
      );

    // changed." Three call sites use it: the wallet-event bridge
    // the caller knows which address is now active (wallet event,
    // list and wants the reducer's preserve-or-fallback logic.
    const refreshPoolEntry = (connectorId: string, accounts: Array<Account>, active?: Account) => {
      dispatch({ accounts, active, connectorId, type: "ACCOUNTS_REFRESHED" });
      void persistPool();
    };

    // Owns the "exactly one subscription per connector" invariant,
    // Attach is idempotent: the runtime calls it after every
    const lifecycle = createConnectorLifecycle({
      onAccountChanged: (connectorId, accounts, active) => {
        // Full-replace so the pool mirrors the wallet's current exposure; the wallet picks `active`.
        refreshPoolEntry(connectorId, [...accounts], active);
      },
      onDisconnected: (connectorId, chainPlatform) => {
        // hides the wallet, but DON'T touch storage — EIP-1193 emits
        // MetaMask simply auto-locks. The two are indistinguishable
        // saved connection on every wallet lock. Keeping storage
        dispatch({ connectorId, type: "DISCONNECTED" });
        config.onDisconnect?.(chainPlatform);
      },
    });

    const seeded: State = config.initialState
      ? seedStateFromSnapshot(config.initialState)
      : initialState;

    return {
      ...seeded,
      _config: config,
      _storage: storage,
      connectWallet: async (connectorId, onSuccess, onError) => {
        get().setUserDisconnected(false);

        const connector = config.createConnector(connectorId);
        if (!connector) {
          throw new Error(`Failed to create connector for ${connectorId}`);
        }

        dispatch({ connectorId, type: "CONNECT_STARTED" });

        // Slow-connect telemetry. Fires once if the wallet doesn't
        const slowThreshold = config.slowConnectThresholdMs ?? DEFAULT_SLOW_CONNECT_THRESHOLD_MS;
        const slowTimer = config.onSlowConnect
          ? setTimeout(() => {
              try {
                config.onSlowConnect?.(connectorId);
              } catch (cbError: unknown) {
                logWarn("[butr] onSlowConnect threw:", cbError);
              }
            }, slowThreshold)
          : null;

        let connectTimeoutId: ReturnType<typeof setTimeout> | null = null;

        try {
          const connectPromise = connector.connect();
          // oxlint-disable-next-line promise/prefer-await-to-then -- suppress unhandled rejection; we await via Promise.race below
          void connectPromise.catch(() => {});
          await Promise.race([
            connectPromise,
            new Promise((_, reject) => {
              connectTimeoutId = setTimeout(() => {
                reject(new Error("Connection timeout"));
              }, CONNECT_TIMEOUT_MS);
            }),
          ]);

          const account = await connector.getAccount();
          if (!account) {
            throw new Error("Failed to get account");
          }

          const fetchedAccounts = connector.getAccounts
            ? await connector.getAccounts().catch(() => null)
            : null;
          const accounts =
            fetchedAccounts && fetchedAccounts.length > 0 ? fetchedAccounts : [account];

          const entry: ConnectedWallet = { account, accounts, connector };
          dispatch({ connectorId, entry, type: "CONNECT_SUCCEEDED" });

          lifecycle.attach(connectorId, connector);

          await Promise.all([persistPool(), persistSelection(), persistActive()]);

          config.onConnect?.(entry);
          onSuccess?.(entry);
        } catch (error) {
          const normalised = mapConnectionError(error);
          dispatch({ error: normalised, type: "CONNECT_FAILED" });
          try {
            await connector.disconnect?.();
          } catch (disconnectError: unknown) {
            logWarn("[butr] disconnect during error recovery failed:", disconnectError);
          }
          try {
            config.onConnectError?.(normalised, connectorId);
          } catch (cbError: unknown) {
            logWarn("[butr] onConnectError threw:", cbError);
          }
          onError?.(error as Error);
          throw error;
        } finally {
          if (connectTimeoutId) {
            clearTimeout(connectTimeoutId);
          }
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

        void run(() => wallet.connector.disconnect?.() ?? Promise.resolve(), logError);

        const platform = wallet.connector.chainPlatform;
        dispatch({ connectorId, type: "DISCONNECTED" });

        if (get().pool.size === 0) {
          void run(() => storage.clearAll(), reportStorageError("failed to clear storage"));
        } else {
          // Explicit eviction so storage doesn't keep retrying the
          // disconnected wallet on the next load. `persistPool` is
          // additive (see `WalletStorage.setPool`), so we can't rely
          void run(
            () => storage.removePoolEntry(connectorId),
            reportStorageError("failed to remove pool entry"),
          );
          void persistSelection();
          void persistActive();
        }

        config.onDisconnect?.(platform);
      },

      getConnectorInstance: (id) => config.createConnector(id),

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
        for (const [connectorId, wallet] of result.pool) {
          lifecycle.attach(connectorId, wallet.connector);
        }
        await Promise.all([persistSelection(), persistActive()]);
        // Drain: catch the race where a Wallet Standard adapter
        // announced BEFORE hydration finished populating its queue.
        // empty queue and silently returned, leaving SVM wallets
        // not become an unhandled rejection, but it must still log —
        for (const id of hydration.pendingIds()) {
          void run(
            () => get().tryRestoreFromPending(id),
            (e) => logWarn(`[butr] late restore rejected for ${id}:`, e),
          );
        }
        if (config.onHydrated) {
          try {
            config.onHydrated({
              dropped: result.dropped,
              pendingIds: [...result.pendingIds],
              restoredIds: [...result.pool.keys()],
            });
          } catch (cbError: unknown) {
            logWarn("[butr] onHydrated threw:", cbError);
          }
        } else if (result.dropped.length > 0) {
          // when no callback is set, so silent drops still log.
          for (const { connectorId, reason } of result.dropped) {
            logWarn(`[butr] failed to restore connector ${connectorId}:`, reason);
          }
        }
      },
      refreshWallet: (connectorId) => {
        dispatch({ connectorId, type: "WALLET_REFRESHED" });
      },

      requestAccounts: async (connectorId) => {
        const entry = get().pool.get(connectorId);
        if (!entry) {
          return;
        }
        // Ask the wallet to open its picker (if supported). EVM
        // Wallet Standard wallets typically have no equivalent
        await entry.connector.requestAccounts?.();
        const fresh = entry.connector.getAccounts
          ? await entry.connector.getAccounts().catch(() => null)
          : null;
        if (!fresh || fresh.length === 0) {
          return;
        }
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
          void run(() => wallet.connector.disconnect?.() ?? Promise.resolve(), logError);
        }

        void run(() => storage.clearAll(), reportStorageError("failed to clear storage"));

        if (config.onReset) {
          const onReset = config.onReset;
          void run(() => Promise.resolve(onReset()), logError);
        }

        dispatch({ type: "RESET" });
      },

      resetConnectionStatus: () => {
        dispatch({ type: "STATUS_RESET" });
      },

      setActiveConnector: (connectorId) => {
        dispatch({ connectorId, type: "ACTIVE_CHANGED" });
        void persistActive();
      },

      setConnectionError: (error) => {
        dispatch({ error, type: "ERROR_SET" });
      },

      setSelection: (chainPlatform, connectorId) => {
        dispatch({ chainPlatform, connectorId, type: "SELECTION_CHANGED" });
        void persistSelection();
      },

      setUserDisconnected: (value: boolean) => {
        dispatch({ type: "USER_DISCONNECTED_SET", value });
        void run(
          () => storage.markUserDisconnected(value),
          reportStorageError("failed to persist disconnect intent"),
        );
      },

      tryRestoreFromPending: async (connectorId) => {
        // The eager hydration path doesn't check that flag either —
        const outcome = await hydration.drainPending(connectorId);
        if (!outcome) {
          return;
        }
        if (outcome.kind === "fail") {
          logWarn(`[butr] late restore failed for ${connectorId}:`, outcome.error);
          return;
        }
        dispatch({ connectorId, entry: outcome.entry, type: "CONNECT_SUCCEEDED" });
        lifecycle.attach(connectorId, outcome.entry.connector);
        await Promise.all([persistPool(), persistSelection(), persistActive()]);
        config.onConnect?.(outcome.entry);
      },

      updateWalletAccount: (connectorId, account) => {
        // Routes through ACCOUNTS_REFRESHED so the manual and wallet-event paths share a reducer case.
        const entry = get().pool.get(connectorId);
        if (!entry) {
          return;
        }
        const newChain = account.chain;
        const remapped = entry.accounts.map((a) =>
          a.chain.id === newChain.id
            ? a
            : {
                chain: newChain,
                id: `${newChain.id}:${normaliseAddress(a.walletAddress)}`,
                walletAddress: a.walletAddress,
              },
        );
        const seen = remapped.some(
          (a) => normaliseAddress(a.walletAddress) === normaliseAddress(account.walletAddress),
        );
        const accounts = seen ? remapped : [...remapped, account];
        refreshPoolEntry(connectorId, accounts, account);
      },
    };
  });
};

export type { WalletStore, WalletStoreState };
export { createWalletStore };
