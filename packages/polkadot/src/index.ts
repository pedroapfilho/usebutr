// Chain registry
export { POLKADOT_CHAINS, POLKADOT_CHAINS_LIST } from "./chains";

// Capability resolvers
export type { WalletStandardPolkadotCapabilityInput } from "./capabilities";
export {
  resolveInjectedPolkadotCapabilities,
  resolveWalletStandardPolkadotCapabilities,
} from "./capabilities";

// injectedWeb3 (primary) channel
export type { PolkadotSignerHandle } from "./injected/adapter";
export { buildInjectedPolkadotAdapter } from "./injected/adapter";
export type { InjectedPolkadotDiscoveryOptions } from "./injected";
export { discoverInjectedPolkadotAdapters } from "./injected";

// Wallet Standard (fallback) channel
export type {
  PolkadotSignMessageFeature,
  PolkadotSignMessageInput,
  PolkadotSignMessageOutput,
} from "./wallet-standard-types";
export { buildPolkadotWalletStandardAdapter } from "./wallet-standard-adapter";
export { discoverPolkadotWalletStandardAdapters } from "./wallet-standard";

// PlatformDiscoverer descriptor (injected primary + WS fallback)
export { polkadotDiscoverer } from "./discoverer";

// Augment @usebutr/core's SignerForPlatform registry. Side-effect import.
import "./signer-augmentation";
