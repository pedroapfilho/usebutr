import type { StoreApi } from "zustand/vanilla";
import { createStore } from "zustand/vanilla";

import { logError, logWarn } from "../logger";
import type {
  PersistedWalletState,
  StoredPoolRecord,
  WalletSnapshot,
} from "../storage/persistence";
import { createWalletStorage } from "../storage/wallet-storage";
import type {
  Account,
  ChainPlatform,
  ConnectedWallet,
  HydrationOutcome,
  WalletAdapter,
  WalletManagerConfig,
} from "../types";
import { buildAccount } from "../types/account";
import { ConnectionError, toConnectionError } from "../types/errors";

import { createConnectorLifecycle } from "./connector-lifecycle";
import type { WalletEvent, WalletState } from "./reducer";
import { initialState, reducer, stateFromSnapshot, toStoredEntry } from "./reducer";

const CONNECT_TIMEOUT_MS = 90_000;
// A silent reconnect needs no user, so it is short. Some wallets ignore
// `silent` and prompt; without a bound they would hold `isHydrated` false
// until the user answers a popup they never asked for.
const RESTORE_TIMEOUT_MS = 15_000;
const DEFAULT_SLOW_CONNECT_THRESHOLD_MS = 5000;

type WalletManager = Pick<StoreApi<WalletState>, "getInitialState" | "getState" | "subscribe"> & {
  /** Clears `connectionError` and returns `connectionStatus` to idle. */
  clearConnectionError: () => void;
  /** Resolves the connected wallet; rejects with a `ConnectionError`. */
  connect: (connectorId: string) => Promise<ConnectedWallet>;
  disconnect: (connectorId: string) => void;
  /** Disconnects every wallet and forgets every persisted connection. */
  disconnectAll: () => void;
  /** Opens the wallet's account picker, then refreshes the pool entry. A no-op
   *  for wallets without `requestAccounts`. */
  requestAccounts: (connectorId: string) => Promise<void>;
  /** Makes `account` the wallet's active account. */
  setAccount: (connectorId: string, account: Account) => void;
  setActive: (connectorId: string) => void;
  setSelection: (chainPlatform: ChainPlatform, connectorId: string) => void;
  /**
   * Subscribes the sources, hydrates persisted connections (once per
   * manager) and bridges wallet events. The returned function undoes all of
   * it except hydration, so a StrictMode remount is safe.
   */
  start: () => () => void;
};

type RestoreResult =
  | { connectorId: string; ok: true }
  | { connectorId: string; error: ConnectionError; ok: false };

const EMPTY_PERSISTED: PersistedWalletState = {
  activeConnectorId: null,
  isUserDisconnected: false,
  pool: {},
  selection: {},
};

const toPersistedState = (state: WalletState): PersistedWalletState => {
  const pool: StoredPoolRecord = Object.fromEntries(state.dormant);
  for (const [connectorId, wallet] of state.pool) {
    pool[connectorId] = toStoredEntry(connectorId, wallet);
  }
  return {
    activeConnectorId: state.activeConnectorId,
    isUserDisconnected: state.isUserDisconnected,
    pool,
    selection: Object.fromEntries(state.selection),
  };
};

const persistedSliceChanged = (state: WalletState, prev: WalletState): boolean =>
  state.pool !== prev.pool ||
  state.dormant !== prev.dormant ||
  state.selection !== prev.selection ||
  state.activeConnectorId !== prev.activeConnectorId ||
  state.isUserDisconnected !== prev.isUserDisconnected;

const toError = (value: unknown): Error =>
  value instanceof Error ? value : new Error(String(value));

/** A consumer callback that throws must not break the manager. */
const safely = <Args extends ReadonlyArray<unknown>>(
  name: string,
  callback: ((...args: Args) => void) | undefined,
  ...args: Args
) => {
  try {
    callback?.(...args);
  } catch (error) {
    logWarn(`[butr] ${name} threw:`, error);
  }
};

const withTimeout = async <T>(promise: Promise<T>, ms: number): Promise<T> => {
  // oxlint-disable-next-line promise/prefer-await-to-then -- the race below may abandon it; keep its rejection handled
  void promise.catch(() => {});
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new ConnectionError("Timeout", `Connection timed out after ${ms / 1000}s`));
        }, ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

const teardown = async (connector: WalletAdapter) => {
  try {
    await connector.disconnect?.();
  } catch (error) {
    logWarn(`[butr] disconnect of ${connector.id} failed:`, error);
  }
};

/**
 * Framework-free: React binds it through `WalletManagerProvider`, anything
 * else calls `start()` itself. Creating one has no side effects, so it is
 * safe during a server render.
 */
