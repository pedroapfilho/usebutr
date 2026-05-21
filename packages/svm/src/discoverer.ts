import type { PlatformDiscoverer } from "@usebutr/core";

import { discoverSvmAdapters } from "./wallet-standard";

/**
 * SVM's `PlatformDiscoverer`: Solana Wallet Standard announcements. No
 * legacy fallback — Solana wallets standardised on Wallet Standard
 * before butr existed, so there's no `window.solana` injected path
 * worth shimming.
 */
const svmDiscoverer: PlatformDiscoverer = {
  platform: "svm",
  subscribe: discoverSvmAdapters,
};

export { svmDiscoverer };
