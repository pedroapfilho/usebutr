export type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  StandardEventsListener,
  WalletsApp,
  WalletStandardAppModule,
  WalletStandardFeature,
  WalletStandardModuleLoader,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "./types";

export {
  buildAccount,
  getFeature,
  isWalletStandardWallet,
  pickAccountByAddress,
  pickFirstAddress,
  slugify,
} from "./primitives";

export type { WalletStandardCore } from "./adapter-core";
export { createWalletStandardCore } from "./adapter-core";

export type { WalletCapabilityProfile } from "./capabilities";
export { buildWalletCapabilities } from "./capabilities";

export type { WalletStandardAdapterBuilder } from "./discovery";
export { discoverWalletStandard } from "./discovery";
