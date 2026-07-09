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

export { suiDiscoverer } from "./discoverer";

import "./signer-augmentation";
