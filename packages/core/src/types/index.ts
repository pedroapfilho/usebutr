export type { Account, Balance } from "./account";
export { buildAccount } from "./account";
export type { WalletCapabilities } from "./capabilities";
export type { ChainBase } from "./chain";
export type { ChainsByPlatform } from "./chains-by-platform";
export { buildChainsByPlatform } from "./chains-by-platform";
export type { Connector, ConnectorEvent, ConnectorMeta, WalletAvailability } from "./connector";
export type { PlatformDiscoverer } from "./discoverer";
export type { ConnectionError, ConnectionErrorKind } from "./errors";
export { mapConnectionError } from "./errors";
export type { HydrationOutcome, WalletManagerConfig } from "./manager";
export type { ChainPlatform } from "./platform";
export { CHAIN_PLATFORMS } from "./platform";
export type { SignerForPlatform, SignerOf } from "./signer";

export type {
  BitcoinAdapter,
  BitcoinWallet,
  ConnectedWallet,
  EvmAdapter,
  EvmWallet,
  PolkadotAdapter,
  PolkadotWallet,
  SuiAdapter,
  SuiWallet,
  SvmAdapter,
  SvmWallet,
  WalletAdapter,
  WalletBase,
} from "./wallet";
