import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

/**
 * Augment `@usebutr/core`'s `SignerForPlatform` registry with the SVM
 * entry. SVM's `getSigner()` returns the Wallet Standard wallet
 * object, which consumers narrow further via its `features` map.
 */
declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface SignerForPlatform {
    svm: WalletStandardWallet;
  }
}
