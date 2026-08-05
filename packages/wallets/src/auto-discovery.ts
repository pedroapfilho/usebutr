import type { ChainPlatform, WalletSource } from "@usebutr/core";

import { type DiscoverOptions, discoverWalletAdapters } from "./discover";

/**
 * The batteries-included discovery source: composes EVM (EIP-6963 +
 * injected fallback), SVM / Sui / Bitcoin (Wallet Standard), and
 * Polkadot (`injectedWeb3` + Wallet Standard fallback). Pass to
 * `<WalletManagerProvider discovery={autoDiscovery()} />`.
 *
 * Three call forms:
 *
 * ```ts
 * autoDiscovery()                               // every platform
 * autoDiscovery(["evm", "svm"])                 // allowlist
 * autoDiscovery({ evm: true, injected: false }) // allowlist + fallback control
 * ```
 *
 * Both restricted forms are allowlists: anything not named is off. An
 * empty one discovers nothing and logs a warning, since a list built at
 * runtime that comes back empty otherwise looks exactly like "the user
 * has no wallets installed".
 */
const autoDiscovery = (options?: DiscoverOptions | ReadonlyArray<ChainPlatform>): WalletSource => ({
  subscribe: (onAdapter) => discoverWalletAdapters(onAdapter, options),
});

export { autoDiscovery };
