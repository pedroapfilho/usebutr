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
  SignInInput,
  SignInValue,
  SignerForPlatform,
  SignerOf,
  SuiAdapter,
  SuiWallet,
  SvmAdapter,
  SvmWallet,
  TransactionInput,
  TransactionMethod,
  TransactionObject,
  TransactionValue,
  WalletAdapter,
  WalletAvailability,
  WalletBase,
  WalletCapabilities,
  WalletManagerConfig,
  WalletSigner,
} from "./types";
export { buildAccount, buildChainsByPlatform, CHAIN_PLATFORMS, mapConnectionError } from "./types";

export type { WalletSource } from "./wallet-source";
export { createWalletSource } from "./wallet-source";

export type { ConnectionStatus, WalletStore, WalletStoreState } from "./store";
export { createWalletStore, isShadowAdapter, ShadowConnectorError } from "./store";

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

export { groupByPlatform } from "./group-by-platform";

export type { SignInFlowOptions, SignInMessageContext, SignInResult } from "./sign-in";
export { SignInUnsupportedError, createSignInFlow } from "./sign-in";

export { walletEqual } from "./wallet-equal";

export { logError, logWarn } from "./logger";

export { sanitizeIcon } from "./sanitize-icon";

export {
  base58ToBytes,
  base64ToBytes,
  bytesToBase58,
  bytesToBase64,
  bytesToHex,
  bytesToHexPrefixed,
  hexToBytes,
} from "./encoding/bytes";
