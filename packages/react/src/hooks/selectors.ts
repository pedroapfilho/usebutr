import type { Account, ChainPlatform, ConnectedWallet, WalletStoreState } from "@usebutr/core";
import { walletEqual } from "@usebutr/core";
import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";

import { useWalletStoreContext } from "../context";

/**
 * Selector hooks — pure reactive reads of the wallet store. Each
 * subscribes via `useSyncExternalStore` (through Zustand's `useStore`)
 * and returns the value directly; no `AsyncState` wrapper, no
 * mutation side effects.
 *
 * Three sub-groups in this file:
 *  - **Connection-state** scalars (status, error, flags)
 *  - **Pool / selection / accounts** (reactive structures)
 *  - **Stable accessors** (return functions safe for callbacks)
 *
 * The classification is "what's returned" rather than "is it async."
 * For dispatchers, see `./actions.ts`. For async resources
 * (`useSigner`, `useBalance`), see `./async-resources.ts`.
 */

const EMPTY_ACCOUNTS: ReadonlyArray<Account> = [];

const accountsEqual = (a: ReadonlyArray<Account>, b: ReadonlyArray<Account>) => {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    const x = a[i];
    const y = b[i];
    if (!x || !y) {
      return false;
    }
    if (x.walletAddress !== y.walletAddress || x.chain.id !== y.chain.id) {
      return false;
    }
  }
  return true;
};

// ============================================================================
// Connection state
// ============================================================================

/**
 * Connection status of the **active** wallet — wagmi-aligned vocabulary:
 *
 * - `"idle"` / `"connecting"` / `"success"` / `"error"` — the
 *   user-initiated connect attempt's state, as written by the
 *   reducer.
 * - `"reconnecting"` — derived. Returned when the active wallet is
 *   still backed by a shadow adapter (its connector id appears in
 *   `state.reconnectingIds`). Indicates "we have the data, the
 *   silent reconnect hasn't verified the live wallet yet."
 *
 * The derivation lives here rather than in the reducer so the state
 * machine stays a narrow tracker of the in-flight connect attempt
 * while the public hook gives consumers the broader vocabulary they
 * need to render.
 */
const useConnectionStatus = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => {
    if (state.activeConnectorId && state.reconnectingIds.has(state.activeConnectorId)) {
      return "reconnecting" as const;
    }
    return state.connectionStatus;
  });
};

/** True iff `connectionStatus === "connecting"`. */
const useIsConnecting = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.connectionStatus === "connecting");
};

/** ID of the wallet currently in the connecting flight (null when idle). */
const useConnectingConnectorId = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.connectingConnectorId);
};

/** ID of the wallet currently focused as the global active selection. */
const useActiveConnectorId = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.activeConnectorId);
};

/** Last connection error message, if any. */
const useConnectionError = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.connectionError);
};

/** True if at least one wallet is connected. */
const useWalletConnected = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.pool.size > 0);
};

/** Has the store finished its initial hydration pass? */
const useIsHydrated = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.isHydrated);
};

/** Session-scoped disconnect-intent flag. True after an explicit disconnect or
 *  reset, false after a fresh session or a new connection. Consumers use this
 *  to suppress auto-reconnect immediately after a manual disconnect. */
const useIsUserDisconnected = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.isUserDisconnected);
};

// ============================================================================
// Pool / selection / accounts
// ============================================================================

/** Full pool of connected wallets, keyed by `connectorId`. Re-renders on any pool change. */
const usePool = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.pool);
};

/** Pool projected as an array. Stable when the pool reference is stable. */
const useConnectedWallets = (): Array<ConnectedWallet> => {
  const pool = usePool();
  return useMemo(() => [...pool.values()], [pool]);
};

/** Per-platform selection: `Map<ChainPlatform, connectorId>`. */
const useSelection = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.selection);
};

/** Globally active wallet (the one in front of the user right now). */
const useActiveWallet = (): ConnectedWallet | undefined => {
  const store = useWalletStoreContext();
  return useStoreWithEqualityFn(
    store,
    (state) => (state.activeConnectorId ? state.pool.get(state.activeConnectorId) : undefined),
    walletEqual,
  );
};

