import type { WalletCapabilities } from "@usebutr/core";

/** Hardware-only: no RPC, no events, no broadcast. */
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
  switchChain: true,
};

/** Profile for the app adapters that expose a sign-only transaction path
 *  (Solana, Sui, Bitcoin). The EVM app adapter has none, so the base profile
 *  keeps `signTransaction: false`. */
const LEDGER_SIGN_TRANSACTION_CAPABILITIES: WalletCapabilities = {
  ...LEDGER_CAPABILITIES,
  signTransaction: true,
};

export { LEDGER_CAPABILITIES, LEDGER_SIGN_TRANSACTION_CAPABILITIES };
