import type { PlatformDiscoverer } from "@usebutr/core";

import { discoverInjectedBitcoinAdapter } from "./injected";
import { discoverBitcoinAdapters } from "./wallet-standard";

/**
 * Bitcoin's `PlatformDiscoverer`: Wallet Standard primary (Phantom,
 * Magic Eden, Leather, OKX); legacy fallback covers sats-connect
 * (Xverse), `window.unisat`, OKX legacy, and `window.btc`. The
 * fallback defers to Wallet Standard via `hasAnyPrimaryAdapter`.
 */
const bitcoinDiscoverer: PlatformDiscoverer = {
  fallback: {
    subscribe: (onAdapter, opts) =>
      discoverInjectedBitcoinAdapter(onAdapter, {
        hasAnyWalletStandardAdapter: opts.hasAnyPrimaryAdapter,
      }),
  },
  platform: "bitcoin",
  subscribe: discoverBitcoinAdapters,
};

export { bitcoinDiscoverer };
