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

export type { Eip1193Core, EvmIdentity } from "./eip6963-adapter";

export {
  buildEvmAdapter,
  chainIdDecimalToHex,
  chainIdHexToDecimal,
  createEip1193Core,
  formatEther,
} from "./eip6963-adapter";

export { isEip1193Provider } from "./eip1193";

export { GENERIC_INJECTED_ICON, discoverInjectedAdapter } from "./injected";

import "./signer-augmentation";
