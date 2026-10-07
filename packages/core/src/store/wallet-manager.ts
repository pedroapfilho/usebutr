import type { StoreApi } from "zustand/vanilla";
import { createStore } from "zustand/vanilla";

import { logError, logWarn } from "../logger";
import type { WalletSnapshot } from "../storage/persistence";
import { EMPTY_PERSISTED } from "../storage/wallet-state-codec";
import { createWalletStorage } from "../storage/wallet-storage";
import type {
  Account,
  ChainPlatform,
  ConnectedWallet,
  HydrationOutcome,
  WalletAdapter,
  WalletManagerConfig,
} from "../types";
import { ConnectionError, toConnectionError } from "../types/errors";
import type { WalletState } from "../types/manager";

import { createConnectorLifecycle } from "./connector-lifecycle";
import { persistedStateChanged, toPersistedState } from "./persisted-state";
import type { StoreState, WalletEvent } from "./reducer";
import { initialState, reducer, seededState } from "./reducer";

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
   *  for wallets without `requestAccounts`. Rejects with a `NotConnected`
   *  `ConnectionError` when the wallet then exposes no accounts. */
  requestAccounts: (connectorId: string) => Promise<void>;
  /** Selects an exposed account without changing its chain or the account
   *  list. Unknown wallets and accounts are ignored. */
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

/** `"restoring"`: storage is loaded and its entries are reconnecting. */
type HydrationPhase = "idle" | "loading" | "restoring" | "done";

const toError = (cause: unknown): Error =>
  cause instanceof Error ? cause : new Error(String(cause));

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

/** The accounts `connector` exposes, active first. None means it is not
 *  connected, whichever call asked. */
