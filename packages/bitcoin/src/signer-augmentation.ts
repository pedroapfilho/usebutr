import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

/**
 * Bitcoin's signer surface is fragmented: `getSigner()` returns a
 * `WalletStandardWallet`, a UniSat-shaped provider, or a sats-connect
 * `BitcoinProvider` depending on which adapter discovered the wallet.
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
