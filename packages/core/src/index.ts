// Types
export type {
  Account,
  Balance,
  BitcoinAdapter,
  BitcoinWallet,
  ChainBase,
  ChainPlatform,
  ChainsByPlatform,
  ConnectedWallet,
  ConnectionError,
  ConnectionErrorKind,
  Connector,
  ConnectorEvent,
  ConnectorMeta,
  EvmAdapter,
  EvmWallet,
  HydrationOutcome,
  PlatformDiscoverer,
  SignerForPlatform,
  SignerOf,
  SuiAdapter,
  SuiWallet,
  SvmAdapter,
  SvmWallet,
  Wallet,
  WalletAdapter,
  WalletAvailability,
  WalletBase,
  WalletCapabilities,
  WalletManagerConfig,
} from "./types";
export { buildChainsByPlatform, mapConnectionError } from "./types";

// Discovery seam
export type { WalletSource } from "./wallet-source";
export { createWalletSource } from "./wallet-source";

// Store
export type { ConnectionStatus, WalletStore, WalletStoreState } from "./store";
export { createWalletStore } from "./store";

// Storage
export type {
  BrowserStorageDrivers,
  CookieDriverOptions,
  MaybePromise,
  StorageDriver,
  StoredPoolEntry,
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletPersistence,
} from "./storage";
export {
  createBrowserStorageDriver,
  createCookieStorageDriver,
  createMemoryStorageDriver,
  WalletStorage,
} from "./storage";

// Equality helper used by async hooks in @usebutr/react
export { walletEqual } from "./wallet-equal";

// Logger — re-exported so consuming packages can import from @usebutr/core
export { logError, logWarn } from "./logger";
