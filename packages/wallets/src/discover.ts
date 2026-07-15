import { bitcoinDiscoverer } from "@usebutr/bitcoin";
import type { ChainPlatform, PlatformDiscoverer, WalletAdapter } from "@usebutr/core";
import { evmDiscoverer } from "@usebutr/evm";
import { polkadotDiscoverer } from "@usebutr/polkadot";
import { suiDiscoverer } from "@usebutr/sui";
import { svmDiscoverer } from "@usebutr/svm";

import { createDiscoveryBus } from "./discovery-bus";

/**
 * Which platforms to discover. Omitting a flag (or setting it to
 * `false`) skips that platform entirely; useful for apps that target
 * only one chain so unused listeners don't fire and unused adapters
 * don't appear in the provider's `discovery` source.
 *
 * Default when omitted: every platform enabled (`evm`, `svm`, `sui`,
 * `bitcoin`, `polkadot`), plus the fallbacks (`injected` for EVM,
 * `injectedBitcoin` for Bitcoin, `polkadotWalletStandard` for
 * Polkadot).
 *
 * The legacy fallbacks emit only when their primary path has not
 * already produced an adapter by the settle deadline. Disable when
 * targeting only standards-compliant wallets to skip the timer.
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
  active: boolean;
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
 * Resolve an `auto` prop input into a concrete set of enabled
 * platforms. The single place where the `true | DiscoverOptions`
 * union is interpreted.
 *
 * **Defaults**
 *
 *  - `true` (or omitted) → every platform enabled, both injected
 *    fallbacks on. The `<WalletManagerProvider auto>` shorthand uses
 *    this path.
 *  - `false` (or `undefined`) → discovery disabled.
 *  - Object form → opt-in. `{ evm: true }` discovers only EVM;
 *    unspecified flags default to `false`. Each injected fallback
 *    defaults to `true` IF its primary platform is also enabled
 *    (`injected` follows `evm`; `injectedBitcoin` follows `bitcoin`).
 */
const resolveDiscoverOptions = (
  auto: true | false | DiscoverOptions | undefined,
): ResolvedDiscoverOptions => {
  if (auto === undefined || auto === false) {
    return {
      active: false,
      bitcoin: false,
      evm: false,
      injected: false,
      injectedBitcoin: false,
      polkadot: false,
      polkadotWalletStandard: false,
      sui: false,
      svm: false,
    };
  }
  if (auto === true) {
    return {
      active: true,
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
  const evm = auto.evm === true;
  const bitcoin = auto.bitcoin === true;
  const polkadot = auto.polkadot === true;
  return {
    active: true,
    bitcoin,
    evm,
    injected: evm && auto.injected !== false,
    injectedBitcoin: bitcoin && auto.injectedBitcoin !== false,
    polkadot,
    polkadotWalletStandard: polkadot && auto.polkadotWalletStandard !== false,
    sui: auto.sui === true,
    svm: auto.svm === true,
  };
};

/** Map `ResolvedDiscoverOptions` flags to the discoverer registry. */
const collectActiveDiscoverers = (
  resolved: ResolvedDiscoverOptions,
): Array<{ discoverer: PlatformDiscoverer; useFallback: boolean }> => {
  const out: Array<{ discoverer: PlatformDiscoverer; useFallback: boolean }> = [];
  if (resolved.evm) {
    out.push({ discoverer: KNOWN_DISCOVERERS.evm, useFallback: resolved.injected });
  }
  if (resolved.svm) {
    out.push({ discoverer: KNOWN_DISCOVERERS.svm, useFallback: false });
  }
  if (resolved.sui) {
    out.push({ discoverer: KNOWN_DISCOVERERS.sui, useFallback: false });
  }
  if (resolved.bitcoin) {
    out.push({ discoverer: KNOWN_DISCOVERERS.bitcoin, useFallback: resolved.injectedBitcoin });
  }
  if (resolved.polkadot) {
    out.push({
      discoverer: KNOWN_DISCOVERERS.polkadot,
      useFallback: resolved.polkadotWalletStandard,
    });
  }
  return out;
};

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
  options?: DiscoverOptions,
): (() => void) => {
  const resolved = resolveDiscoverOptions(options ?? true);
  const bus = createDiscoveryBus(onAdapter);

  for (const { discoverer, useFallback } of collectActiveDiscoverers(resolved)) {
    bus.register(discoverer.subscribe);
    if (useFallback && discoverer.fallback) {
      const fallback = discoverer.fallback;
      bus.register((emit) => fallback.subscribe(emit, { hasAnyPrimaryAdapter: bus.hasAny }));
    }
  }

  return () => bus.unsubscribeAll();
};

export type { DiscoverOptions };
export { KNOWN_DISCOVERERS, discoverWalletAdapters, resolveDiscoverOptions };
