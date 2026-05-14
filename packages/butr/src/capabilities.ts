import type { WalletCapabilities } from "@butr/core";

// EVM, SVM, and WalletConnect capability logic moved to their packages.
// Ledger moves with its package in Task 10. After Task 10 this file
// disappears.

type CapabilityInput = { transport: "ledger" };

const resolveCapabilities = (_input: CapabilityInput): WalletCapabilities => ({
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: false,
  signMessage: true,
  subscribe: false,
  switchAccount: false,
  switchChain: true,
});

export type { CapabilityInput };
export { resolveCapabilities };
