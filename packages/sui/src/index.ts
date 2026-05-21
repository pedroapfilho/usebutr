// Shared Wallet Standard protocol types — re-exported for backwards
// compatibility with consumers that import them from @usebutr/sui.
export type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  StandardEventsListener,
  WalletStandardAppModule,
  WalletStandardWallet,
  WalletStandardWalletAccount,
  WalletsApp,
} from "@usebutr/wallet-standard-shared";

// Sui-specific feature shapes.
export type {
  SuiSignAndExecuteTransactionFeature,
  SuiSignAndExecuteTransactionInput,
  SuiSignAndExecuteTransactionOutput,
  SuiSignPersonalMessageFeature,
  SuiSignPersonalMessageInput,
  SuiSignPersonalMessageOutput,
  SuiSignTransactionFeature,
  SuiSignTransactionInput,
  SuiSignTransactionOutput,
} from "./wallet-standard-types";

export { buildSuiAdapter, slugify } from "./wallet-standard-adapter";
export { discoverSuiAdapters } from "./wallet-standard";

export { SUI_CHAINS, SUI_CHAINS_LIST } from "./chains";

export type { WalletStandardCapabilityInput } from "./capabilities";
export { resolveSuiCapabilities } from "./capabilities";

// PlatformDiscoverer descriptor (Wallet Standard, no fallback)
export { suiDiscoverer } from "./discoverer";
