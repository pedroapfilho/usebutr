import type { WalletCapabilities } from "@usebutr/core";

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
 * Sui Wallet Standard capability mapping. Mirrors the SVM resolver:
 * butr ships no RPC, so balance/receipt always false.
 *
 * - `sendTransaction = sui:signAndExecuteTransaction present`. The wallet
 *   broadcasts; consumers receive the digest.
 * - `signTransaction = sui:signTransaction present`. Sign-only; consumers
 *   broadcast with their own RPC client (`@mysten/sui`'s SuiClient).
 * - `signMessage = sui:signPersonalMessage present`.
 * - `signIn = false`. Sui has no SIWS-equivalent feature in Wallet Standard.
 * - `switchChain = chainCount > 1`. Same posture as SVM — local re-routing
 *   for `signAndExecuteTransaction`'s per-call `chain` input.
 */
const resolveSuiCapabilities = (input: WalletStandardCapabilityInput): WalletCapabilities => ({
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: input.features.signAndExecuteTransaction,
  signIn: false,
  signMessage: input.features.signMessage,
  signTransaction: input.features.signTransaction,
  subscribe: input.features.events,
  switchAccount: false,
  switchChain: input.chainCount > 1,
});

export type { WalletStandardCapabilityInput };
export { resolveSuiCapabilities };
