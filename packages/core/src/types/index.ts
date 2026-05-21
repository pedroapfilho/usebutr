export type { ChainBase } from "./chain";
export type { ChainsByPlatform } from "./chains-by-platform";
export { buildChainsByPlatform } from "./chains-by-platform";
export type { PlatformDiscoverer } from "./discoverer";
export type { ConnectionError, ConnectionErrorKind } from "./errors";
export { mapConnectionError } from "./errors";
export type { SignerForPlatform, SignerOf } from "./signer";

export type {
  Account,
  Balance,
  BitcoinAdapter,
  BitcoinWallet,
  ChainPlatform,
  ConnectedWallet,
  Connector,
  ConnectorEvent,
  ConnectorMeta,
  EvmAdapter,
  EvmWallet,
  HydrationOutcome,
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
} from "./wallet";
