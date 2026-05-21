// Shared Wallet Standard protocol types — re-exported from
// @usebutr/wallet-standard-shared for backwards compatibility with
// consumers that import them from @usebutr/svm.
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

// Solana-specific feature shapes.
export type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignAndSendTransactionInput,
  SolanaSignAndSendTransactionOutput,
  SolanaSignMessageFeature,
  SolanaSignMessageInput,
  SolanaSignMessageOutput,
} from "./wallet-standard-types";

export { buildSvmAdapter, slugify } from "./wallet-standard-adapter";
export { discoverSvmAdapters } from "./wallet-standard";

export { SVM_CHAINS, SVM_CHAINS_LIST } from "./chains";

export type { WalletStandardCapabilityInput } from "./capabilities";
export { resolveWalletStandardCapabilities } from "./capabilities";
