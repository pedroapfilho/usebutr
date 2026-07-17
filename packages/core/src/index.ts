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
export { buildAccount, buildChainsByPlatform, CHAIN_PLATFORMS, mapConnectionError } from "./types";

export type { WalletSource } from "./wallet-source";
export { createWalletSource } from "./wallet-source";

export type { ConnectionStatus, WalletStore, WalletStoreState } from "./store";
export { createWalletStore } from "./store";

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

export { walletEqual } from "./wallet-equal";

export { logError, logWarn } from "./logger";

export { sanitizeIcon } from "./sanitize-icon";

export {
  base64ToBytes,
  bytesToBase64,
  bytesToHex,
  bytesToHexPrefixed,
  hexToBytes,
} from "./encoding/bytes";
