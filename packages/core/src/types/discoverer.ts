import type { ChainPlatform, WalletAdapter } from "./wallet";

/**
 * Self-describing discovery descriptor for a single chain platform.
 *
 * Each platform package (`@usebutr/evm`, `@usebutr/svm`, `@usebutr/sui`,
 * `@usebutr/bitcoin`) exports one of these. The aggregator package
 * (`@usebutr/wallets`) composes them into `autoDiscovery()` without
 * needing to know per-platform defaults — the descriptor owns them.
 *
 * Adding a new chain platform means writing a `PlatformDiscoverer`
 * inside the new package and adding one import to the aggregator's
 * registry. The aggregator's logic doesn't need to grow.
 *
 * Two parts:
 *  - `subscribe` — the primary discovery channel (EIP-6963 / Wallet
 *    Standard / etc).
 *  - `fallback` — optional. The legacy-injected channel that should
 *    only emit if the primary channel hasn't produced an adapter for
 *    the same browser session by the settle deadline. `@usebutr/evm`
 *    has one (window.ethereum); `@usebutr/bitcoin` has one
 *    (window.unisat / sats-connect / window.btc); SVM and Sui don't.
 */
type PlatformDiscoverer = {
  /**
   * Optional legacy-injected fallback. Subscribes only when consumers
   * haven't disabled it. The hook receives `hasAnyPrimaryAdapter` so
   * the fallback can defer to standards-based discovery when an adapter
   * for the same wallet has already announced through the primary path.
   */
  fallback?: {
    subscribe: (
      onAdapter: (adapter: WalletAdapter) => void,
      opts: { hasAnyPrimaryAdapter: () => boolean },
    ) => () => void;
  };
  /** Stable platform identifier. Used by the aggregator for keying. */
  platform: ChainPlatform;
  /** Primary discovery subscription. */
  subscribe: (onAdapter: (adapter: WalletAdapter) => void) => () => void;
};

export type { PlatformDiscoverer };
