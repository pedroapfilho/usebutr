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

export { svmDiscoverer } from "./discoverer";

import "./signer-augmentation";
