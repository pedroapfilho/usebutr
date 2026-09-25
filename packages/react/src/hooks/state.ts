import type {
  Account,
  ChainPlatform,
  ConnectedWallet,
  WalletAdapter,
  WalletState,
} from "@usebutr/core";
import { accountsEqual, isPlatformWallet, walletEqual } from "@usebutr/core";
import { useMemo } from "react";
import { useStore } from "zustand";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";

import { useWalletManager } from "../context";

const EMPTY_ACCOUNTS: ReadonlyArray<Account> = [];

/** Omitted means the active wallet; `null` means no wallet at all, so
 *  `useWallet(maybeId ?? null)` never falls back to another chain's wallet. */
const resolveId = (state: WalletState, connectorId: string | null | undefined) =>
  connectorId === undefined ? state.activeConnectorId : connectorId;

/**
 * Custom selector over the manager's state. Shallow equality on the result,
 * so returning an inline object or array does not loop.
 */
const useWalletState = <T>(selector: (state: WalletState) => T): T =>
  useStoreWithEqualityFn(useWalletManager(), selector, shallow);

/** Every adapter the sources announced, in announcement order. A multi-chain
 *  wallet appears once per platform it speaks. */
const useDiscoveredWallets = (): ReadonlyArray<WalletAdapter> =>
  useStore(useWalletManager(), (state) => state.adapters);

/** The pool as an array; stable while the pool is unchanged. */
const useConnectedWallets = (): ReadonlyArray<ConnectedWallet> => {
  const pool = useStore(useWalletManager(), (state) => state.pool);
  return useMemo(() => [...pool.values()], [pool]);
};

/**
 * A pool entry; the active wallet when `connectorId` is omitted. Re-renders
 * only when that entry's adapter, active account or account list changes.
 */
const useWallet = (connectorId?: string | null): ConnectedWallet | undefined =>
  useStoreWithEqualityFn(
    useWalletManager(),
    (state) => {
      const id = resolveId(state, connectorId);
      return id === null ? undefined : state.pool.get(id);
    },
    walletEqual,
  );

/** The wallet selected for `platform`, typed to that platform's adapter. */
const useSelectedWallet = <P extends ChainPlatform>(
  platform: P,
): ConnectedWallet<P> | undefined => {
  const wallet = useStoreWithEqualityFn(
    useWalletManager(),
    (state) => {
      const id = state.selection.get(platform);
      return id === undefined ? undefined : state.pool.get(id);
    },
    walletEqual,
  );
  return wallet !== undefined && isPlatformWallet(wallet, platform) ? wallet : undefined;
};

/** A wallet's accounts; the active wallet's when `connectorId` is omitted. */
const useAccounts = (connectorId?: string | null): ReadonlyArray<Account> =>
  useStoreWithEqualityFn(
    useWalletManager(),
    (state) => {
      const id = resolveId(state, connectorId);
      return (id === null ? undefined : state.pool.get(id)?.accounts) ?? EMPTY_ACCOUNTS;
    },
    accountsEqual,
  );

type ConnectionStatus = "connected" | "connecting" | "disconnected" | "reconnecting";

/**
 * wagmi's vocabulary. `"reconnecting"`: the active wallet is still a shadow
 * seeded from `initialState`, awaiting silent reconnect. The outcome of a
 * `connect` attempt lives on `useConnect()` instead.
 */
const useConnectionStatus = (): ConnectionStatus =>
  useStore(useWalletManager(), (state) => {
    if (state.connectionStatus === "connecting") {
      return "connecting";
    }
    if (state.activeConnectorId === null) {
      return "disconnected";
    }
    return state.reconnectingIds.has(state.activeConnectorId) ? "reconnecting" : "connected";
  });

/** Has the manager finished its start-up hydration pass? Always true when it
 *  was seeded from `initialState`. */
const useIsHydrated = (): boolean => useStore(useWalletManager(), (state) => state.isHydrated);

/**
 * Whether a wallet is still a shadow seeded from `initialState`; the active
 * wallet when `connectorId` is omitted. Its `connect`, `getAccounts` and
 * `getSigner` reject until this turns false.
 */
const useIsReconnecting = (connectorId?: string | null): boolean =>
  useStore(useWalletManager(), (state) => {
    const id = resolveId(state, connectorId);
    return id !== null && state.reconnectingIds.has(id);
  });

export type { ConnectionStatus };
export {
  useAccounts,
  useConnectedWallets,
  useConnectionStatus,
  useDiscoveredWallets,
  useIsHydrated,
  useIsReconnecting,
  useSelectedWallet,
  useWallet,
  useWalletState,
};
