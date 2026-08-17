import type { WalletCapabilities } from "@usebutr/core";

/**
 * WC has no EIP-2255 equivalent, so more accounts means re-pairing.
 * `switchChain` holds even for a single-chain session, which can still
 * route `wallet_switchEthereumChain` to the wallet's UI for re-selection.
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
