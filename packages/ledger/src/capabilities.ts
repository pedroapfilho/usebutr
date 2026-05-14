import type { WalletCapabilities } from "@butr/core";

/** Hardware-only — no RPC, no events, no broadcast. */
const LEDGER_CAPABILITIES: WalletCapabilities = {
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: false,
  signMessage: true,
  subscribe: false,
  switchAccount: false,
  // Local state — `switchChain` updates the adapter's chainId.
  switchChain: true,
};

export { LEDGER_CAPABILITIES };
