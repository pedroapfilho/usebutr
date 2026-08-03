export type {
  BitcoinSendTransferFeature,
  BitcoinSendTransferInput,
  BitcoinSendTransferOutput,
  BitcoinSignMessageFeature,
  BitcoinSignMessageInput,
  BitcoinSignMessageOutput,
  BitcoinSignPsbtFeature,
  BitcoinSignPsbtInput,
  BitcoinSignPsbtOutput,
} from "./wallet-standard-types";

export { buildBitcoinAdapter, discoverBitcoinAdapters, slugify } from "./wallet-standard-adapter";

export { BITCOIN_CHAINS, BITCOIN_CHAINS_LIST } from "./chains";

export type { BitcoinCapabilityInput } from "./capabilities";
export { resolveBitcoinCapabilities } from "./capabilities";

export type { InjectedBitcoinDiscoveryOptions } from "./injected";
export { GENERIC_BITCOIN_ICON, discoverInjectedBitcoinAdapter } from "./injected";

export { bitcoinDiscoverer } from "./discoverer";

import "./signer-augmentation";
