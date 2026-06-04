import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

import type { PolkadotSignerHandle } from "./injected/adapter";

/**
 * Augment `@usebutr/core`'s `SignerForPlatform` registry with the
 * Polkadot entry. `getSigner()` returns one of two shapes depending on
 * the discovery channel:
 *  - injectedWeb3 (primary) → `PolkadotSignerHandle` (`extensionName` +
 *    `address` + `extension`). Bridge to polkadot-api via
 *    `connectInjectedExtension(extensionName)`.
 *  - Wallet Standard (fallback) → the `WalletStandardWallet`, narrowed by
 *    the consumer via its `features` map.
 */
declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface SignerForPlatform {
    polkadot: PolkadotSignerHandle | WalletStandardWallet;
  }
}
