import type { WalletSource } from "../wallet-source";

import type { WalletAdapter } from "./wallet";

/**
 * Each platform package exports exactly one; `@usebutr/wallets` composes
 * them via a registry keyed by `ChainPlatform`, so a new chain adds a
 * descriptor and a registry entry, not aggregator logic.
 */
type PlatformDiscoverer = {
  /**
   * Legacy-injected channel (window.ethereum, window.unisat, …). Must
   * consult `hasAnyPrimaryAdapter` and stay quiet when standards-based
   * discovery already announced the same wallet, or it double-lists.
   */
  fallback?: {
    subscribe: (
      onAdapter: (adapter: WalletAdapter) => void,
      options: { hasAnyPrimaryAdapter: () => boolean },
    ) => () => void;
  };
  /** Primary discovery subscription. */
  subscribe: WalletSource;
};

export type { PlatformDiscoverer };
