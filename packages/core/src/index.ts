export type {
  Account,
  AccountOptions,
  Balance,
  BalanceOptions,
  BitcoinAdapter,
  BitcoinTransfer,
  BitcoinWallet,
  ChainBase,
  ChainPlatform,
  ChainsByPlatform,
  ConnectedWallet,
  ConnectionErrorKind,
  Connector,
  ConnectorEvent,
  EvmAdapter,
  EvmTransactionRequest,
  EvmTransactionValue,
  EvmWallet,
  HydrationOutcome,
  PlatformDiscoverer,
  PolkadotAdapter,
  PolkadotWallet,
  SignedMessage,
  SignInInput,
  SignInOutput,
  SignInValue,
  SuiAdapter,
  SuiTransactionInput,
  SuiWallet,
  SvmAdapter,
  SvmWallet,
  TransactionOptions,
  TransactionReceipt,
  WalletAdapter,
  WalletAdapterFor,
  WalletBase,
  WalletManagerConfig,
  WalletSigner,
  WalletSignerKind,
  WalletSignerOf,
  WalletSignerRegistry,
} from "./types";
export {
  buildAccount,
  CHAIN_PLATFORMS,
  ConnectionError,
  isChainPlatform,
  isPlatformWallet,
  resolveChain,
  toConnectionError,
} from "./types";

export {
  BITCOIN_CHAINS,
  BITCOIN_CHAINS_LIST,
  CHAINS_BY_PLATFORM,
  EVM_CHAINS,
  EVM_CHAINS_LIST,
  POLKADOT_CHAINS,
  POLKADOT_CHAINS_LIST,
  SUI_CHAINS,
  SUI_CHAINS_LIST,
  SVM_CHAINS,
  SVM_CHAINS_LIST,
} from "./chains";

export type { WalletSource } from "./wallet-source";
export { fromAdapters } from "./wallet-source";

export type { ConnectStatus, WalletManager, WalletState } from "./store";
export { createWalletManager, ShadowConnectorError } from "./store";

export type {
  BrowserStorageDrivers,
  CookieDriverOptions,
  CookieSource,
  InitialCookies,
  MaybePromise,
  PersistedWalletState,
  SnapshotOptions,
  StorageDriver,
  StoredPoolEntry,
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletPersistence,
  WalletSnapshot,
  WalletStorageOptions,
} from "./storage";
export {
  createBrowserStorageDriver,
  createCookieStorageDriver,
  createMemoryStorageDriver,
  createWalletStorage,
  EMPTY_SNAPSHOT,
  readWalletSnapshot,
} from "./storage";

export { groupByPlatform } from "./group-by-platform";

export type { SignInFlowOptions, SignInMessageContext, SignInResult } from "./sign-in";
export { SignInUnsupportedError, createSignInFlow } from "./sign-in";

export { accountsEqual, walletEqual } from "./wallet-equal";

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
