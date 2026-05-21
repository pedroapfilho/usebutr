// Bitcoin-specific feature shapes.
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

export { buildBitcoinAdapter, slugify } from "./wallet-standard-adapter";
export { discoverBitcoinAdapters } from "./wallet-standard";

export { BITCOIN_CHAINS, BITCOIN_CHAINS_LIST } from "./chains";

export type { BitcoinCapabilityInput } from "./capabilities";
export { resolveBitcoinCapabilities } from "./capabilities";

export type { InjectedBitcoinDiscoveryOptions } from "./injected";
export { GENERIC_BITCOIN_ICON, discoverInjectedBitcoinAdapter } from "./injected";

// PlatformDiscoverer descriptor (Wallet Standard primary + injected fallback)
export { bitcoinDiscoverer } from "./discoverer";

// Augment @usebutr/core's SignerForPlatform registry. Side-effect import.
import "./signer-augmentation";
