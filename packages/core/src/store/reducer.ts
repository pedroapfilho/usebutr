import type {
  StoredPoolEntry,
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletSnapshot,
} from "../storage/persistence";
import type { Account, ChainPlatform, ConnectedWallet, WalletAdapter } from "../types";
import type { ConnectionError } from "../types/errors";
import { isChainPlatform } from "../types/platform";
import { accountsEqual } from "../wallet-equal";

import { createShadowAdapter } from "./shadow-adapter";

/** Status of the latest `connect` attempt, not of the connection itself;
 *  `useConnectionStatus` derives the latter. */
type ConnectStatus = "idle" | "connecting" | "success" | "error";

type WalletState = {
  activeConnectorId: string | null;
  /** Every adapter the sources announced, in announcement order. */
  adapters: ReadonlyArray<WalletAdapter>;
  connectingConnectorId: string | null;
  connectionError: ConnectionError | null;
  connectionStatus: ConnectStatus;
  /**
   * Persisted connections that are not live: awaiting their adapter, failed
   * their silent reconnect, or ended by the wallet rather than the user.
   * They stay persisted so the next load retries them.
   */
  dormant: ReadonlyMap<string, StoredPoolEntry>;
  isHydrated: boolean;
  isUserDisconnected: boolean;
  pool: ReadonlyMap<string, ConnectedWallet>;
  /** Pool ids still backed by a shadow adapter seeded from `initialState`. */
  reconnectingIds: ReadonlySet<string>;
  /** Which pool entry serves each platform present in the pool. */
  selection: ReadonlyMap<ChainPlatform, string>;
};

type WalletEvent =
  | { adapter: WalletAdapter; type: "ADAPTER_REGISTERED" }
  | { entries: StoredPoolRecord; isUserDisconnected: boolean; type: "STORAGE_LOADED" }
  | { connectorId: string; entry: ConnectedWallet; type: "ENTRY_RESTORED" }
  | { connectorId: string; type: "RESTORE_FAILED" }
  | { activeConnectorId: string | null; selection: StoredSelectionRecord; type: "HYDRATED" }
  | { connectorId: string; type: "CONNECT_STARTED" }
  | { connectorId: string; entry: ConnectedWallet; type: "CONNECT_SUCCEEDED" }
  | { connectorId: string; error: ConnectionError; type: "CONNECT_FAILED" }
  | { type: "STATUS_RESET" }
  | {
      accounts: ReadonlyArray<Account>;
      /** Becomes the active account. Omitted, the current one is kept while
       *  still exposed, else the first. */
      active?: Account;
      connectorId: string;
      type: "ACCOUNTS_CHANGED";
    }
  | { byUser: boolean; connectorId: string; type: "DISCONNECTED" }
  | { type: "RESET" }
  | { connectorId: string; type: "ACTIVE_CHANGED" }
  | { chainPlatform: ChainPlatform; connectorId: string; type: "SELECTION_CHANGED" };

const initialState: WalletState = {
  activeConnectorId: null,
  adapters: [],
  connectingConnectorId: null,
  connectionError: null,
  connectionStatus: "idle",
  dormant: new Map(),
  isHydrated: false,
  isUserDisconnected: false,
  pool: new Map(),
  reconnectingIds: new Set(),
  selection: new Map(),
};

const toStoredEntry = (connectorId: string, wallet: ConnectedWallet): StoredPoolEntry => ({
  account: wallet.account,
  accounts: wallet.accounts,
  chainPlatform: wallet.connector.chainPlatform,
  connectorId,
  icon: wallet.connector.icon,
  name: wallet.connector.name,
});

const withEntry = <K, V>(map: ReadonlyMap<K, V>, key: K, value: V): ReadonlyMap<K, V> =>
  new Map(map).set(key, value);

const withoutKey = <K, V>(map: ReadonlyMap<K, V>, key: K): ReadonlyMap<K, V> => {
  if (!map.has(key)) {
    return map;
  }
  const next = new Map(map);
  next.delete(key);
  return next;
};

const withoutId = (set: ReadonlySet<string>, id: string): ReadonlySet<string> => {
  if (!set.has(id)) {
    return set;
  }
  const next = new Set(set);
  next.delete(id);
  return next;
};

const keepEntries = <K, V>(
  map: ReadonlyMap<K, V>,
  keep: (key: K, value: V) => boolean,
): ReadonlyMap<K, V> => {
  const kept = [...map].filter(([key, value]) => keep(key, value));
  return kept.length === map.size ? map : new Map(kept);
};

const keepIds = (set: ReadonlySet<string>, keep: (id: string) => boolean): ReadonlySet<string> => {
  const kept = [...set].filter(keep);
  return kept.length === set.size ? set : new Set(kept);
};

