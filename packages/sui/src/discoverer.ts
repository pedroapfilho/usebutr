import type { PlatformDiscoverer } from "@usebutr/core";

import { discoverSuiAdapters } from "./wallet-standard";

/**
 * Sui's `PlatformDiscoverer`: Sui Wallet Standard announcements. No
 * legacy fallback — Sui standardised on Wallet Standard from launch.
 */
const suiDiscoverer: PlatformDiscoverer = {
  platform: "sui",
  subscribe: discoverSuiAdapters,
};

export { suiDiscoverer };
