export { buildInjectedPolkadotAdapter } from "./injected/adapter";

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

import "./signer-augmentation";
