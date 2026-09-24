import type { Injected } from "./injected/injected-web3";

/**
 * `extensionName` is the `window.injectedWeb3` key polkadot-api's
 * `connectInjectedExtension` takes. No address: sign as the connected
 * wallet's `account`, which follows `setAccount`.
 */
declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface WalletSignerRegistry {
    "polkadot-injected": { extension: Injected; extensionName: string };
  }
}
