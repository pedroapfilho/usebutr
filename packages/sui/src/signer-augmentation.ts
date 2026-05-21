import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

/**
 * Augment `@usebutr/core`'s `SignerForPlatform` registry with the Sui
 * entry. Sui's `getSigner()` returns the Wallet Standard wallet
 * object, which consumers narrow further via its `features` map (e.g.
 * `wallet.features["sui:signAndExecuteTransaction"]`).
 */
declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface SignerForPlatform {
    sui: WalletStandardWallet;
  }
}
