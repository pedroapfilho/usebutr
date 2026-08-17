import type { PlatformDiscoverer } from "@usebutr/core";

import { discoverEvmAdapters } from "./eip6963";
import { discoverInjectedAdapter } from "./injected";

/**
 * EIP-6963 is primary; the legacy `window.ethereum` fallback defers until
 * EIP-6963 has had a chance to fire.
 */
const evmDiscoverer: PlatformDiscoverer = {
  fallback: {
    subscribe: (onAdapter, opts) =>
      discoverInjectedAdapter(onAdapter, {
        hasAnyEip6963Adapter: opts.hasAnyPrimaryAdapter,
      }),
  },
  subscribe: discoverEvmAdapters,
};

export { evmDiscoverer };
