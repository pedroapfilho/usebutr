export type { WalletManagerProviderProps } from "./context";
export {
  WalletManagerProvider,
  WalletStoreContext,
  useDiscoveredWallets,
  useWalletStoreContext,
} from "./context";

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
} from "./hooks/selectors";

export { useConnectedWalletsByPlatform, useDiscoveredWalletsByPlatform } from "./hooks/grouped";

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

export type { AsyncState, UseBalanceResult } from "./hooks/async-resources";
export { useBalance, useSigner } from "./hooks/async-resources";
