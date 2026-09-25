export { buildInjectedPolkadotAdapter } from "./injected/adapter";
export type { InjectedPolkadotDiscoveryOptions } from "./injected";
export { discoverInjectedPolkadotAdapters } from "./injected";

export type {
  PolkadotSignMessageFeature,
  PolkadotSignMessageInput,
  PolkadotSignMessageOutput,
} from "./wallet-standard-types";
export {
  buildPolkadotWalletStandardAdapter,
  discoverPolkadotWalletStandardAdapters,
} from "./wallet-standard-adapter";

export { polkadotDiscoverer } from "./discoverer";

import "./signer-augmentation";
