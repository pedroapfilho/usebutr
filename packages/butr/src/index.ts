// Types
export type {
  ChainBase,
  Account,
  Balance,
  ChainPlatform,
  ConnectedWallet,
  ConnectionError,
  ConnectionErrorKind,
  ConnectorMeta,
  UIConnector,
  WalletManagerConfig,
} from "./types";
export { mapConnectionError } from "./types";

// Store
export type { ConnectionStatus, WalletStore, WalletStoreState } from "./store";
export { createWalletStore } from "./store";

// Storage
export type {
  BrowserStorageDrivers,
  MaybePromise,
  StorageDriver,
  StoredPoolEntry,
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletPersistence,
} from "./storage";
export { createBrowserStorageDriver, createMemoryStorageDriver, WalletStorage } from "./storage";

// React — Provider
export { WalletManagerProvider } from "./context";

// React — Hooks
export {
  useActiveConnectorId,
  useActiveWallet,
  useConnectedWallets,
  useConnectingConnectorId,
  useConnectionError,
  useConnectionStatus,
  useConnectWallet,
  useDisconnectWallet,
  useGetConnectorInstance,
  useGetSelectedWallet,
  useGetWallet,
  useIsConnecting,
  useIsHydrated,
  useIsPlatformConnected,
  useIsUserDisconnected,
  usePool,
  useRefreshWallet,
  useResetConnectionStatus,
  useResetWallet,
  useSelectedWallet,
  useSelection,
  useSetActiveConnector,
  useSetConnectionError,
  useSetConnectionStatus,
  useSetSelection,
  useUpdateWalletAccount,
  useWalletConnected,
  useWalletStore,
} from "./hooks";
