// Provider
export type { WalletManagerProviderProps } from "./context";
export {
  WalletManagerProvider,
  WalletStoreContext,
  useDiscoveredWallets,
  useWalletStoreContext,
} from "./context";

// Selectors — reactive reads of the wallet store.
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
} from "./hooks/selectors";

// Actions — dispatchers / mutations.
export {
  useConnectWallet,
  useDisconnectWallet,
  useRefreshWallet,
  useRequestAccounts,
  useResetConnectionStatus,
  useResetWallet,
  useSetActiveConnector,
  useSetConnectionError,
  useSetSelection,
  useUpdateWalletAccount,
} from "./hooks/actions";

// Async resources — hooks returning AsyncState<T>.
export type { AsyncState, UseBalanceResult } from "./hooks/async-resources";
export { useBalance, useSigner } from "./hooks/async-resources";
