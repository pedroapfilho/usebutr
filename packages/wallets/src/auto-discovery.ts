import type { WalletSource } from "@usebutr/core";

import { type DiscoverOptions, discoverWalletAdapters } from "./discover";

/**
 * The batteries-included discovery source: composes EVM (EIP-6963 +
 * injected fallback), SVM / Sui / Bitcoin (Wallet Standard), and
 * Polkadot (`injectedWeb3` + Wallet Standard fallback). Pass to
 * `<WalletManagerProvider discovery={autoDiscovery()} />`. Restrict
 * platforms with `options`, e.g. `autoDiscovery({ evm: true })`.
 */
const autoDiscovery = (options?: DiscoverOptions): WalletSource => ({
  subscribe: (onAdapter) => discoverWalletAdapters(onAdapter, options),
});

export { autoDiscovery };
