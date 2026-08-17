import type { PlatformDiscoverer } from "@usebutr/core";

import { discoverInjectedPolkadotAdapters } from "./injected";
import { discoverPolkadotWalletStandardAdapters } from "./wallet-standard-adapter";

/**
 * Polkadot's `PlatformDiscoverer`. Inverts the Bitcoin layout:
 *  - PRIMARY (`subscribe`) is injectedWeb3; the dominant, broadest
 *    Polkadot standard (polkadot-js, Talisman, SubWallet, Nova, Enkrypt).
 *  - FALLBACK is Wallet Standard `polkadot:*`. It defers when the primary
 *    channel already produced an adapter for the session
 *    (`hasAnyPrimaryAdapter`). The defer is the ONLY thing preventing
 *    double-listing: a wallet exposing both channels (Talisman, SubWallet)
 *    mints two unrelated ids (`injected:polkadot:<slug>` and
 *    `wallet-standard:polkadot-<slug>`) that the discovery bus cannot
 *    collapse.
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
