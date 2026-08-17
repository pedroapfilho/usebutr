import type { PlatformDiscoverer } from "@usebutr/core";

import { discoverSvmAdapters } from "./wallet-standard-adapter";

/**
 * No legacy fallback: Solana wallets standardised on Wallet Standard before
 * butr existed, so there's no `window.solana` injected path worth shimming.
 */
const svmDiscoverer: PlatformDiscoverer = {
  subscribe: discoverSvmAdapters,
};

export { svmDiscoverer };
