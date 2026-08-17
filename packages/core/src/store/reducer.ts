import type { Account, ChainPlatform, ConnectedWallet } from "../types";
import type { ConnectionError } from "../types/errors";

/**
 * The reducer never writes `"reconnecting"`; `useConnectionStatus`
 * derives it from `reconnectingIds` so the state machine stays narrow
 * while the public vocabulary matches wagmi's.
 */
type ConnectionStatus = "idle" | "connecting" | "success" | "error" | "reconnecting";

type State = {
  activeConnectorId: string | null;
  connectingConnectorId: string | null;
  connectionError: ConnectionError | null;
  connectionStatus: ConnectionStatus;
  isHydrated: boolean;
  isUserDisconnected: boolean;
  pool: Map<string, ConnectedWallet>;
  /**
   * Ids still backed by a shadow adapter from `initialState`. Empty
   * without `initialState`; shrinks on `HYDRATED` / `CONNECT_SUCCEEDED`
   * and on `DISCONNECTED` / `RESET`.
   */
  reconnectingIds: ReadonlySet<string>;
  selection: Map<ChainPlatform, string>;
};

/**
 * Lifecycle events: hydration, full reset, and the explicit
 * user-disconnected flag the runtime sets to suppress eager reconnect.
 */
type LifecycleEvent =
  | {
      activeConnectorId: string | null;
      /** Connector ids that were seeded from `initialState` but whose silent
       *  reconnect failed. Their pool entries are still shadow-backed, so they
       *  are evicted rather than left permanently unusable. */
      dropped: ReadonlyArray<string>;
      isUserDisconnected: boolean;
      pool: Map<string, ConnectedWallet>;
      selection: Map<ChainPlatform, string>;
      type: "HYDRATED";
    }
  | { type: "RESET" }
  | { type: "USER_DISCONNECTED_SET"; value: boolean };

/**
 * None of these mutate the pool; `CONNECT_SUCCEEDED` is the only bridge
 * across to `PoolMutationEvent`.
 */
type ConnectionStatusEvent =
  | { connectorId: string; type: "CONNECT_STARTED" }
  | { connectorId: string; entry: ConnectedWallet; type: "CONNECT_SUCCEEDED" }
  | { connectorId: string; error: ConnectionError; type: "CONNECT_FAILED" }
  | { error: ConnectionError | null; type: "ERROR_SET" }
  | { type: "STATUS_RESET" };

/**
 * Pool-mutation events: changes to the set of connected wallets and
 * their per-wallet account lists. `DISCONNECTED` removes an entry;
 * the refresh events update an existing one in-place.
 */
type PoolMutationEvent =
  | {
      /**
       * Deliberately not `CONNECT_SUCCEEDED`: discovery fires this at an
       * arbitrary time, so it must not overwrite the connect-attempt
       * status that the user's own action owns.
       */
      connectorId: string;
      entry: ConnectedWallet;
      type: "ENTRY_RESTORED";
    }
  | {
      /** When set, becomes the new active account. Used by paths that
       *  know which account should be active (wallet event, manual
       *  update). When unset, the reducer preserves the current active
       *  if it's still in `accounts`, else picks `accounts[0]`. */
      accounts: Array<Account>;
      active?: Account;
      connectorId: string;
      type: "ACCOUNTS_REFRESHED";
    }
  | { connectorId: string; type: "DISCONNECTED" }
  | { connectorId: string; type: "WALLET_REFRESHED" };

/**
 * Selection events: which connector is active, and which connector
 * serves each chain platform. Pure pointer updates; no pool mutation.
 */
type SelectionEvent =
  | { chainPlatform: ChainPlatform; connectorId: string | null; type: "SELECTION_CHANGED" }
  | { connectorId: string | null; type: "ACTIVE_CHANGED" };

/**
 * The single event type the reducer dispatches on. Grouped above by
 * concern so a reader sees the map before the cases; adding an event
 * means picking the group it belongs to.
 */
type Event = ConnectionStatusEvent | LifecycleEvent | PoolMutationEvent | SelectionEvent;

const initialState: State = {
  activeConnectorId: null,
  connectingConnectorId: null,
  connectionError: null,
  connectionStatus: "idle",
  isHydrated: false,
  isUserDisconnected: false,
  pool: new Map(),
  reconnectingIds: new Set(),
  selection: new Map(),
};

