import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

/**
 * Sui's `getSigner()` hands back the Wallet Standard wallet, which consumers
 * narrow through its `features` map.
 */
declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface SignerForPlatform {
    sui: WalletStandardWallet;
  }
}
