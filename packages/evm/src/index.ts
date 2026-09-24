export type {
  Eip1193Listener,
  Eip1193Object,
  Eip1193Provider,
  Eip1193RequestArgs,
  Eip1193Value,
  Eip6963AnnounceEvent,
  Eip6963ProviderDetail,
  Eip6963ProviderInfo,
} from "./eip1193";

export { ANNOUNCE_EVENT, REQUEST_EVENT, discoverEvmAdapters } from "./eip6963";

export {
  buildEvmAdapter,
  chainIdDecimalToHex,
  chainIdHexToDecimal,
  formatEther,
} from "./eip6963-adapter";

export type { InjectedDiscoveryOptions } from "./injected";
export { GENERIC_INJECTED_ICON, discoverInjectedAdapter, isEip1193Provider } from "./injected";

export { evmDiscoverer } from "./discoverer";

import "./signer-augmentation";