const sameEntries = <K, V>(a: ReadonlyMap<K, V>, b: ReadonlyMap<K, V>): boolean =>
  a.size === b.size && [...a].every(([key, value]) => b.get(key) === value);

const reconcileSelection = (
  selection: ReadonlyMap<ChainPlatform, string>,
  pool: ReadonlyMap<string, ConnectedWallet>,
): ReadonlyMap<ChainPlatform, string> => {
  const next = new Map<ChainPlatform, string>();
  for (const [platform, id] of selection) {
    if (pool.get(id)?.connector.chainPlatform === platform) {
      next.set(platform, id);
    }
  }
  for (const [id, wallet] of pool) {
    if (!next.has(wallet.connector.chainPlatform)) {
      next.set(wallet.connector.chainPlatform, id);
    }
  }
  return sameEntries(next, selection) ? selection : next;
};

/**
 * The invariants every event relies on, enforced once after every event so
 * no case re-derives a fallback. Returns `state` itself when it already
 * holds, which keeps zustand from notifying.
 */
const reconcile = (state: WalletState): WalletState => {
  const { pool } = state;
  const reconnectingIds = keepIds(state.reconnectingIds, (id) => pool.has(id));
  const dormant = keepEntries(state.dormant, (id) => !pool.has(id) || reconnectingIds.has(id));
  const selection = reconcileSelection(state.selection, pool);
  const activeConnectorId =
    state.activeConnectorId !== null && pool.has(state.activeConnectorId)
      ? state.activeConnectorId
      : (pool.keys().next().value ?? null);

  if (
    reconnectingIds === state.reconnectingIds &&
    dormant === state.dormant &&
    selection === state.selection &&
    activeConnectorId === state.activeConnectorId
  ) {
    return state;
  }
  return { ...state, activeConnectorId, dormant, reconnectingIds, selection };
};

const applyStoredSelection = (
  selection: ReadonlyMap<ChainPlatform, string>,
  stored: StoredSelectionRecord,
  pool: ReadonlyMap<string, ConnectedWallet>,
): ReadonlyMap<ChainPlatform, string> => {
  let next = selection;
  for (const [platform, id] of Object.entries(stored)) {
    if (
      isChainPlatform(platform) &&
      id !== undefined &&
      pool.get(id)?.connector.chainPlatform === platform
    ) {
      next = withEntry(next, platform, id);
    }
  }
  return next;
};

const changeAccounts = (
  state: WalletState,
  event: Extract<WalletEvent, { type: "ACCOUNTS_CHANGED" }>,
): WalletState => {
  const wallet = state.pool.get(event.connectorId);
  const [first] = event.accounts;
  if (wallet === undefined || first === undefined) {
    return state;
  }
  const account = event.active ?? event.accounts.find((a) => a.id === wallet.account.id) ?? first;
  if (account.id === wallet.account.id && accountsEqual(event.accounts, wallet.accounts)) {
    return state;
  }
  const updated: ConnectedWallet = { ...wallet, account, accounts: event.accounts };
  return { ...state, pool: withEntry(state.pool, event.connectorId, updated) };
};

