export type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignAndSendTransactionInput,
  SolanaSignAndSendTransactionOutput,
  SolanaSignInFeature,
  SolanaSignInInput,
  SolanaSignInOutput,
  SolanaSignMessageFeature,
  SolanaSignMessageInput,
  SolanaSignMessageOutput,
} from "./wallet-standard-types";

export { buildSvmAdapter, discoverSvmAdapters } from "./wallet-standard-adapter";

export { SVM_CHAINS, SVM_CHAINS_LIST } from "./chains";

export type { WalletStandardCapabilityInput } from "./capabilities";
export { resolveWalletStandardCapabilities } from "./capabilities";

export { svmDiscoverer } from "./discoverer";

import "./signer-augmentation";
