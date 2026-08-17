import type { ChainPlatform, WalletSource } from "@usebutr/core";

import { type DiscoverOptions, discoverWalletAdapters } from "./discover";

/**
 * Discovery source for `<WalletManagerProvider discovery={…} />`. Omitting
 * `options` covers every platform; both restricted forms are allowlists, so
 * anything not named is off and an empty one discovers nothing.
 */
const autoDiscovery = (options?: DiscoverOptions | ReadonlyArray<ChainPlatform>): WalletSource => ({
  subscribe: (onAdapter) => discoverWalletAdapters(onAdapter, options),
});

export { autoDiscovery };
