import type {
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletSnapshot,
} from "../storage/persistence";
import { toStoredPoolEntry } from "../storage/wallet-state-codec";
import type { Account, ChainPlatform, ConnectedWallet, WalletAdapter } from "../types";
import type { ConnectionError } from "../types/errors";
import type { WalletState } from "../types/manager";
import { accountsEqual } from "../wallet-equal";

import { applyStoredSelection, snapshotState, storedEntries } from "./persisted-state";
import { isShadowAdapter } from "./shadow-adapter";

/** The store's state: `WalletState` plus what only the reducer reads. */
type StoreState = WalletState & {
  /** The user connected or picked the active wallet or a selection. The
   *  stored preferences predate that choice, so `HYDRATED` keeps it. */
  userChose: boolean;
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

const initialState: StoreState = {
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
  userChose: false,
};

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

const keepEntries = <K, V>(
  map: ReadonlyMap<K, V>,
  keep: (key: K, value: V) => boolean,
): ReadonlyMap<K, V> => {
  const kept = [...map].filter(([key, value]) => keep(key, value));
  return kept.length === map.size ? map : new Map(kept);
};

const sameEntries = <K, V>(a: ReadonlyMap<K, V>, b: ReadonlyMap<K, V>): boolean =>
  a.size === b.size && [...a].every(([key, value]) => b.get(key) === value);

const reconcileReconnectingIds = (
  reconnectingIds: ReadonlySet<string>,
  pool: ReadonlyMap<string, ConnectedWallet>,
): ReadonlySet<string> => {
  const shadowIds = [...pool].flatMap(([id, wallet]) =>
    isShadowAdapter(wallet.connector) ? [id] : [],
  );
  return shadowIds.length === reconnectingIds.size &&
    shadowIds.every((id) => reconnectingIds.has(id))
    ? reconnectingIds
    : new Set(shadowIds);
};

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
const reconcile = (state: StoreState): StoreState => {
  const { pool } = state;
  const reconnectingIds = reconcileReconnectingIds(state.reconnectingIds, pool);
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

const changeAccounts = (
  state: StoreState,
  event: Extract<WalletEvent, { type: "ACCOUNTS_CHANGED" }>,
): StoreState => {
  const wallet = state.pool.get(event.connectorId);
  const first = event.accounts.at(0);
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

const apply = (state: StoreState, event: WalletEvent): StoreState => {
  switch (event.type) {
    case "ADAPTER_REGISTERED": {
      if (state.adapters.some((adapter) => adapter.id === event.adapter.id)) {
        return state;
      }
      return { ...state, adapters: [...state.adapters, event.adapter] };
    }

    case "STORAGE_LOADED": {
      return {
        ...state,
        dormant: new Map([...state.dormant, ...storedEntries(event.entries)]),
        isUserDisconnected: event.isUserDisconnected,
      };
    }

    case "ENTRY_RESTORED": {
      // No longer dormant means the user connected or disconnected it while
      // the silent reconnect was in flight; their action wins.
      if (!state.dormant.has(event.connectorId)) {
        return state;
      }
      return { ...state, pool: withEntry(state.pool, event.connectorId, event.entry) };
    }

    case "RESTORE_FAILED": {
      // A failed seed is still a shadow whose every method rejects; leaving it
      // would strand a permanently reconnecting wallet in the pool.
      if (!state.reconnectingIds.has(event.connectorId)) {
        return state;
      }
      return { ...state, pool: withoutKey(state.pool, event.connectorId) };
    }

    case "HYDRATED": {
      if (state.userChose) {
        return { ...state, isHydrated: true };
      }
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
        // A reconnect of a wallet already in the pool must not steal the
        // platform from whichever wallet the user selected.
        selection: state.pool.has(connectorId)
          ? state.selection
          : withEntry(state.selection, entry.connector.chainPlatform, connectorId),
        userChose: true,
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
      const stored = toStoredPoolEntry(wallet);
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
      return { ...state, activeConnectorId: event.connectorId, userChose: true };
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
        userChose: true,
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
const reducer = (state: StoreState, event: WalletEvent): StoreState => {
  const next = apply(state, event);
  return next === state ? state : reconcile(next);
};

/**
 * `isHydrated` is true from the first render on this path, so
 * `reconnectingIds` says whether a connection is verified.
 */
const seededState = (snapshot: WalletSnapshot): StoreState =>
  reconcile({ ...initialState, ...snapshotState(snapshot), isHydrated: true });

export type { StoreState, WalletEvent };
export { initialState, reconcile, reducer, seededState };
