export { POLKADOT_CHAINS, POLKADOT_CHAINS_LIST } from "./chains";

export type { WalletStandardPolkadotCapabilityInput } from "./capabilities";
export {
  resolveInjectedPolkadotCapabilities,
  resolveWalletStandardPolkadotCapabilities,
} from "./capabilities";

export type { PolkadotSignerHandle } from "./injected/adapter";
export { buildInjectedPolkadotAdapter } from "./injected/adapter";
export type { InjectedPolkadotDiscoveryOptions } from "./injected";
export { discoverInjectedPolkadotAdapters } from "./injected";

export type {
  PolkadotSignMessageFeature,
  PolkadotSignMessageInput,
  PolkadotSignMessageOutput,
} from "./wallet-standard-types";
export { buildPolkadotWalletStandardAdapter } from "./wallet-standard-adapter";
export { discoverPolkadotWalletStandardAdapters } from "./wallet-standard";

export { polkadotDiscoverer } from "./discoverer";

import "./signer-augmentation";
