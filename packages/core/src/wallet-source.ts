import type { WalletAdapter } from "./types";

/**
 * A discovery seam. Implementations call `onAdapter(adapter)` each time
 * they find a wallet and return an unsubscribe handle. `@usebutr/wallets`
 * composes EVM + SVM into a single `WalletSource`; third parties can
 * implement this type without depending on `@usebutr/wallets`.
 */
type WalletSource = {
  subscribe(onAdapter: (adapter: WalletAdapter) => void): () => void;
};

/**
 * Wrap a bare `subscribe` function (the exact shape of
 * `discoverEvmAdapters` / `discoverSvmAdapters`) into a `WalletSource`,
 * so an EVM-only app can do
 * `createWalletSource(discoverEvmAdapters)` without importing anything
 * protocol-bearing beyond `@usebutr/evm`.
 */
const createWalletSource = (
  subscribe: (onAdapter: (adapter: WalletAdapter) => void) => () => void,
): WalletSource => ({ subscribe });

export type { WalletSource };
export { createWalletSource };
