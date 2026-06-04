import type { PlatformDiscoverer } from "@usebutr/core";

import { discoverInjectedPolkadotAdapters } from "./injected";
import { discoverPolkadotWalletStandardAdapters } from "./wallet-standard";

/**
 * Polkadot's `PlatformDiscoverer`. Inverts the Bitcoin layout:
 *  - PRIMARY (`subscribe`) is injectedWeb3 — the dominant, broadest
 *    Polkadot standard (polkadot-js, Talisman, SubWallet, Nova, Enkrypt).
 *  - FALLBACK is Wallet Standard `polkadot:*`. It defers when the primary
 *    channel already produced an adapter for the session
 *    (`hasAnyPrimaryAdapter`). Since Wallet Standard support is always
 *    additive on Polkadot today (Talisman/SubWallet expose both), the
 *    discovery-bus also dedups overlaps and the defer prevents
 *    double-listing.
 */
const polkadotDiscoverer: PlatformDiscoverer = {
  fallback: {
    subscribe: (onAdapter, opts) => {
      // Defer entirely when injected discovery has already surfaced a
      // wallet — no Polkadot wallet is Wallet-Standard-only today.
      if (opts.hasAnyPrimaryAdapter()) {
        return () => undefined;
      }
      return discoverPolkadotWalletStandardAdapters(onAdapter);
    },
  },
  platform: "polkadot",
  subscribe: discoverInjectedPolkadotAdapters,
};

export { polkadotDiscoverer };
