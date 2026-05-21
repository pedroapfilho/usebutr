export type { ChainBase } from "./chain";
export type { PlatformDiscoverer } from "./discoverer";
export type { ConnectionError, ConnectionErrorKind } from "./errors";
export { mapConnectionError } from "./errors";

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
