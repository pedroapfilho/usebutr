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
  ChainPlatform,
  ConnectedWallet,
  Connector,
  ConnectorEvent,
  ConnectorMeta,
  WalletAdapter,
  Wallet,
  HydrationOutcome,
  WalletAvailability,
  WalletCapabilities,
  WalletManagerConfig,
} from "./wallet";
