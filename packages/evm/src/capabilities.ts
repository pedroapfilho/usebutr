import type { WalletCapabilities } from "@usebutr/core";

// Allow-list of EIP-6963 wallets whose `wallet_requestPermissions` call
// actually surfaces a fresh account-picker UI (the spec intent).
// Every other tested wallet either rejects the method (Phantom EVM,
// Coinbase Wallet) or silently returns the existing accounts (Rabby,
// Listed by EIP-6963 `rdns`. Add a wallet here only after verifying
// picker. The capability flag gates UI affordances — `requestAccounts`
// stays callable on every adapter for consumers with wallet-specific
const EIP6963_RDNS_WITH_REQUEST_ACCOUNTS = new Set<string>([
  "io.metamask", // MetaMask — verified May 2026
]);

type Eip6963CapabilityInput = { rdns: string };

const resolveEip6963Capabilities = (input: Eip6963CapabilityInput): WalletCapabilities => ({
  getBalance: true,
  getTransactionReceipt: true,
  requestAccounts: EIP6963_RDNS_WITH_REQUEST_ACCOUNTS.has(input.rdns),
  sendTransaction: true,
  signIn: false,
  signMessage: true,
  // EVM adapters don't expose a standalone signTransaction (most
  signTransaction: false,
  subscribe: true,
  switchAccount: false,
  switchChain: true,
});

export type { Eip6963CapabilityInput };
export { EIP6963_RDNS_WITH_REQUEST_ACCOUNTS, resolveEip6963Capabilities };
