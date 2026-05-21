// EIP-1193 / EIP-6963 types
export type {
  Eip1193Listener,
  Eip1193Provider,
  Eip1193RequestArgs,
  Eip6963AnnounceEvent,
  Eip6963ProviderDetail,
  Eip6963ProviderInfo,
} from "./eip1193";

// EIP-6963 discovery
export { ANNOUNCE_EVENT, REQUEST_EVENT, discoverEvmAdapters } from "./eip6963";

// Adapter builder + helpers
export {
  buildEvmAdapter,
  bytesToHex,
  chainIdDecimalToHex,
  chainIdHexToDecimal,
  formatEther,
  hexToBytes,
} from "./eip6963-adapter";

// Injected fallback
export type { InjectedDiscoveryOptions } from "./injected";
export { GENERIC_INJECTED_ICON, discoverInjectedAdapter } from "./injected";

// EVM chain registry
export { EVM_CHAINS, EVM_CHAINS_LIST } from "./chains";

// Capabilities
export type { Eip6963CapabilityInput } from "./capabilities";
export { EIP6963_RDNS_WITH_REQUEST_ACCOUNTS, resolveEip6963Capabilities } from "./capabilities";

// PlatformDiscoverer descriptor (EIP-6963 primary + window.ethereum fallback)
export { evmDiscoverer } from "./discoverer";

// Augment @usebutr/core's SignerForPlatform registry with the EVM entry.
// Side-effect import — required for the module-augmentation block to
// run when consumers import anything from this package.
import "./signer-augmentation";
