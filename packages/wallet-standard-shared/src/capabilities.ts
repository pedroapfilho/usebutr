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
 * Wallet Standard → butr capability mapping, shared by every platform
 * package. The flags that are constant across all of them:
 *
 * - `getBalance` / `getTransactionReceipt`: Wallet Standard exposes no
 *   balance/receipt RPC, and butr ships no RPC client of its own.
 * - `requestAccounts`: no programmatic equivalent of EIP-2255; re-running
 *   `standard:connect` doesn't produce new accounts on any major Wallet
 *   Standard wallet in practice (Phantom, MetaMask Snap, Solflare,
 *   Backpack, Xverse, Talisman).
 * - `switchAccount`: no protocol-level silent account switch; the user
 *   picks the account inside the wallet.
 * - `switchChain`: true when the wallet advertises more than one chain in
 *   this namespace. The switch is local re-routing (the per-call `chain`
 *   input), so with a single chain there's nothing to switch to.
 *
 * Each platform package owns only the feature-name → flag mapping, since
 * the feature names differ per namespace.
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
