import { bitcoinDiscoverer } from "@usebutr/bitcoin";
import type { ChainPlatform, PlatformDiscoverer, WalletAdapter } from "@usebutr/core";
import { CHAIN_PLATFORMS, logWarn } from "@usebutr/core";
import { evmDiscoverer } from "@usebutr/evm";
import { polkadotDiscoverer } from "@usebutr/polkadot";
import { suiDiscoverer } from "@usebutr/sui";
import { svmDiscoverer } from "@usebutr/svm";

import { createDiscoveryBus } from "./discovery-bus";

/**
 * Which platforms to discover, as an allowlist: a platform is discovered
 * only if its flag is explicitly `true`. Every unlisted platform is off,
 * so `{}` enables nothing. Passing no options at all is the separate
 * "everything" case.
 *
 * Restricting platforms means unused listeners don't fire and unused
 * adapters don't appear in the provider's `discovery` source.
 *
 * The three fallback flags invert that rule: each defaults to `true`
 * when its primary platform is enabled, and is only consulted then.
 * They emit only if the primary path produced no adapter by the settle
 * deadline; disable them when targeting standards-compliant wallets
 * only, to skip the timer.
 *
 * Prefer the array form (`autoDiscovery(["evm", "svm"])`) when you don't
 * need the fallback flags: it reads as the allowlist it is, and an empty
 * array is visibly empty in a way `{}` is not.
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

/**
 * Registry of known `PlatformDiscoverer`s keyed by `ChainPlatform`.
 * Adding a new platform = one import + one registry entry.
 *
 * The aggregator no longer carries per-platform discovery logic;
 * each entry self-describes its primary + fallback subscription.
 */
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
 * Resolve an `auto` prop input into a concrete set of enabled
 * platforms. The single place where the `DiscoverInput` union is
 * interpreted.
 *
 * **Defaults**
 *
 *  - `true` → every platform enabled, every fallback on. The
 *    `<WalletManagerProvider auto>` shorthand and the bare
 *    `autoDiscovery()` call use this path.
 *  - Array form → allowlist. `["evm", "svm"]` discovers exactly those,
 *    with each platform's fallback on.
 *  - Object form → opt-in. `{ evm: true }` discovers only EVM;
 *    unspecified flags default to `false`, so `{}` enables nothing.
 *    Each fallback defaults to `true` IF its primary platform is also
 *    enabled (`injected` follows `evm`; `injectedBitcoin` follows
 *    `bitcoin`; `polkadotWalletStandard` follows `polkadot`).
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
 * Subscribe to every enabled discovery protocol at once. Each platform
 * package exports its own `PlatformDiscoverer` describing primary +
 * fallback subscription; this function composes them.
 *
 * `onAdapter` is called at most once per unique wallet, deduplicated by
 * `adapter.id`. See `resolveDiscoverOptions` for the defaults that
 * apply when `options` is omitted.
 *
 * The returned function unsubscribes from every listener that was
 * actually attached.
 */
const discoverWalletAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
  options?: DiscoverOptions | ReadonlyArray<ChainPlatform>,
): (() => void) => {
  const resolved = resolveDiscoverOptions(options ?? true);
  const bus = createDiscoveryBus(onAdapter);
  const active = collectActiveDiscoverers(resolved);

  // An allowlist built at runtime (from an env var, a filter, a config
  // object) can come back empty, and the result is indistinguishable
  // from "the user has no wallets installed": zero listeners, zero
  // announcements, no error. Only reachable when options were passed;
  // the omitted-argument path enables everything.
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
