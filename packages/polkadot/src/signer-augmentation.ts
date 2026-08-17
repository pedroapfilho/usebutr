import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

import type { PolkadotSignerHandle } from "./injected/adapter";

/**
 * The `getSigner()` shape depends on the discovery channel: injectedWeb3
 * yields a `PolkadotSignerHandle` to bridge into polkadot-api's
 * `connectInjectedExtension`, Wallet Standard yields the raw wallet.
 */
declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface SignerForPlatform {
    polkadot: PolkadotSignerHandle | WalletStandardWallet;
  }
}
