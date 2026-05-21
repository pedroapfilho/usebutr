import type { Account, ChainPlatform, ConnectedWallet } from "../types";
import type { ConnectionError } from "../types/errors";

type ConnectionStatus = "idle" | "connecting" | "success" | "error";

type State = {
  activeConnectorId: string | null;
  connectingConnectorId: string | null;
  connectionError: ConnectionError | null;
  connectionStatus: ConnectionStatus;
  isHydrated: boolean;
  isUserDisconnected: boolean;
  pool: Map<string, ConnectedWallet>;
  selection: Map<ChainPlatform, string>;
};

/**
 * Lifecycle events: hydration, full reset, and the explicit
 * user-disconnected flag the runtime sets to suppress eager reconnect.
 */
type LifecycleEvent =
  | {
      activeConnectorId: string | null;
      isUserDisconnected: boolean;
      pool: Map<string, ConnectedWallet>;
      selection: Map<ChainPlatform, string>;
      type: "HYDRATED";
    }
  | { type: "RESET" }
  | { type: "USER_DISCONNECTED_SET"; value: boolean };

/**
 * Connection status events: the transitions of the in-flight connect
 * attempt — start, success/failure, status/error reset. None of these
 * mutate the pool directly; `CONNECT_SUCCEEDED` is the bridge to
 * `PoolMutationEvent`.
 */
type ConnectionStatusEvent =
  | { connectorId: string; type: "CONNECT_STARTED" }
  | { connectorId: string; entry: ConnectedWallet; type: "CONNECT_SUCCEEDED" }
  | { error: ConnectionError; type: "CONNECT_FAILED" }
  | { error: ConnectionError | null; type: "ERROR_SET" }
  | { type: "STATUS_RESET" };

/**
 * Pool-mutation events: changes to the set of connected wallets and
 * their per-wallet account lists. `DISCONNECTED` removes an entry;
 * the refresh events update an existing one in-place.
 */
type PoolMutationEvent =
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
 * serves each chain platform. Pure pointer updates — no pool mutation.
 */
type SelectionEvent =
  | { chainPlatform: ChainPlatform; connectorId: string | null; type: "SELECTION_CHANGED" }
  | { connectorId: string | null; type: "ACTIVE_CHANGED" };

/**
 * The single event type the reducer dispatches on. Grouped above by
 * concern so a reader sees the map before the cases — adding an event
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
      // Merge instead of replace. CONNECT_SUCCEEDED can fire during the
      // late-restore window — discovery announces an adapter, the runtime
      // calls tryRestoreFromPending, drainPending succeeds, the reducer
      // adds the entry to state.pool — all BEFORE hydrate's outer await
      // resolves and HYDRATED dispatches. A wholesale replace at that
      // point wipes the freshly-restored late entry. Merging keeps both
      // the eager-restored entries (event.pool) and the late-restored
      // entries (state.pool).
      const pool = new Map<string, ConnectedWallet>(state.pool);
      for (const [id, entry] of event.pool) {
        pool.set(id, entry);
      }
      const selection = new Map<ChainPlatform, string>(state.selection);
      for (const [platform, id] of event.selection) {
        selection.set(platform, id);
      }
      // Prefer hydrate's activeConnectorId when valid in the merged
      // pool (matches the pre-reload selection). Fall back to any late-
      // restore-driven active if hydrate's choice didn't restore eagerly.
      let activeConnectorId: string | null = null;
      if (event.activeConnectorId && pool.has(event.activeConnectorId)) {
        activeConnectorId = event.activeConnectorId;
      } else if (state.activeConnectorId && pool.has(state.activeConnectorId)) {
        activeConnectorId = state.activeConnectorId;
      } else if (pool.size > 0) {
        activeConnectorId = pool.keys().next().value ?? null;
      }
      return {
        ...state,
        activeConnectorId,
        isHydrated: true,
        isUserDisconnected: event.isUserDisconnected,
        pool,
        selection,
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

      // Same connector + same address: only flip the status, keep object refs stable
      // so reactive selectors don't churn.
      if (
        existing &&
        existing.account.walletAddress.toLowerCase() === entry.account.walletAddress.toLowerCase()
      ) {
        return {
          ...state,
          activeConnectorId: connectorId,
          connectingConnectorId: null,
          connectionStatus: "success",
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
        connectionStatus: "success",
        pool: newPool,
        selection: newSelection,
      };
    }

    case "CONNECT_FAILED": {
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
        if (fallback) {
          newSelection.set(platform, fallback);
        }
      }

      const firstId = newPool.keys().next();
      const activeConnectorId =
        state.activeConnectorId === event.connectorId
          ? (firstId.value ?? null)
          : state.activeConnectorId;

      return {
        ...state,
        activeConnectorId,
        pool: newPool,
        selection: newSelection,
      };
    }

    case "ACCOUNTS_REFRESHED": {
      const wallet = state.pool.get(event.connectorId);
      if (!wallet) {
        return state;
      }
      // Pick the new active address. Three policies in priority order:
      //  1. Explicit `event.active` (wallet event or manual update knows
      //     what should be active).
      //  2. Preserve current active if it's still in the new list.
      //  3. Fall back to `accounts[0]` so the pool entry doesn't end up
      //     pointing at an address the wallet no longer exposes.
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
      // No-op short-circuit: when the wallet event echoes the current
      // active and the accounts array hasn't changed shape, skip the
      // Map clone so `useSyncExternalStore` subscribers don't re-render.
      // (Cheap heuristic — equality by reference for `accounts` would
      // miss content changes; we compare by length + address set.)
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
      };
    }

    default: {
      // Exhaustiveness check — TS errors if a new event type is added without a case.
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