const createWalletManager = (
  config: WalletManagerConfig = {},
  options: { initialState?: WalletSnapshot } = {},
): WalletManager => {
  const storage = config.storage ?? createWalletStorage({ keyPrefix: config.storageKeyPrefix });
  const store = createStore<WalletState>()(() =>
    options.initialState ? stateFromSnapshot(options.initialState) : initialState,
  );
  const { getState } = store;

  const dispatch = (event: WalletEvent) => {
    store.setState((state) => reducer(state, event), true);
  };

  const findAdapter = (connectorId: string) =>
    getState().adapters.find((adapter) => adapter.id === connectorId);

  const reportStorageError = (error: unknown) => {
    if (config.onStorageError) {
      safely("onStorageError", config.onStorageError, toError(error));
    } else {
      logWarn("[butr] wallet persistence failed:", error);
    }
  };

  // Persistence: a pure function of state, written after every change once
  // hydration has loaded what was there before. Saves are coalesced so an
  // async driver never writes an older state after a newer one.
  let persistEnabled = false;
  let flushing = false;
  let dirty = false;
  const persist = async () => {
    dirty = true;
    if (flushing) {
      return;
    }
    flushing = true;
    while (dirty) {
      dirty = false;
      try {
        await storage.save(toPersistedState(getState()));
      } catch (error) {
        reportStorageError(error);
      }
    }
    flushing = false;
  };
  store.subscribe((state, prev) => {
    if (persistEnabled && persistedSliceChanged(state, prev)) {
      void persist();
    }
  });

  const lifecycle = createConnectorLifecycle({
    onAccountsChanged: (connectorId, accounts) => {
      dispatch({ accounts, active: accounts[0], connectorId, type: "ACCOUNTS_CHANGED" });
    },
    onDisconnected: (connectorId) => {
      const wallet = getState().pool.get(connectorId);
      if (wallet === undefined) {
        return;
      }
      // Discovery caches the adapter and hands it back on the next connect,
      // so it must not be reused while still holding the ended session.
      void teardown(wallet.connector);
      dispatch({ byUser: false, connectorId, type: "DISCONNECTED" });
      safely("onDisconnect", config.onDisconnect, wallet, { byUser: false });
    },
  });

  // Hydration: silent reconnect of every dormant entry whose adapter exists,
  // then of each late adapter the moment a source announces it.
  const attempted = new Set<string>();
  let loaded = false;
  let hydration: Promise<void> | null = null;
  // Set once the user connects or picks a wallet: the stored active wallet
  // and selection are older than that choice, so hydration must not apply
  // them over it.
  let userChose = false;

  const choose = (event: WalletEvent) => {
    const before = getState();
    dispatch(event);
    if (getState() !== before) {
      userChose = true;
    }
  };

  const restore = async (connectorId: string): Promise<RestoreResult | null> => {
    const adapter = findAdapter(connectorId);
    if (
      adapter === undefined ||
      attempted.has(connectorId) ||
      !getState().dormant.has(connectorId)
    ) {
      return null;
    }
    attempted.add(connectorId);
    try {
      await withTimeout(adapter.connect({ silent: true }), RESTORE_TIMEOUT_MS);
      const accounts = await adapter.getAccounts();
      const [account] = accounts;
      if (account === undefined) {
        throw new ConnectionError("NotConnected", `${adapter.name} exposed no accounts`);
      }
      const wallet: ConnectedWallet = { account, accounts, connector: adapter };
      const before = getState();
      dispatch({ connectorId, entry: wallet, type: "ENTRY_RESTORED" });
      if (getState() === before) {
        // The user acted on this wallet mid-reconnect. If they disconnected
        // it, close the session the silent reconnect just reopened.
        if (!before.pool.has(connectorId)) {
          await teardown(adapter);
        }
        return null;
      }
      safely("onConnect", config.onConnect, wallet, { reconnected: true });
      return { connectorId, ok: true };
    } catch (error) {
      dispatch({ connectorId, type: "RESTORE_FAILED" });
      return { connectorId, error: toConnectionError(error), ok: false };
    }
  };

  const restoreLate = async (connectorId: string) => {
    const result = await restore(connectorId);
    if (result?.ok === false) {
      logWarn(`[butr] silent reconnect failed for ${connectorId}:`, result.error);
    }
  };

  const hydrate = async () => {
    let persisted = EMPTY_PERSISTED;
    try {
      persisted = await storage.load();
    } catch (error) {
      reportStorageError(error);
    }
    dispatch({
      entries: persisted.pool,
      isUserDisconnected: persisted.isUserDisconnected,
      type: "STORAGE_LOADED",
    });
    loaded = true;

    const ids = [...getState().dormant.keys()];
    const restores = ids.map(restore);
    // Read before awaiting: an adapter announced mid-pass is restored by
    // `register`, and still belongs in the outcome as pending.
    const pendingIds = ids.filter((id) => !attempted.has(id));
    const settled = await Promise.all(restores);
    const results = settled.filter((result) => result !== null);
    dispatch({
      activeConnectorId: userChose ? null : persisted.activeConnectorId,
      selection: userChose ? {} : persisted.selection,
      type: "HYDRATED",
    });
    persistEnabled = true;
    void persist();

    const outcome: HydrationOutcome = {
      dropped: results.flatMap((result) =>
        result.ok ? [] : [{ connectorId: result.connectorId, reason: result.error }],
      ),
      pendingIds,
      restoredIds: results.flatMap((result) => (result.ok ? [result.connectorId] : [])),
    };
    if (config.onHydrated) {
      safely("onHydrated", config.onHydrated, outcome);
    } else {
      for (const { connectorId, reason } of outcome.dropped) {
        logWarn(`[butr] silent reconnect failed for ${connectorId}:`, reason);
      }
    }
  };

  const register = (adapter: WalletAdapter) => {
    const before = getState();
    dispatch({ adapter, type: "ADAPTER_REGISTERED" });
    if (loaded && getState() !== before) {
      void restoreLate(adapter.id);
    }
  };

  const subscribeSource = (source: NonNullable<WalletManagerConfig["sources"]>[number]) => {
    try {
      return source(register);
    } catch (error) {
      logError("[butr] a wallet source threw on subscribe:", error);
      return () => {};
    }
  };

  return {
    clearConnectionError: () => {
      dispatch({ type: "STATUS_RESET" });
    },

    connect: async (connectorId) => {
      dispatch({ connectorId, type: "CONNECT_STARTED" });
      const slowTimer = config.onSlowConnect
        ? setTimeout(() => {
            safely("onSlowConnect", config.onSlowConnect, connectorId);
          }, config.slowConnectThresholdMs ?? DEFAULT_SLOW_CONNECT_THRESHOLD_MS)
        : undefined;
      const connector = findAdapter(connectorId);
      try {
        if (connector === undefined) {
          throw new ConnectionError(
            "WalletNotFound",
            `No wallet adapter is registered as "${connectorId}"`,
          );
        }
        await withTimeout(connector.connect(), CONNECT_TIMEOUT_MS);
        const accounts = await connector.getAccounts();
        const [account] = accounts;
        if (account === undefined) {
          throw new ConnectionError("NotConnected", `${connector.name} exposed no accounts`);
        }
        const wallet: ConnectedWallet = { account, accounts, connector };
        choose({ connectorId, entry: wallet, type: "CONNECT_SUCCEEDED" });
        safely("onConnect", config.onConnect, wallet, { reconnected: false });
        return wallet;
      } catch (error) {
        const failure = toConnectionError(error);
        dispatch({ connectorId, error: failure, type: "CONNECT_FAILED" });
        // Leave an already-live session alone: a failed re-connect of a
        // connected wallet must not disconnect it.
        if (connector !== undefined && getState().pool.get(connectorId)?.connector !== connector) {
          await teardown(connector);
        }
        safely("onConnectError", config.onConnectError, failure, connectorId);
        throw failure;
      } finally {
        clearTimeout(slowTimer);
      }
    },

    disconnect: (connectorId) => {
      const wallet = getState().pool.get(connectorId);
      dispatch({ byUser: true, connectorId, type: "DISCONNECTED" });
      if (wallet !== undefined) {
        void teardown(wallet.connector);
        safely("onDisconnect", config.onDisconnect, wallet, { byUser: true });
      }
    },

    disconnectAll: () => {
      const wallets = [...getState().pool.values()];
      dispatch({ type: "RESET" });
      for (const wallet of wallets) {
        void teardown(wallet.connector);
        safely("onDisconnect", config.onDisconnect, wallet, { byUser: true });
      }
    },

    getInitialState: store.getInitialState,
    getState,

    requestAccounts: async (connectorId) => {
      const connector = getState().pool.get(connectorId)?.connector;
      if (connector?.requestAccounts === undefined) {
        return;
      }
      await connector.requestAccounts();
      const accounts = await connector.getAccounts();
      dispatch({ accounts, connectorId, type: "ACCOUNTS_CHANGED" });
    },

    setAccount: (connectorId, account) => {
      const wallet = getState().pool.get(connectorId);
      if (wallet === undefined) {
        return;
      }
      // An account on another chain means the wallet moved; carry the rest of
      // its accounts to that chain so the list stays single-chain.
      const onChain = wallet.accounts.map((a) =>
        a.chain.id === account.chain.id ? a : buildAccount(a.walletAddress, account.chain),
      );
      const accounts = onChain.some((a) => a.id === account.id) ? onChain : [...onChain, account];
      dispatch({ accounts, active: account, connectorId, type: "ACCOUNTS_CHANGED" });
    },

    setActive: (connectorId) => {
      choose({ connectorId, type: "ACTIVE_CHANGED" });
    },

    setSelection: (chainPlatform, connectorId) => {
      choose({ chainPlatform, connectorId, type: "SELECTION_CHANGED" });
    },

    start: () => {
      const unsubscribes = (config.sources ?? []).map(subscribeSource);
      lifecycle.sync(getState().pool);
      const unsubscribePool = store.subscribe((state, prev) => {
        if (state.pool !== prev.pool) {
          lifecycle.sync(state.pool);
        }
      });
      hydration ??= hydrate();
      return () => {
        for (const unsubscribe of unsubscribes) {
          try {
            unsubscribe();
          } catch (error) {
            logWarn("[butr] a wallet source threw on unsubscribe:", error);
          }
        }
        unsubscribePool();
        lifecycle.detachAll();
      };
    },

    subscribe: store.subscribe,
  };
};

export type { WalletManager };
export { createWalletManager };
