import type { BitcoinAdapter, WalletAdapter } from "@usebutr/core";

import type { SatsConnectProvider } from "./sats-connect";
import { buildSatsConnectAdapter } from "./sats-connect";
import type { UnisatProvider } from "./unisat";
import { buildUnisatAdapter } from "./unisat";

type InjectedHost = {
  btc?: UnisatProvider;
  okxwallet?: { bitcoin?: UnisatProvider };
  unisat?: UnisatProvider;
  XverseProviders?: { BitcoinProvider?: SatsConnectProvider };
};

declare global {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- DOM globals require interface merging.
  interface Window {
    btc?: UnisatProvider;
    okxwallet?: { bitcoin?: UnisatProvider };
    unisat?: UnisatProvider;
    XverseProviders?: { BitcoinProvider?: SatsConnectProvider };
  }
}

type InjectedBitcoinDiscoveryOptions = {
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
  return window;
};

const probeProviders = (host: InjectedHost): Array<BitcoinAdapter> => {
  const adapters: Array<BitcoinAdapter> = [];
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

  return adapters;
};

/**
 * Last-resort path for wallets that don't announce via Wallet Standard:
 * `window.unisat`, OKX and Xverse. On its own it lists a wallet present on
 * both channels twice; `autoDiscovery` lists each one once.
 */
const discoverInjectedBitcoinAdapter = (
  onAdapter: (adapter: WalletAdapter) => void,
  options: InjectedBitcoinDiscoveryOptions = {},
): (() => void) => {
  const host = readHost(options.target);
  for (const adapter of host === null ? [] : probeProviders(host)) {
    onAdapter(adapter);
  }
  return () => {};
};

/**
 * `window.btc` names no wallet, so `autoDiscovery` lists it only when no other
 * Bitcoin wallet was found. Skipped when it aliases `window.unisat` or OKX.
 */
const discoverLegacyBitcoinAdapter = (
  onAdapter: (adapter: WalletAdapter) => void,
  options: InjectedBitcoinDiscoveryOptions = {},
): (() => void) => {
  const host = readHost(options.target);
  const btc = host?.btc;
  if (btc !== undefined && btc !== host?.unisat && btc !== host?.okxwallet?.bitcoin) {
    onAdapter(buildUnisatAdapter("injected:bitcoin:legacy", "Browser Bitcoin wallet", btc));
  }
  return () => {};
};

export type { InjectedBitcoinDiscoveryOptions };
export { GENERIC_BITCOIN_ICON } from "./icon";
export { discoverInjectedBitcoinAdapter, discoverLegacyBitcoinAdapter };
