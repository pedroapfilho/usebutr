import type { PlatformDiscoverer } from "@usebutr/core";

import { discoverEvmAdapters } from "./eip6963";
import { discoverInjectedAdapter } from "./injected";

/**
 * EVM's `PlatformDiscoverer`: EIP-6963 announcements primary, with the
 * legacy `window.ethereum` injected fallback wired to defer until
 * EIP-6963 has had a chance to fire.
 *
 * Consumers using `@usebutr/wallets`'s `autoDiscovery()` get this
 * wired in automatically. Direct consumers who don't want the
 * injected fallback build their own discovery source from
 * `discoverEvmAdapters` alone.
 */
const evmDiscoverer: PlatformDiscoverer = {
  fallback: {
    subscribe: (onAdapter, opts) =>
      discoverInjectedAdapter(onAdapter, {
        hasAnyEip6963Adapter: opts.hasAnyPrimaryAdapter,
      }),
  },
  platform: "evm",
  subscribe: discoverEvmAdapters,
};

export { evmDiscoverer };
