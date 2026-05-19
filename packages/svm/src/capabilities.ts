import type { WalletCapabilities } from "@usebutr/core";

type WalletStandardCapabilityInput = {
  chainCount: number;
  features: {
    events: boolean;
    signAndSendTransaction: boolean;
    signIn: boolean;
    signMessage: boolean;
    signTransaction: boolean;
  };
};

/**
 * Wallet Standard capability mapping.
 *
 * - `getBalance` / `getTransactionReceipt`: Wallet Standard exposes no
 *   balance/receipt RPC.
 * - `requestAccounts`: no programmatic equivalent of EIP-2255 — re-running
 *   `standard:connect` doesn't produce new accounts on any major Wallet
 *   Standard wallet in practice (Phantom Solana, MetaMask Snap, Solflare,
 *   Backpack).
 * - `switchChain`: true when more than one chain is advertised; with a
 *   single chain there's nothing to switch to.
 */
const resolveWalletStandardCapabilities = (
  input: WalletStandardCapabilityInput,
): WalletCapabilities => ({
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: input.features.signAndSendTransaction,
  signIn: input.features.signIn,
  signMessage: input.features.signMessage,
  signTransaction: input.features.signTransaction,
  subscribe: input.features.events,
  switchAccount: false,
  switchChain: input.chainCount > 1,
});

export type { WalletStandardCapabilityInput };
export { resolveWalletStandardCapabilities };
