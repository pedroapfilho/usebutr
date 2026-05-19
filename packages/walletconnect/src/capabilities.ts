import type { WalletCapabilities } from "@usebutr/core";

/**
 * WalletConnect capabilities are fixed once paired — the adapter speaks
 * EIP-1193 against the relay. No transport-specific input.
 *
 * - `requestAccounts`: no EIP-2255 equivalent; "request more accounts"
 *   means tearing down the session and re-pairing.
 * - `switchChain`: true regardless of session-namespace chain count — a
 *   single-chain session can still route `wallet_switchEthereumChain` to
 *   the wallet's UI for re-selection.
 */
const WALLETCONNECT_CAPABILITIES: WalletCapabilities = {
  getBalance: true,
  getTransactionReceipt: true,
  requestAccounts: false,
  sendTransaction: true,
  signIn: false,
  signMessage: true,
  signTransaction: false,
  subscribe: true,
  switchAccount: false,
  switchChain: true,
};

export { WALLETCONNECT_CAPABILITIES };
