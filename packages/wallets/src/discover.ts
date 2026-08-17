import { bitcoinDiscoverer } from "@usebutr/bitcoin";
import type { ChainPlatform, PlatformDiscoverer, WalletAdapter } from "@usebutr/core";
import { CHAIN_PLATFORMS, logWarn } from "@usebutr/core";
import { evmDiscoverer } from "@usebutr/evm";
import { polkadotDiscoverer } from "@usebutr/polkadot";
import { suiDiscoverer } from "@usebutr/sui";
import { svmDiscoverer } from "@usebutr/svm";

import { createDiscoveryBus } from "./discovery-bus";

/**
 * An allowlist: a platform is off unless its flag is explicitly `true`, so
 * `{}` enables nothing. The fallback flags invert that, defaulting to `true`
 * when their primary platform is on; turning one off also skips its timer.
 */
type DiscoverOptions = {
  bitcoin?: boolean;
  evm?: boolean;
  /** EVM-only injected fallback (`window.ethereum`). Meaningful only
   *  when `evm` is also true. */
  injected?: boolean;
  /** Bitcoin injected fallback (`window.unisat`,
   *  `window.okxwallet.bitcoin`, `window.XverseProviders.BitcoinProvider`,
   *  `window.btc`). Meaningful only when `bitcoin` is also true. */
  injectedBitcoin?: boolean;
  polkadot?: boolean;
  /** Wallet Standard `polkadot:*` fallback. Meaningful only when
   *  `polkadot` is also true. Defaults to `true` when polkadot is
   *  enabled. */
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

/** Each entry self-describes its primary and fallback subscription, so adding
 *  a platform is one import plus one registry entry. */
const KNOWN_DISCOVERERS: Readonly<Record<ChainPlatform, PlatformDiscoverer>> = {
  bitcoin: bitcoinDiscoverer,
  evm: evmDiscoverer,
  polkadot: polkadotDiscoverer,
  sui: suiDiscoverer,
  svm: svmDiscoverer,
};

/**
 * The three input forms `autoDiscovery` accepts. `true` is internal: it
 * is what an omitted argument resolves to.
 */
type DiscoverInput = true | DiscoverOptions | ReadonlyArray<ChainPlatform>;

/** `Array.isArray` alone leaves the object branch un-narrowed against a
 *  `ReadonlyArray` member, so the union is discriminated through an
 *  explicit predicate rather than a cast. */
const isPlatformList = (
  auto: DiscoverOptions | ReadonlyArray<ChainPlatform>,
): auto is ReadonlyArray<ChainPlatform> => Array.isArray(auto);

/** Widen an allowlist array into the equivalent object form, so the
 *  resolver below has one shape to interpret. `["evm"]` is exactly
 *  `{ evm: true }`, fallbacks included. */
const platformsToOptions = (platforms: ReadonlyArray<ChainPlatform>): DiscoverOptions => {
  const options: DiscoverOptions = {};
  for (const platform of platforms) {
    options[platform] = true;
  }
  return options;
};

/**
 * The single place the `DiscoverInput` union is interpreted. `true` enables
 * everything; the array and object forms are allowlists whose fallbacks
 * default on only when their primary platform is enabled.
 */
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

/**
 * Which resolved flag gates each platform's fallback channel. Platforms
 * absent from the map have no fallback to gate (SVM and Sui).
 */
const FALLBACK_FLAGS: Readonly<Partial<Record<ChainPlatform, keyof ResolvedDiscoverOptions>>> = {
  bitcoin: "injectedBitcoin",
  evm: "injected",
  polkadot: "polkadotWalletStandard",
};

/** Map `ResolvedDiscoverOptions` flags to the discoverer registry. */
const collectActiveDiscoverers = (
  resolved: ResolvedDiscoverOptions,
): Array<{ discoverer: PlatformDiscoverer; useFallback: boolean }> =>
  CHAIN_PLATFORMS.filter((platform) => resolved[platform]).map((platform) => {
    const fallbackFlag = FALLBACK_FLAGS[platform];
    return {
      discoverer: KNOWN_DISCOVERERS[platform],
      useFallback: fallbackFlag !== undefined && resolved[fallbackFlag],
    };
  });

/**
 * Subscribes to every enabled discovery protocol at once. `onAdapter` fires at
 * most once per wallet, deduplicated by `adapter.id`.
 */
const discoverWalletAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
  options?: DiscoverOptions | ReadonlyArray<ChainPlatform>,
): (() => void) => {
  const resolved = resolveDiscoverOptions(options ?? true);
  const bus = createDiscoveryBus(onAdapter);
  const active = collectActiveDiscoverers(resolved);

  if (active.length === 0) {
    logWarn(
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

export type { DiscoverInput, DiscoverOptions };
export { KNOWN_DISCOVERERS, discoverWalletAdapters, resolveDiscoverOptions };
