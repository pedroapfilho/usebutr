import type { PlatformDiscoverer } from "@usebutr/core";

import { discoverInjectedBitcoinAdapter } from "./injected";
import { discoverBitcoinAdapters } from "./wallet-standard-adapter";

/**
 * Wallet Standard is primary; the legacy fallback covers sats-connect
 * (Xverse), `window.unisat`, OKX legacy and `window.btc`, and defers to
 * the primary channel via `hasAnyPrimaryAdapter`.
 */
const bitcoinDiscoverer: PlatformDiscoverer = {
  fallback: {
    subscribe: (onAdapter, opts) =>
      discoverInjectedBitcoinAdapter(onAdapter, {
        hasAnyWalletStandardAdapter: opts.hasAnyPrimaryAdapter,
      }),
  },
  subscribe: discoverBitcoinAdapters,
};

export { bitcoinDiscoverer };
