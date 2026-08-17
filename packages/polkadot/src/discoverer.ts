import type { PlatformDiscoverer } from "@usebutr/core";

import { discoverInjectedPolkadotAdapters } from "./injected";
import { discoverPolkadotWalletStandardAdapters } from "./wallet-standard-adapter";

/**
 * Primary is injectedWeb3; Wallet Standard `polkadot:*` is the fallback. Its
 * defer is the only thing preventing double-listing: a wallet on both
 * channels mints two unrelated ids the discovery bus cannot collapse.
 */
const polkadotDiscoverer: PlatformDiscoverer = {
  fallback: {
    subscribe: (onAdapter, opts) => {
      if (opts.hasAnyPrimaryAdapter()) {
        return () => undefined;
      }
      return discoverPolkadotWalletStandardAdapters(onAdapter);
    },
  },
  subscribe: discoverInjectedPolkadotAdapters,
};

export { polkadotDiscoverer };
