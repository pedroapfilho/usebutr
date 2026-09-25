export type { Account, Balance } from "./account";
export { buildAccount } from "./account";
export type { ChainBase } from "./chain";
export { resolveChain } from "./chain";
export type { ChainsByPlatform } from "./chains-by-platform";

export type { Connector, ConnectorEvent } from "./connector";
export type { PlatformDiscoverer } from "./discoverer";
export type { ConnectionErrorKind } from "./errors";
export { ConnectionError, toConnectionError } from "./errors";
export type { HydrationOutcome, WalletManagerConfig } from "./manager";
export type { ChainPlatform } from "./platform";
export { CHAIN_PLATFORMS, isChainPlatform } from "./platform";
export type {
  WalletSigner,
  WalletSignerKind,
  WalletSignerOf,
  WalletSignerRegistry,
} from "./signer";

export type {
  AccountOptions,
  BalanceOptions,
  BitcoinAdapter,
  BitcoinTransfer,
  BitcoinWallet,
  ConnectedWallet,
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
} from "./wallet";
export { isPlatformWallet } from "./wallet";