/** Find any connector in the pool serving a given platform. */
const findConnectorForPlatform = (
  pool: Map<string, ConnectedWallet>,
  chainPlatform: ChainPlatform,
): string | undefined => {
  for (const [id, wallet] of pool) {
    if (wallet.connector.chainPlatform === chainPlatform) {
      return id;
    }
  }
  return undefined;
};

/** Pure reducer: every state transition is expressed as `(state, event) => state`.
 *  No I/O, no async, no side effects. Side effects live in the runtime. */
const reducer = (state: State, event: Event): State => {
  switch (event.type) {
    case "HYDRATED": {
      const pool = new Map<string, ConnectedWallet>(state.pool);
      for (const [id, entry] of event.pool) {
        pool.set(id, entry);
      }
      // A seeded entry whose reconnect failed is still backed by a shadow
      // adapter whose every method rejects. Leaving it in the pool would strand
      // it: nothing else ever clears it, so consumers would read a permanently
      // erroring wallet that reports itself as reconnecting forever.
      for (const id of event.dropped) {
        pool.delete(id);
      }
      const selection = new Map<ChainPlatform, string>(state.selection);
      for (const [platform, id] of event.selection) {
        selection.set(platform, id);
      }
      let activeConnectorId: string | null = null;
      if (event.activeConnectorId !== null && pool.has(event.activeConnectorId)) {
        activeConnectorId = event.activeConnectorId;
      } else if (state.activeConnectorId !== null && pool.has(state.activeConnectorId)) {
        activeConnectorId = state.activeConnectorId;
      } else if (pool.size > 0) {
        activeConnectorId = pool.keys().next().value ?? null;
      }
      let nextReconnecting: ReadonlySet<string> = state.reconnectingIds;
      if (state.reconnectingIds.size > 0) {
        const next = new Set(state.reconnectingIds);
        for (const id of event.pool.keys()) {
          next.delete(id);
        }
        for (const id of event.dropped) {
          next.delete(id);
        }
        if (next.size !== state.reconnectingIds.size) {
          nextReconnecting = next;
        }
      }
      const selectionAfterDrop = new Map(selection);
      for (const [platform, id] of selectionAfterDrop) {
        if (!pool.has(id)) {
          selectionAfterDrop.delete(platform);
          const fallback = findConnectorForPlatform(pool, platform);
          if (fallback !== undefined) {
            selectionAfterDrop.set(platform, fallback);
          }
        }
      }
      return {
        ...state,
        activeConnectorId,
        isHydrated: true,
        isUserDisconnected: event.isUserDisconnected,
        pool,
        reconnectingIds: nextReconnecting,
        selection: selectionAfterDrop,
      };
    }

    case "USER_DISCONNECTED_SET": {
      return { ...state, isUserDisconnected: event.value };
    }

    case "CONNECT_STARTED": {
      return {
        ...state,
        connectingConnectorId: event.connectorId,
        connectionError: null,
        connectionStatus: "connecting",
      };
    }

    case "CONNECT_SUCCEEDED": {
      const { connectorId, entry } = event;
      const existing = state.pool.get(connectorId);

      const nextReconnecting: ReadonlySet<string> = state.reconnectingIds.has(connectorId)
        ? new Set([...state.reconnectingIds].filter((id) => id !== connectorId))
        : state.reconnectingIds;

      if (
        existing &&
        existing.account.walletAddress.toLowerCase() === entry.account.walletAddress.toLowerCase()
      ) {
        return {
          ...state,
          activeConnectorId: connectorId,
          connectingConnectorId: null,
          connectionError: null,
          connectionStatus: "success",
          pool:
            existing.connector === entry.connector
              ? state.pool
              : new Map([...state.pool, [connectorId, entry] as const]),
          reconnectingIds: nextReconnecting,
        };
      }

      const newPool = new Map([...state.pool, [connectorId, entry] as const]);
      const newSelection = new Map([
        ...state.selection,
        [entry.connector.chainPlatform, connectorId] as const,
      ]);

      return {
        ...state,
        activeConnectorId: connectorId,
        connectingConnectorId: null,
        connectionError: null,
        connectionStatus: "success",
        pool: newPool,
        reconnectingIds: nextReconnecting,
        selection: newSelection,
      };
    }

    case "ENTRY_RESTORED": {
      const { connectorId, entry } = event;
      const nextReconnecting: ReadonlySet<string> = state.reconnectingIds.has(connectorId)
        ? new Set([...state.reconnectingIds].filter((id) => id !== connectorId))
        : state.reconnectingIds;

      const platform = entry.connector.chainPlatform;
      const selection = state.selection.has(platform)
        ? state.selection
        : new Map([...state.selection, [platform, connectorId] as const]);

      return {
        ...state,
        // Only adopt the restored wallet as active when nothing else is. A
        // background restore must not steal focus from an explicit selection
        // or from the seeded active id.
        activeConnectorId: state.activeConnectorId ?? connectorId,
        pool: new Map([...state.pool, [connectorId, entry] as const]),
        reconnectingIds: nextReconnecting,
        selection,
      };
    }

    case "CONNECT_FAILED": {
      // Ignore a failure from a superseded attempt; only the connect currently
      // in flight owns the status triple.
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

    case "DISCONNECTED": {
      const wallet = state.pool.get(event.connectorId);
      if (!wallet) {
        return state;
      }

      const newPool = new Map(state.pool);
      newPool.delete(event.connectorId);

      const newSelection = new Map(state.selection);
      const platform = wallet.connector.chainPlatform;
      if (newSelection.get(platform) === event.connectorId) {
        newSelection.delete(platform);
        const fallback = findConnectorForPlatform(newPool, platform);
        if (fallback !== undefined) {
          newSelection.set(platform, fallback);
        }
      }

      const firstId = newPool.keys().next();
      const activeConnectorId =
        state.activeConnectorId === event.connectorId
          ? (firstId.value ?? null)
          : state.activeConnectorId;

      const nextReconnecting: ReadonlySet<string> = state.reconnectingIds.has(event.connectorId)
        ? new Set([...state.reconnectingIds].filter((id) => id !== event.connectorId))
        : state.reconnectingIds;

      return {
        ...state,
        activeConnectorId,
        pool: newPool,
        reconnectingIds: nextReconnecting,
        selection: newSelection,
      };
    }

    case "ACCOUNTS_REFRESHED": {
      const wallet = state.pool.get(event.connectorId);
      if (!wallet) {
        return state;
      }
      let nextAccount: Account;
      if (event.active) {
        nextAccount = event.active;
      } else {
        const stillHasCurrent = event.accounts.some(
          (a) =>
            a.walletAddress === wallet.account.walletAddress &&
            a.chain.id === wallet.account.chain.id,
        );
        nextAccount = stillHasCurrent ? wallet.account : (event.accounts[0] ?? wallet.account);
      }
      const sameAccount =
        nextAccount.walletAddress === wallet.account.walletAddress &&
        nextAccount.chain.id === wallet.account.chain.id;
      const sameAccountsShape =
        event.accounts.length === wallet.accounts.length &&
        event.accounts.every((a, i) => a.walletAddress === wallet.accounts[i]?.walletAddress);
      if (sameAccount && sameAccountsShape) {
        return state;
      }
      const updated: ConnectedWallet = {
        ...wallet,
        account: nextAccount,
        accounts: [...event.accounts],
      };
      const newPool = new Map([...state.pool, [event.connectorId, updated] as const]);
      return { ...state, pool: newPool };
    }

    case "WALLET_REFRESHED": {
      const wallet = state.pool.get(event.connectorId);
      if (!wallet) {
        return state;
      }
      const newPool = new Map([...state.pool, [event.connectorId, { ...wallet }] as const]);
      return { ...state, pool: newPool };
    }

    case "ACTIVE_CHANGED": {
      return { ...state, activeConnectorId: event.connectorId };
    }

    case "SELECTION_CHANGED": {
      const newSelection = new Map(state.selection);
      if (event.connectorId === null) {
        newSelection.delete(event.chainPlatform);
      } else {
        newSelection.set(event.chainPlatform, event.connectorId);
      }
      return { ...state, selection: newSelection };
    }

    case "STATUS_RESET": {
      return {
        ...state,
        connectingConnectorId: null,
        connectionError: null,
        connectionStatus: "idle",
      };
    }

    case "ERROR_SET": {
      return {
        ...state,
        connectionError: event.error,
        connectionStatus: event.error ? "error" : "idle",
      };
    }

    case "RESET": {
      return {
        ...initialState,
        isHydrated: state.isHydrated,
        isUserDisconnected: true,
        reconnectingIds: new Set(),
      };
    }

    default: {
      const exhaustiveCheck: never = event;
      void exhaustiveCheck;
      return state;
    }
  }
};

export type {
  ConnectionStatus,
  ConnectionStatusEvent,
  Event,
  LifecycleEvent,
  PoolMutationEvent,
  SelectionEvent,
  State,
};
export { initialState, reducer };
