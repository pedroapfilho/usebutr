import type { Eip1193Provider } from "./eip1193";

/** Every EVM adapter built on an EIP-1193 provider (injected, EIP-6963,
 *  WalletConnect's EVM namespace) hands back that provider. */
declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface WalletSignerRegistry {
    eip1193: { provider: Eip1193Provider };
  }
}
