import type { WalletCapabilities } from "@usebutr/core";

/** Hardware-only — no RPC, no events, no broadcast. */
const LEDGER_CAPABILITIES: WalletCapabilities = {
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: false,
  signIn: false,
  signMessage: true,
  signTransaction: false,
  subscribe: false,
  switchAccount: false,
  // Local state — `switchChain` updates the adapter's chainId.
  switchChain: true,
};

export { LEDGER_CAPABILITIES };
