import { discoverBitcoinAdapters, discoverInjectedBitcoinAdapter } from "@usebutr/bitcoin";
import type { WalletAdapter } from "@usebutr/core";
import { discoverEvmAdapters, discoverInjectedAdapter } from "@usebutr/evm";
import { discoverSuiAdapters } from "@usebutr/sui";
import { discoverSvmAdapters } from "@usebutr/svm";

import { createDiscoveryBus } from "./discovery-bus";

/**
 * Which platforms to discover. Omitting a flag (or setting it to
 * `false`) skips that platform entirely — useful for apps that target
 * only EVM, only Solana, etc., so unused listeners don't fire and
 * unused adapters don't appear in the provider's `discovery` source.
 *
 * Default when omitted: every platform enabled (`evm`, `svm`, `sui`,
 * `bitcoin`), plus the legacy fallbacks (`injected` for EVM,
 * `injectedBitcoin` for Bitcoin).
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
  /** Bitcoin injected fallback (`window.unisat`, `window.okxwallet.bitcoin`,
   *  `window.XverseProviders.BitcoinProvider`, `window.btc`). Meaningful
   *  only when `bitcoin` is also true. */
  injectedBitcoin?: boolean;
  sui?: boolean;
  svm?: boolean;
};

type ResolvedDiscoverOptions = {
  active: boolean;
  bitcoin: boolean;
  evm: boolean;
  injected: boolean;
  injectedBitcoin: boolean;
  sui: boolean;
  svm: boolean;
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
      sui: true,
      svm: true,
    };
  }
  const evm = auto.evm === true;
  const bitcoin = auto.bitcoin === true;
  return {
    active: true,
    bitcoin,
    evm,
    injected: evm && auto.injected !== false,
    injectedBitcoin: bitcoin && auto.injectedBitcoin !== false,
    sui: auto.sui === true,
    svm: auto.svm === true,
  };
};

/**
 * Subscribe to every enabled discovery protocol at once: EIP-6963 (EVM),
 * Solana Wallet Standard (SVM), Sui Wallet Standard, Bitcoin Wallet
 * Standard, plus optional injected fallbacks for EVM and Bitcoin.
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
  bus.register(resolved.evm ? discoverEvmAdapters : null);
  bus.register(resolved.svm ? discoverSvmAdapters : null);
  bus.register(resolved.sui ? discoverSuiAdapters : null);
  bus.register(resolved.bitcoin ? discoverBitcoinAdapters : null);
  // Injected fallbacks: emit only if no adapter has fired through their
  // standards path by the settle deadline. The bus exposes `hasAny`
  // through the discovery interface rather than via a closure.
  bus.register(
    resolved.injected
      ? (emit) => discoverInjectedAdapter(emit, { hasAnyEip6963Adapter: bus.hasAny })
      : null,
  );
  bus.register(
    resolved.injectedBitcoin
      ? (emit) => discoverInjectedBitcoinAdapter(emit, { hasAnyWalletStandardAdapter: bus.hasAny })
      : null,
  );

  return () => bus.unsubscribeAll();
};

export type { DiscoverOptions };
export { discoverWalletAdapters, resolveDiscoverOptions };
