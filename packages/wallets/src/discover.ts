import { bitcoinDiscoverer } from "@usebutr/bitcoin";
import type { ChainPlatform, PlatformDiscoverer, WalletAdapter } from "@usebutr/core";
import { CHAIN_PLATFORMS, logWarn } from "@usebutr/core";
import { evmDiscoverer } from "@usebutr/evm";
import { polkadotDiscoverer } from "@usebutr/polkadot";
import { suiDiscoverer } from "@usebutr/sui";
import { svmDiscoverer } from "@usebutr/svm";

import { runDiscoverers } from "./discovery-bus";

type DiscoverOptions = {
  /**
   * Run each platform's secondary channel too: `window.ethereum` and the
   * injected Bitcoin wallets when no standard announcement arrived, and
   * Wallet Standard next to `injectedWeb3` on Polkadot. Defaults to `true`.
   */
  fallbacks?: boolean;
  /** Platforms to discover. Every platform when omitted. */
  platforms?: ReadonlyArray<ChainPlatform>;
};

const DISCOVERERS = {
  bitcoin: bitcoinDiscoverer,
  evm: evmDiscoverer,
  polkadot: polkadotDiscoverer,
  sui: suiDiscoverer,
  svm: svmDiscoverer,
} satisfies Readonly<Record<ChainPlatform, PlatformDiscoverer>>;

/** Every platform's discovery, deduplicated into one callback. */
const discoverWalletAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
  options: DiscoverOptions = {},
): (() => void) => {
  const wanted = new Set(options.platforms ?? CHAIN_PLATFORMS);
  if (wanted.size === 0) {
    logWarn(
      "[butr] autoDiscovery was given an empty platform list, so no wallets will be discovered. Omit it to discover every platform.",
    );
  }
  const selected: Array<readonly [ChainPlatform, PlatformDiscoverer]> = [];
  for (const platform of CHAIN_PLATFORMS) {
    if (wanted.has(platform)) {
      selected.push([platform, DISCOVERERS[platform]]);
    }
  }
  return runDiscoverers(selected, onAdapter, options);
};

export type { DiscoverOptions };
export { discoverWalletAdapters };
