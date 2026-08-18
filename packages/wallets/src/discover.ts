import { bitcoinDiscoverer } from "@usebutr/bitcoin";
import type { ChainPlatform, PlatformDiscoverer, WalletAdapter } from "@usebutr/core";
import { CHAIN_PLATFORMS, logWarn } from "@usebutr/core";
import { evmDiscoverer } from "@usebutr/evm";
import { polkadotDiscoverer } from "@usebutr/polkadot";
import { suiDiscoverer } from "@usebutr/sui";
import { svmDiscoverer } from "@usebutr/svm";

import { createDiscoveryBus } from "./discovery-bus";

type DiscoverOptions = {
  bitcoin?: boolean;
  evm?: boolean;
  injected?: boolean;
  injectedBitcoin?: boolean;
  polkadot?: boolean;
  polkadotWalletStandard?: boolean;
  sui?: boolean;
  svm?: boolean;
};

type ResolvedDiscoverOptions = {
  bitcoin: boolean;
  evm: boolean;
  injected: boolean;
  injectedBitcoin: boolean;
  polkadot: boolean;
  polkadotWalletStandard: boolean;
  sui: boolean;
  svm: boolean;
};

const KNOWN_DISCOVERERS = {
  bitcoin: bitcoinDiscoverer,
  evm: evmDiscoverer,
  polkadot: polkadotDiscoverer,
  sui: suiDiscoverer,
  svm: svmDiscoverer,
} satisfies Readonly<Record<ChainPlatform, PlatformDiscoverer>>;

type DiscoverInput = true | DiscoverOptions | ReadonlyArray<ChainPlatform>;

const isPlatformList = (
  auto: DiscoverOptions | ReadonlyArray<ChainPlatform>,
): auto is ReadonlyArray<ChainPlatform> => Array.isArray(auto);

const platformsToOptions = (platforms: ReadonlyArray<ChainPlatform>): DiscoverOptions => {
  const options: DiscoverOptions = {};
  for (const platform of platforms) {
    options[platform] = true;
  }
  return options;
};

const resolveDiscoverOptions = (auto: DiscoverInput): ResolvedDiscoverOptions => {
  if (auto === true) {
    return {
      bitcoin: true,
      evm: true,
      injected: true,
      injectedBitcoin: true,
      polkadot: true,
      polkadotWalletStandard: true,
      sui: true,
      svm: true,
    };
  }
  const options = isPlatformList(auto) ? platformsToOptions(auto) : auto;
  const evm = options.evm === true;
  const bitcoin = options.bitcoin === true;
  const polkadot = options.polkadot === true;
  return {
    bitcoin,
    evm,
    injected: evm && options.injected !== false,
    injectedBitcoin: bitcoin && options.injectedBitcoin !== false,
    polkadot,
    polkadotWalletStandard: polkadot && options.polkadotWalletStandard !== false,
    sui: options.sui === true,
    svm: options.svm === true,
  };
};

const FALLBACK_FLAGS = {
  bitcoin: "injectedBitcoin",
  evm: "injected",
  polkadot: "polkadotWalletStandard",
  sui: undefined,
  svm: undefined,
} satisfies Readonly<Record<ChainPlatform, keyof ResolvedDiscoverOptions | undefined>>;

const collectActiveDiscoverers = (
  resolved: ResolvedDiscoverOptions,
): Array<{ discoverer: PlatformDiscoverer; useFallback: boolean }> => {
  const active: Array<{ discoverer: PlatformDiscoverer; useFallback: boolean }> = [];
  for (const platform of CHAIN_PLATFORMS) {
    if (!resolved[platform]) {
      continue;
    }
    const fallbackFlag = FALLBACK_FLAGS[platform];
    active.push({
      discoverer: KNOWN_DISCOVERERS[platform],
      useFallback: fallbackFlag !== undefined && resolved[fallbackFlag],
    });
  }
  return active;
};

type DiscoverDependencies = {
  warn: typeof logWarn;
};

const DEFAULT_DEPENDENCIES: DiscoverDependencies = { warn: logWarn };

const discoverWalletAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
  options?: DiscoverOptions | ReadonlyArray<ChainPlatform>,
  dependencies: DiscoverDependencies = DEFAULT_DEPENDENCIES,
): (() => void) => {
  const resolved = resolveDiscoverOptions(options ?? true);
  const bus = createDiscoveryBus(onAdapter, dependencies.warn);
  const active = collectActiveDiscoverers(resolved);

  if (active.length === 0) {
    dependencies.warn(
      '[butr] autoDiscovery was given options that enable no platforms, so no wallets will be discovered. Pass an allowlist such as autoDiscovery(["evm", "svm"]), or call autoDiscovery() with no arguments to discover every platform.',
    );
  }

  for (const { discoverer, useFallback } of active) {
    bus.register(discoverer.subscribe);
    if (useFallback && discoverer.fallback) {
      const fallback = discoverer.fallback;
      bus.register((emit) => fallback.subscribe(emit, { hasAnyPrimaryAdapter: bus.hasAny }));
    }
  }

  return () => {
    bus.unsubscribeAll();
  };
};

export type { DiscoverDependencies, DiscoverInput, DiscoverOptions };
export { KNOWN_DISCOVERERS, discoverWalletAdapters, resolveDiscoverOptions };
