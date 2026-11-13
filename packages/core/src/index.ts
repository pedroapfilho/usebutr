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
  ConnectedWallet,
  ConnectionErrorKind,
  Connector,
  ConnectorEvent,
  EvmAdapter,
  EvmTransactionRequest,
  EvmTransactionValue,
  EvmWallet,
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
  WalletSigner,
  WalletSignerKind,
  WalletSignerOf,
  WalletSignerRegistry,
} from "./types";

export {
  buildAccount,
  buildBalance,
  CHAIN_NAMESPACES,
  CHAIN_PLATFORMS,
  ConnectionError,
  isChainPlatform,
  isPlatformWallet,
  resolveChain,
  toConnectionError,
} from "./types";

export type { ChainsByPlatform } from "./chains";

export {
  BITCOIN_CHAINS,
  CHAINS_BY_PLATFORM,
  DEFAULT_CHAINS,
  EVM_CHAINS,
  POLKADOT_CHAINS,
  SUI_CHAINS,
  SVM_CHAINS,
} from "./chains";

export type { WalletSource } from "./wallet-source";

export { fromAdapters } from "./wallet-source";

export type {
  ConnectStatus,
  HydrationOutcome,
  WalletManager,
  WalletManagerConfig,
  WalletState,
} from "./store";

export { createWalletManager, isShadowAdapter, ShadowConnectorError } from "./store";

export type {
  BrowserStorageDrivers,
  CookieSource,
  CookieWalletStorage,
  CookieWalletStorageOptions,
  MaybePromise,
  PersistedWalletState,
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
  createCookieWalletStorage,
  createMemoryStorageDriver,
  createWalletStorage,
  toStoredPoolEntry,
} from "./storage";

export { groupByPlatform } from "./group-by-platform";

export type { WalletGroup } from "./group-by-wallet";

export { groupByWallet } from "./group-by-wallet";

export type { SignInFlowOptions, SignInMessageContext, SignInResult } from "./sign-in";

export { SignInUnsupportedError, createSignInFlow } from "./sign-in";

export { accountsEqual, walletEqual } from "./wallet-equal";

export {
  base58ToBytes,
  base64ToBytes,
  bytesToBase58,
  bytesToBase64,
  bytesToHex,
  bytesToHexPrefixed,
  hexToBytes,
} from "./encoding/bytes";
