import type { UniversalProviderLike } from "./loader";

/** The Solana, Sui and Bitcoin namespaces hand back the paired provider and
 *  the adapter's current chain: pass `chainId` as `request`'s second
 *  argument, or UniversalProvider routes the call to the session's first
 *  namespace. The EVM namespace resolves `eip1193` instead. */
declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface WalletSignerRegistry {
    walletconnect: { chainId: string; provider: UniversalProviderLike };
  }
}
