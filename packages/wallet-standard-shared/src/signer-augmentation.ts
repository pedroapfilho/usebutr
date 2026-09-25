import type { WalletStandardWallet } from "./types";

/** Every Wallet Standard adapter, on any platform, hands back the raw wallet;
 *  reach its features with `getFeature`. */
declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface WalletSignerRegistry {
    "wallet-standard": { wallet: WalletStandardWallet };
  }
}
