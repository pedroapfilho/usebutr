import type { WalletAdapter } from "@usebutr/core";

import type { SatsConnectProvider } from "./sats-connect";
import { buildSatsConnectAdapter } from "./sats-connect";
import type { UnisatProvider } from "./unisat";
import { buildUnisatAdapter } from "./unisat";

const DEFAULT_SETTLE_MS = 150;

type InjectedHost = {
  btc?: UnisatProvider;
  okxwallet?: { bitcoin?: UnisatProvider };
  unisat?: UnisatProvider;
  XverseProviders?: { BitcoinProvider?: SatsConnectProvider };
};

type InjectedBitcoinDiscoveryOptions = {
  /** Suppresses emission when Wallet Standard discovery has already
   *  registered a Bitcoin adapter for the same browser session. */
  hasAnyWalletStandardAdapter?: () => boolean;
  /** Settle deadline in ms before the fallback fires. Same default and
   *  intent as the EVM injected fallback. */
  settleMs?: number;
  /** Override the global host (tests, iframes). */
  target?: InjectedHost | null;
};

const readHost = (target: InjectedBitcoinDiscoveryOptions["target"]): InjectedHost | null => {
  if (target !== undefined) {
    return target;
  }
  if (typeof window === "undefined") {
    return null;
  }
  // `window` carries the injected wallet globals (`unisat`, `okxwallet`,
  // etc.) as an untyped host object; `InjectedHost` names the four keys
  // butr probes, all optional and read defensively in `probeProviders`.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- untyped injected-wallet window globals
  return window as unknown as InjectedHost;
};

const probeProviders = (host: InjectedHost): Array<WalletAdapter> => {
  const adapters: Array<WalletAdapter> = [];
  const seen = new Set<UnisatProvider | SatsConnectProvider>();

  if (host.unisat && !seen.has(host.unisat)) {
    seen.add(host.unisat);
    adapters.push(buildUnisatAdapter("injected:bitcoin:unisat", "Unisat", host.unisat));
  }

  const okxBitcoin = host.okxwallet?.bitcoin;
  if (okxBitcoin && !seen.has(okxBitcoin)) {
    seen.add(okxBitcoin);
    adapters.push(buildUnisatAdapter("injected:bitcoin:okx", "OKX Wallet (Bitcoin)", okxBitcoin));
  }

  const xverse = host.XverseProviders?.BitcoinProvider;
  if (xverse && !seen.has(xverse)) {
    seen.add(xverse);
    adapters.push(buildSatsConnectAdapter("injected:bitcoin:xverse", "Xverse", xverse));
  }

  if (host.btc && !seen.has(host.btc)) {
    seen.add(host.btc);
    adapters.push(
      buildUnisatAdapter("injected:bitcoin:legacy", "Browser Bitcoin wallet", host.btc),
    );
  }

  return adapters;
};

/**
 * Last-resort discovery path for Bitcoin wallets that DON'T announce via
 * Wallet Standard. Probes, in order: `window.unisat`,
 * `window.okxwallet.bitcoin`, `window.XverseProviders.BitcoinProvider`,
 * `window.btc`.
 *
 * Wallet Standard wallets (Phantom, Magic Eden, Leather, modern OKX
 * builds) are already handled by `discoverBitcoinAdapters`. This
 * fallback waits `settleMs` (default 150ms), consults
 * `hasAnyWalletStandardAdapter` if provided, and emits adapters for
 * any injected providers that weren't already covered.
 *
 * Each emitted adapter has a stable id prefix (`injected:bitcoin:*`)
 * so consumers can distinguish them in the picker UI.
 */
const discoverInjectedBitcoinAdapter = (
  onAdapter: (adapter: WalletAdapter) => void,
  options: InjectedBitcoinDiscoveryOptions = {},
): (() => void) => {
  const settleMs = options.settleMs ?? DEFAULT_SETTLE_MS;
  let cancelled = false;
  const timer = setTimeout(() => {
    if (cancelled) {
      return;
    }
    if (options.hasAnyWalletStandardAdapter?.() === true) {
      return;
    }
    const host = readHost(options.target);
    if (host === null) {
      return;
    }
    const adapters = probeProviders(host);
    for (const adapter of adapters) {
      onAdapter(adapter);
    }
  }, settleMs);

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
};

export type { InjectedBitcoinDiscoveryOptions };
export { GENERIC_BITCOIN_ICON } from "./icon";
export { discoverInjectedBitcoinAdapter };
