import type { BitcoinAdapter, WalletSource } from "@usebutr/core";

import type { SatsConnectProvider } from "./sats-connect";
import { buildSatsConnectAdapter } from "./sats-connect";
import type { UnisatProvider } from "./unisat";
import { buildUnisatAdapter } from "./unisat";

declare global {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- DOM globals require interface merging.
  interface Window {
    btc?: UnisatProvider;
    okxwallet?: { bitcoin?: UnisatProvider };
    unisat?: UnisatProvider;
    XverseProviders?: { BitcoinProvider?: SatsConnectProvider };
  }
}

const browserWindow = (): Window | undefined =>
  typeof window === "undefined" ? undefined : window;

const probeProviders = (host: Window): Array<BitcoinAdapter> => {
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
const discoverInjectedBitcoinAdapter: WalletSource = (onAdapter) => {
  const host = browserWindow();

  for (const adapter of host === undefined ? [] : probeProviders(host)) {
    onAdapter(adapter);
  }

  return () => {};
};

/**
 * `window.btc` names no wallet, so `autoDiscovery` lists it only when no other
 * Bitcoin wallet was found. Skipped when it aliases `window.unisat` or OKX.
 */
const discoverLegacyBitcoinAdapter: WalletSource = (onAdapter) => {
  const host = browserWindow();
  const btc = host?.btc;

  if (btc !== undefined && btc !== host?.unisat && btc !== host?.okxwallet?.bitcoin) {
    onAdapter(buildUnisatAdapter("injected:bitcoin:legacy", "Browser Bitcoin wallet", btc));
  }

  return () => {};
};

export { GENERIC_BITCOIN_ICON } from "./icon";

export { discoverInjectedBitcoinAdapter, discoverLegacyBitcoinAdapter };
