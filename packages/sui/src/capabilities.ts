import type { WalletCapabilities } from "@usebutr/core";
import { buildWalletCapabilities } from "@usebutr/wallet-standard-shared";

type WalletStandardCapabilityInput = {
  chainCount: number;
  features: {
    events: boolean;
    signAndExecuteTransaction: boolean;
    signMessage: boolean;
    signTransaction: boolean;
  };
};

/**
 * Sui Wallet Standard feature → butr capability mapping. The flags that hold
 * for every namespace are documented on `buildWalletCapabilities`.
 *
 * - `sendTransaction = sui:signAndExecuteTransaction present`. The wallet
 *   broadcasts; consumers receive the digest.
 * - `signTransaction = sui:signTransaction present`. Sign-only; consumers
 *   broadcast with their own RPC client (`@mysten/sui`'s SuiClient).
 * - `signMessage = sui:signPersonalMessage present`.
 * - `signIn = false`. Sui has no SIWS-equivalent feature in Wallet Standard.
 */
const resolveSuiCapabilities = (input: WalletStandardCapabilityInput): WalletCapabilities =>
  buildWalletCapabilities({
    chainCount: input.chainCount,
    events: input.features.events,
    sendTransaction: input.features.signAndExecuteTransaction,
    signIn: false,
    signMessage: input.features.signMessage,
    signTransaction: input.features.signTransaction,
  });

export type { WalletStandardCapabilityInput };
export { resolveSuiCapabilities };
