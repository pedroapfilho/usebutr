import type { WalletCapabilities } from "@usebutr/core";

type WalletCapabilityProfile = {
  /** Chains the wallet advertises in this namespace. */
  chainCount: number;
  /** Wallet advertises `standard:events`. */
  events: boolean;
  /** Wallet advertises a sign-and-broadcast feature:
   *  `solana:signAndSendTransaction`, `sui:signAndExecuteTransaction`,
   *  `bitcoin:sendTransfer`. */
  sendTransaction: boolean;
  /** Wallet advertises `solana:signIn`. No other namespace has an
   *  equivalent, so every non-SVM caller passes `false`. */
  signIn: boolean;
  signMessage: boolean;
  /** Wallet advertises a sign-only feature: `solana:signTransaction`,
   *  `sui:signTransaction`, `bitcoin:signPsbt`. */
  signTransaction: boolean;
};

/**
 * Wallet Standard has no balance/receipt RPC, no EIP-2255 equivalent, and
 * no silent account switch, so those flags are false everywhere.
 * `switchChain` re-routes locally, so it needs a second advertised chain.
 */
const buildWalletCapabilities = (profile: WalletCapabilityProfile): WalletCapabilities => ({
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: profile.sendTransaction,
  signIn: profile.signIn,
  signMessage: profile.signMessage,
  signTransaction: profile.signTransaction,
  subscribe: profile.events,
  switchAccount: false,
  switchChain: profile.chainCount > 1,
});

export type { WalletCapabilityProfile };
export { buildWalletCapabilities };
