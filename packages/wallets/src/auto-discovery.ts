import type { ChainPlatform, WalletSource } from "@usebutr/core";

import { type DiscoverOptions, discoverWalletAdapters } from "./discover";

type DiscoverWalletAdapters = typeof discoverWalletAdapters;

const autoDiscovery = (
  options?: DiscoverOptions | ReadonlyArray<ChainPlatform>,
  discover: DiscoverWalletAdapters = discoverWalletAdapters,
): WalletSource => ({
  subscribe: (onAdapter) => discover(onAdapter, options),
});

export type { DiscoverWalletAdapters };
export { autoDiscovery };