const readAccounts = async (
  connector: WalletAdapter,
): Promise<Pick<ConnectedWallet, "account" | "accounts">> => {
  const accounts = await connector.getAccounts();
  const account = accounts.at(0);
  if (account === undefined) {
    throw new ConnectionError("NotConnected", `${connector.name} exposed no accounts`);
  }
  return { account, accounts };
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
  const storage = config.storage ?? createWalletStorage();
  const store = createStore<StoreState>()(() =>
    options.initialState ? seededState(options.initialState) : initialState,
  );
  const { getState } = store;

  /** True when `event` changed the state, i.e. the reducer accepted it. */
  const dispatch = (event: WalletEvent): boolean => {
    const state = getState();
    const next = reducer(state, event);
    store.setState(next, true);
    return next !== state;
  };

  const findAdapter = (connectorId: string) =>
    getState().adapters.find((adapter) => adapter.id === connectorId);

  const reportStorageError = (cause: unknown) => {
    if (config.onStorageError) {
      safely("onStorageError", config.onStorageError, toError(cause));
    } else {
      logWarn("[butr] wallet persistence failed:", cause);
    }
  };

  let hydration: HydrationPhase = "idle";

  // Persistence: a pure function of state, written after every change once
  // hydration is done. Saves are coalesced so an async driver never writes
  // an older state after a newer one.
  let saving: "idle" | "busy" | "stale" = "idle";
  const persist = async () => {
    if (saving !== "idle") {
      saving = "stale";
      return;
    }
    saving = "stale";
    while (saving === "stale") {
      saving = "busy";
      try {
        await storage.save(toPersistedState(getState()));
      } catch (error) {
        reportStorageError(error);
      }
    }
    saving = "idle";
  };
  store.subscribe((state, prev) => {
    if (hydration === "done" && persistedStateChanged(state, prev)) {
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

  // Discovery caches an adapter and hands it back on the next connect, so a
  // session the pool does not hold must not stay open on it.
  const closeUnlessPooled = async (connector: WalletAdapter) => {
    if (getState().pool.get(connector.id)?.connector !== connector) {
      await teardown(connector);
    }
  };

  /**
   * The one way a session opens. A failure closes it unless the pool holds
   * it, except a declined silent connect: that opened nothing, and closing
   * would revoke the permission (EVM) or shared session (WalletConnect).
   */
  const openSession = async (
    connector: WalletAdapter,
    { silent }: { silent: boolean },
  ): Promise<ConnectedWallet> => {
    try {
      await withTimeout(
        silent ? connector.connect({ silent }) : connector.connect(),
        silent ? RESTORE_TIMEOUT_MS : CONNECT_TIMEOUT_MS,
      );
    } catch (error) {
      const failure = toConnectionError(error);
      if (!silent || failure.kind === "Timeout") {
        await closeUnlessPooled(connector);
      }
      throw failure;
    }
    try {
      return { ...(await readAccounts(connector)), connector };
    } catch (error) {
      await closeUnlessPooled(connector);
      throw toConnectionError(error);
    }
  };

  // Hydration: silent reconnect of every dormant entry whose adapter exists,
  // then of each late adapter the moment a source announces it.
  const restore = async (connectorId: string): Promise<RestoreResult | null> => {
    const adapter = findAdapter(connectorId);
    if (adapter === undefined || !getState().dormant.has(connectorId)) {
      return null;
    }
    try {
      const wallet = await openSession(adapter, { silent: true });
      // Rejected when the user connected or disconnected it meanwhile.
      if (!dispatch({ connectorId, entry: wallet, type: "ENTRY_RESTORED" })) {
        await closeUnlessPooled(adapter);
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
    hydration = "loading";
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
    hydration = "restoring";

    const ids = [...getState().dormant.keys()];
    // An adapter announced mid-pass is restored by `register`, and still
    // belongs in the outcome as pending.
    const pendingIds = ids.filter((id) => findAdapter(id) === undefined);
    const settled = await Promise.all(ids.map(restore));
    const results = settled.filter((result) => result !== null);
    dispatch({
      activeConnectorId: persisted.activeConnectorId,
      selection: persisted.selection,
      type: "HYDRATED",
    });
    hydration = "done";
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
    const registered = dispatch({ adapter, type: "ADAPTER_REGISTERED" });
    if (registered && (hydration === "restoring" || hydration === "done")) {
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
      try {
        const connector = findAdapter(connectorId);
        if (connector === undefined) {
          throw new ConnectionError(
            "WalletNotFound",
            `No wallet adapter is registered as "${connectorId}"`,
          );
        }
        const wallet = await openSession(connector, { silent: false });
        dispatch({ connectorId, entry: wallet, type: "CONNECT_SUCCEEDED" });
        safely("onConnect", config.onConnect, wallet, { reconnected: false });
        return wallet;
      } catch (error) {
        const failure = toConnectionError(error);
        dispatch({ connectorId, error: failure, type: "CONNECT_FAILED" });
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
      const { accounts } = await readAccounts(connector);
      dispatch({ accounts, connectorId, type: "ACCOUNTS_CHANGED" });
    },

    setAccount: (connectorId, account) => {
      const wallet = getState().pool.get(connectorId);
      const active = wallet?.accounts.find((candidate) => candidate.id === account.id);
      if (wallet === undefined || active === undefined) {
        return;
      }
      dispatch({ accounts: wallet.accounts, active, connectorId, type: "ACCOUNTS_CHANGED" });
    },

    setActive: (connectorId) => {
      dispatch({ connectorId, type: "ACTIVE_CHANGED" });
    },

    setSelection: (chainPlatform, connectorId) => {
      dispatch({ chainPlatform, connectorId, type: "SELECTION_CHANGED" });
    },

    start: () => {
      const unsubscribes = (config.sources ?? []).map(subscribeSource);
      lifecycle.sync(getState().pool);
      const unsubscribePool = store.subscribe((state, prev) => {
        if (state.pool !== prev.pool) {
          lifecycle.sync(state.pool);
        }
      });
      if (hydration === "idle") {
        void hydrate();
      }
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
