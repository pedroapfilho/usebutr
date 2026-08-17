import type { WalletAdapter } from "./types";

/**
 * The discovery seam: implementable by third parties without depending
 * on `@usebutr/wallets`, which itself just composes the per-platform
 * sources into one.
 */
type WalletSource = {
  subscribe: (onAdapter: (adapter: WalletAdapter) => void) => () => void;
};

/**
 * Takes the exact shape of `discoverEvmAdapters` and friends, so a
 * single-platform app keeps `@usebutr/wallets` out of its bundle.
 */
const createWalletSource = (
  subscribe: (onAdapter: (adapter: WalletAdapter) => void) => () => void,
): WalletSource => ({ subscribe });

export type { WalletSource };
export { createWalletSource };
