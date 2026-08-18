import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

import type { SatsConnectProvider } from "./injected/sats-connect";
import type { UnisatProvider } from "./injected/unisat";

/**
 * Bitcoin's signer surface is fragmented: `getSigner()` returns a
 * `WalletStandardWallet`, a UniSat-shaped provider, or a sats-connect
 * `BitcoinProvider` depending on which adapter discovered the wallet.
 */
declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface SignerForPlatform {
    bitcoin: SatsConnectProvider | UnisatProvider | WalletStandardWallet;
  }
}
