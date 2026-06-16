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
  PolkadotAdapter,
  PolkadotWallet,
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
export { buildChainsByPlatform, CHAIN_PLATFORMS, mapConnectionError } from "./types";

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
  CookieSource,
  InitialCookies,
  MaybePromise,
  SnapshotOptions,
  StorageDriver,
  StoredPoolEntry,
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletPersistence,
  WalletSnapshot,
} from "./storage";
export {
  createBrowserStorageDriver,
  createCookieStorageDriver,
  createMemoryStorageDriver,
  EMPTY_SNAPSHOT,
  readWalletSnapshot,
  WalletStorage,
} from "./storage";

// Equality helper used by async hooks in @usebutr/react
export { walletEqual } from "./wallet-equal";

// Logger — re-exported so consuming packages can import from @usebutr/core
export { logError, logWarn } from "./logger";

// Icon normalization for wallet-announced metadata
export { sanitizeIcon } from "./sanitize-icon";

// Shared byte-encoding helpers used across the connector packages
export {
  base64ToBytes,
  bytesToBase64,
  bytesToHex,
  bytesToHexPrefixed,
  hexToBytes,
} from "./encoding/bytes";
