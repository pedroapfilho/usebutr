import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

/**
 * Augment `@usebutr/core`'s `SignerForPlatform` registry with the Bitcoin
 * entry. Bitcoin's signer surface is fragmented — `getSigner()` may
 * return one of three shapes depending on which adapter discovered the
 * wallet:
 *
 *  - `WalletStandardWallet` — for Phantom, Magic Eden, Leather, OKX
 *    (modern Wallet Standard path).
 *  - A UniSat-shaped provider — for Unisat, OKX legacy, `window.btc`
 *    (injected path).
 *  - A sats-connect `BitcoinProvider` — for Xverse (sats-connect path).
 *
 * The registry surfaces the union honestly so consumers know they need
 * to runtime-narrow.
 */
type UnisatLike = {
  getAccounts: () => Promise<ReadonlyArray<string>>;
  requestAccounts: () => Promise<ReadonlyArray<string>>;
  signMessage: (message: string, type?: string) => Promise<string>;
  signPsbt: (psbtHex: string, options?: Record<string, unknown>) => Promise<string>;
};

type SatsConnectLike = {
  request: (
    method: string,
    params?: Record<string, unknown>,
  ) => Promise<{ error?: { message: string }; result?: unknown }>;
};

declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface SignerForPlatform {
    bitcoin: SatsConnectLike | UnisatLike | WalletStandardWallet;
  }
}
