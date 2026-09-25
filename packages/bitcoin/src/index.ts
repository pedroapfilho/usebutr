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

export { buildBitcoinAdapter, discoverBitcoinAdapters } from "./wallet-standard-adapter";

export type { InjectedBitcoinDiscoveryOptions } from "./injected";
export { GENERIC_BITCOIN_ICON, discoverInjectedBitcoinAdapter } from "./injected";

export { bitcoinDiscoverer } from "./discoverer";

import "./signer-augmentation";
