import type { SatsConnectProvider } from "./injected/sats-connect";
import type { UnisatProvider } from "./injected/unisat";

/**
 * The injected adapters hand back the raw provider they drive. Wallet
 * Standard adapters register `"wallet-standard"` through
 * `@usebutr/wallet-standard-shared`.
 */
declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface WalletSignerRegistry {
    "sats-connect": { provider: SatsConnectProvider };
    unisat: { provider: UnisatProvider };
  }
}
