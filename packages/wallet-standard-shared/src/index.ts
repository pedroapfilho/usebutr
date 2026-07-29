export type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  StandardEventsListener,
  WalletsApp,
  WalletStandardAppModule,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "./types";

export {
  buildAccount,
  getFeature,
  pickAccountByAddress,
  pickFirstAddress,
  slugify,
} from "./primitives";

export type { WalletStandardCore } from "./adapter-core";
export { createWalletStandardCore } from "./adapter-core";

export type { WalletStandardAdapterBuilder } from "./discovery";
export { discoverWalletStandard } from "./discovery";
