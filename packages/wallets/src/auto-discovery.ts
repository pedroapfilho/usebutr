import type { ChainPlatform, WalletSource } from "@usebutr/core";

import { discoverWalletAdapters } from "./discover";

/**
 * The one-call source for `WalletManagerConfig.sources`. A single-platform
 * app can pass that package's `discover*Adapters` instead and keep the
 * other platforms out of its bundle.
 */
const autoDiscovery =
  (platforms?: ReadonlyArray<ChainPlatform>, options: { fallbacks?: boolean } = {}): WalletSource =>
  (onAdapter) =>
    discoverWalletAdapters(onAdapter, { ...options, platforms });

export { autoDiscovery };
