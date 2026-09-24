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

export { findAccount, getFeature, slugify } from "./primitives";

export type { WalletStandardCore, WalletStandardCoreInput } from "./adapter-core";
export { createWalletStandardCore } from "./adapter-core";

export type { WalletStandardAdapterBuilder } from "./discovery";
export { discoverWalletStandard } from "./discovery";

import "./signer-augmentation";