const apply = (state: WalletState, event: WalletEvent): WalletState => {
  switch (event.type) {
    case "ADAPTER_REGISTERED": {
      if (state.adapters.some((adapter) => adapter.id === event.adapter.id)) {
        return state;
      }
      return { ...state, adapters: [...state.adapters, event.adapter] };
    }

    case "STORAGE_LOADED": {
      const dormant = new Map(state.dormant);
      for (const [id, entry] of Object.entries(event.entries)) {
        if (entry !== undefined) {
          dormant.set(id, entry);
        }
      }
      return { ...state, dormant, isUserDisconnected: event.isUserDisconnected };
    }

    case "ENTRY_RESTORED": {
      // No longer dormant means the user connected or disconnected it while
      // the silent reconnect was in flight; their action wins.
      if (!state.dormant.has(event.connectorId)) {
        return state;
      }
      return {
        ...state,
        pool: withEntry(state.pool, event.connectorId, event.entry),
        reconnectingIds: withoutId(state.reconnectingIds, event.connectorId),
      };
    }

    case "RESTORE_FAILED": {
      // A failed seed is still a shadow whose every method rejects; leaving it
      // would strand a permanently reconnecting wallet in the pool.
      if (!state.reconnectingIds.has(event.connectorId)) {
        return state;
      }
      return {
        ...state,
        pool: withoutKey(state.pool, event.connectorId),
        reconnectingIds: withoutId(state.reconnectingIds, event.connectorId),
      };
    }

    case "HYDRATED": {
      const preferred = event.activeConnectorId;
      return {
        ...state,
        activeConnectorId:
          preferred !== null && state.pool.has(preferred) ? preferred : state.activeConnectorId,
        isHydrated: true,
        selection: applyStoredSelection(state.selection, event.selection, state.pool),
      };
    }

    case "CONNECT_STARTED": {
      return {
        ...state,
        connectingConnectorId: event.connectorId,
        connectionError: null,
        connectionStatus: "connecting",
        isUserDisconnected: false,
      };
    }

    case "CONNECT_SUCCEEDED": {
      const { connectorId, entry } = event;
      const isCurrentAttempt = state.connectingConnectorId === connectorId;
      return {
        ...state,
        activeConnectorId: connectorId,
        ...(isCurrentAttempt && {
          connectingConnectorId: null,
          connectionError: null,
          connectionStatus: "success" as const,
        }),
        pool: withEntry(state.pool, connectorId, entry),
        reconnectingIds: withoutId(state.reconnectingIds, connectorId),
        // A reconnect of a wallet already in the pool must not steal the
        // platform from whichever wallet the user selected.
        selection: state.pool.has(connectorId)
          ? state.selection
          : withEntry(state.selection, entry.connector.chainPlatform, connectorId),
      };
    }

    case "CONNECT_FAILED": {
      if (state.connectingConnectorId !== event.connectorId) {
        return state;
      }
      return {
        ...state,
        connectingConnectorId: null,
        connectionError: event.error,
        connectionStatus: "error",
      };
    }

    case "STATUS_RESET": {
      if (state.connectionStatus === "idle") {
        return state;
      }
      return {
        ...state,
        connectingConnectorId: null,
        connectionError: null,
        connectionStatus: "idle",
      };
    }

    case "ACCOUNTS_CHANGED": {
      return changeAccounts(state, event);
    }

    case "DISCONNECTED": {
      const pool = withoutKey(state.pool, event.connectorId);
      if (event.byUser) {
        // Disconnecting the last live wallet forgets everything, including
        // connections that were only waiting to be retried.
        const dormant =
          pool.size === 0
            ? keepEntries(state.dormant, () => false)
            : withoutKey(state.dormant, event.connectorId);
        if (pool === state.pool && dormant === state.dormant && state.isUserDisconnected) {
          return state;
        }
        return { ...state, dormant, isUserDisconnected: true, pool };
      }
      const wallet = state.pool.get(event.connectorId);
      if (wallet === undefined) {
        return state;
      }
      // The wallet ended the session (locked, removed): keep it persisted so
      // the next load can retry it.
      const stored = toStoredEntry(event.connectorId, wallet);
      return { ...state, dormant: withEntry(state.dormant, event.connectorId, stored), pool };
    }

    case "RESET": {
      return {
        ...initialState,
        adapters: state.adapters,
        isHydrated: state.isHydrated,
        isUserDisconnected: true,
      };
    }

    case "ACTIVE_CHANGED": {
      if (state.activeConnectorId === event.connectorId || !state.pool.has(event.connectorId)) {
        return state;
      }
      return { ...state, activeConnectorId: event.connectorId };
    }

    case "SELECTION_CHANGED": {
      if (
        state.selection.get(event.chainPlatform) === event.connectorId ||
        state.pool.get(event.connectorId)?.connector.chainPlatform !== event.chainPlatform
      ) {
        return state;
      }
      return {
        ...state,
        selection: withEntry(state.selection, event.chainPlatform, event.connectorId),
      };
    }

    default: {
      const exhaustive: never = event;
      void exhaustive;
      return state;
    }
  }
};

/** Pure: `(state, event) => state`. Side effects live in the manager. */
const reducer = (state: WalletState, event: WalletEvent): WalletState => {
  const next = apply(state, event);
  return next === state ? state : reconcile(next);
};

/**
 * `isHydrated` is true from the first render on this path, so
 * `reconnectingIds` says whether a connection is verified. Seeded entries
 * are also dormant: persisted, not yet live.
 */
const stateFromSnapshot = (snapshot: WalletSnapshot): WalletState => {
  const pool = new Map<string, ConnectedWallet>();
  const dormant = new Map<string, StoredPoolEntry>();
  for (const [connectorId, entry] of Object.entries(snapshot.pool)) {
    if (entry !== undefined) {
      pool.set(connectorId, {
        account: entry.account,
        accounts: entry.accounts,
        connector: createShadowAdapter(entry),
      });
      dormant.set(connectorId, entry);
    }
  }
  return reconcile({
    ...initialState,
    activeConnectorId: snapshot.activeConnectorId,
    dormant,
    isHydrated: true,
    pool,
    reconnectingIds: new Set(pool.keys()),
    selection: applyStoredSelection(new Map(), snapshot.selection, pool),
  });
};

export type { ConnectStatus, WalletEvent, WalletState };
export { initialState, reconcile, reducer, stateFromSnapshot, toStoredEntry };
