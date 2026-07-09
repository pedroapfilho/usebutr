export type {
  Eip1193Listener,
  Eip1193Provider,
  Eip1193RequestArgs,
  Eip6963AnnounceEvent,
  Eip6963ProviderDetail,
  Eip6963ProviderInfo,
} from "./eip1193";

export { ANNOUNCE_EVENT, REQUEST_EVENT, discoverEvmAdapters } from "./eip6963";

export {
  buildEvmAdapter,
  bytesToHex,
  chainIdDecimalToHex,
  chainIdHexToDecimal,
  formatEther,
  hexToBytes,
} from "./eip6963-adapter";

export type { InjectedDiscoveryOptions } from "./injected";
export { GENERIC_INJECTED_ICON, discoverInjectedAdapter } from "./injected";

export { EVM_CHAINS, EVM_CHAINS_LIST } from "./chains";

export type { Eip6963CapabilityInput } from "./capabilities";
export { EIP6963_RDNS_WITH_REQUEST_ACCOUNTS, resolveEip6963Capabilities } from "./capabilities";

export { evmDiscoverer } from "./discoverer";

import "./signer-augmentation";