/** Reactive lookup of the wallet selected for a given platform. */
const useSelectedWallet = (chainPlatform: ChainPlatform | null): ConnectedWallet | undefined => {
  const store = useWalletStoreContext();
  return useStoreWithEqualityFn(
    store,
    (state) => {
      if (!chainPlatform) {
        return undefined;
      }
      const id = state.selection.get(chainPlatform);
      return id ? state.pool.get(id) : undefined;
    },
    walletEqual,
  );
};

/** Reactive boolean: is there a selected wallet for a given platform? */
const useIsPlatformConnected = (chainPlatform: ChainPlatform): boolean => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.selection.has(chainPlatform));
};

/**
 * All known accounts on a wallet. Defaults to the active wallet when
 * `connectorId` is omitted. Re-renders only when the accounts list
 * actually changes (by address + chain id), so wallet-side
 * `accountChanged` events bridged via `Connector.subscribe` flow through
 * cleanly.
 */
const useAccounts = (connectorId?: string | null): ReadonlyArray<Account> => {
  const store = useWalletStoreContext();
  return useStoreWithEqualityFn(
    store,
    (state) => {
      const id = connectorId ?? state.activeConnectorId;
      const wallet = id ? state.pool.get(id) : undefined;
      return wallet ? wallet.accounts : EMPTY_ACCOUNTS;
    },
    accountsEqual,
  );
};

/**
 * Subscribe to the pool entry for a `connectorId`. Defaults to the
 * active wallet when omitted. Re-renders only when the resolved
 * wallet's identity (connectorId / address / chainId) changes.
 *
 * This used to live alongside the async hooks because `useSigner` /
 * `useBalance` consume it internally; it belongs with the other
 * selectors since its return shape is `ConnectedWallet | undefined`
 * with no async wrapper.
 */
const useWalletEntry = (connectorId: string | null | undefined): ConnectedWallet | undefined => {
  const store = useWalletStoreContext();
  return useStoreWithEqualityFn(
    store,
    (state) => {
      const id = connectorId ?? state.activeConnectorId;
      return id ? state.pool.get(id) : undefined;
    },
    walletEqual,
  );
};

// ============================================================================
// Stable accessors (return functions; safe to use in callbacks)
// ============================================================================

/** Stable accessor: `(connectorId) => ConnectedWallet | undefined`. */
const useGetWallet = () => {
  const store = useWalletStoreContext();
  return useCallback((connectorId: string) => store.getState().pool.get(connectorId), [store]);
};

/** Stable accessor: `(platform) => ConnectedWallet | undefined`. */
const useGetSelectedWallet = () => {
  const store = useWalletStoreContext();
  return useCallback(
    (chainPlatform: ChainPlatform) => {
      const state = store.getState();
      const id = state.selection.get(chainPlatform);
      return id ? state.pool.get(id) : undefined;
    },
    [store],
  );
};

/** Stable accessor for raw connector instances. */
const useGetConnectorInstance = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.getConnectorInstance);
};

// ============================================================================
// Direct store access (escape hatch)
// ============================================================================

/**
 * Direct access to the Zustand store for custom selectors. Uses shallow
 * equality on the selector result, so returning an inline object or array
 * is safe — no infinite re-render loop. Primitive selectors are
 * unaffected (shallow falls back to `Object.is`).
 *
 * @example
 * const { pool, activeConnectorId } = useWalletStore((state) => ({
 *   pool: state.pool,
 *   activeConnectorId: state.activeConnectorId,
 * }));
 */
const useWalletStore = <T>(selector: (state: WalletStoreState) => T) => {
  const store = useWalletStoreContext();
  return useStoreWithEqualityFn(store, selector, shallow);
};

export {
  useAccounts,
  useActiveConnectorId,
  useActiveWallet,
  useConnectedWallets,
  useConnectingConnectorId,
  useConnectionError,
  useConnectionStatus,
  useGetConnectorInstance,
  useGetSelectedWallet,
  useGetWallet,
  useIsConnecting,
  useIsHydrated,
  useIsPlatformConnected,
  useIsUserDisconnected,
  usePool,
  useSelectedWallet,
  useSelection,
  useWalletConnected,
  useWalletEntry,
  useWalletStore,
};
