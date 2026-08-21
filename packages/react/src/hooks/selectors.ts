import type { Account, ChainPlatform, ConnectedWallet, WalletStoreState } from "@usebutr/core";
import { walletEqual } from "@usebutr/core";
import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";

import { useWalletStoreContext } from "../context";

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
    if (x === undefined || y === undefined) {
      return false;
    }
    if (x.walletAddress !== y.walletAddress || x.chain.id !== y.chain.id) {
      return false;
    }
  }
  return true;
};

/**
 * Connection status of the active wallet, wagmi-aligned. `"reconnecting"` is
 * derived here rather than written by the reducer: the active wallet is still
 * backed by a shadow adapter awaiting the silent reconnect.
 */
const useConnectionStatus = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => {
    if (state.connectionStatus === "connecting" || state.connectionStatus === "error") {
      return state.connectionStatus;
    }
    if (state.activeConnectorId !== null && state.reconnectingIds.has(state.activeConnectorId)) {
      return "reconnecting" as const;
    }
    return state.connectionStatus;
  });
};

/**
 * Whether a wallet is still backed by a shadow adapter, seeded from
 * `initialState` and awaiting the silent reconnect. Shadow adapters reject
 * every call, so this gates any use of the connector.
 */
const useIsReconnecting = (connectorId?: string | null) => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => {
    const id = connectorId ?? state.activeConnectorId;
    return id !== null && id !== undefined && state.reconnectingIds.has(id);
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
    (state) =>
      state.activeConnectorId === null ? undefined : state.pool.get(state.activeConnectorId),
    walletEqual,
  );
};

/** Reactive lookup of the wallet selected for a given platform. */
const useSelectedWallet = (chainPlatform: ChainPlatform | null): ConnectedWallet | undefined => {
  const store = useWalletStoreContext();
  return useStoreWithEqualityFn(
    store,
    (state) => {
      if (chainPlatform === null) {
        return undefined;
      }
      const id = state.selection.get(chainPlatform);
      return id === undefined ? undefined : state.pool.get(id);
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
 * All known accounts on a wallet; the active wallet when `connectorId` is
 * omitted. Re-renders only when the list changes by address + chain id.
 */
const useAccounts = (connectorId?: string | null): ReadonlyArray<Account> => {
  const store = useWalletStoreContext();
  return useStoreWithEqualityFn(
    store,
    (state) => {
      const id = connectorId ?? state.activeConnectorId;
      const wallet = id === null ? undefined : state.pool.get(id);
      return wallet ? wallet.accounts : EMPTY_ACCOUNTS;
    },
    accountsEqual,
  );
};

/**
 * Pool entry for a `connectorId`; the active wallet when omitted. Re-renders
 * only when the resolved wallet's connectorId / address / chainId changes.
 */
const useWalletEntry = (connectorId: string | null | undefined): ConnectedWallet | undefined => {
  const store = useWalletStoreContext();
  return useStoreWithEqualityFn(
    store,
    (state) => {
      const id = connectorId ?? state.activeConnectorId;
      return id === null ? undefined : state.pool.get(id);
    },
    walletEqual,
  );
};

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
      return id === undefined ? undefined : state.pool.get(id);
    },
    [store],
  );
};

/** Stable accessor for raw connector instances. */
const useGetConnectorInstance = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.getConnectorInstance);
};

/**
 * Direct store access for custom selectors. Shallow equality on the result, so
 * returning an inline object or array does not loop.
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
  useIsReconnecting,
  useIsUserDisconnected,
  usePool,
  useSelectedWallet,
  useSelection,
  useWalletConnected,
  useWalletEntry,
  useWalletStore,
};
