import type { WalletCapabilities } from "@butr/core";

// Allow-list of EIP-6963 wallets whose `wallet_requestPermissions` call
// actually surfaces a fresh account-picker UI (the spec intent).
// Every other tested wallet either rejects the method (Phantom EVM,
// Coinbase Wallet) or silently returns the existing accounts (Rabby,
// OKX, Binance, Backpack EVM), making the affordance a no-op.
//
// Listed by EIP-6963 `rdns`. Add a wallet here only after verifying
// against the real install that calling `requestAccounts` surfaces a
// picker. The capability flag gates UI affordances — `requestAccounts`
// stays callable on every adapter for consumers with wallet-specific
// flows.
const EIP6963_RDNS_WITH_REQUEST_ACCOUNTS = new Set<string>([
  "io.metamask", // MetaMask — verified May 2026
]);

type Eip6963CapabilityInput = { rdns: string };

const resolveEip6963Capabilities = (input: Eip6963CapabilityInput): WalletCapabilities => ({
  getBalance: true,
  getTransactionReceipt: true,
  requestAccounts: EIP6963_RDNS_WITH_REQUEST_ACCOUNTS.has(input.rdns),
  sendTransaction: true,
  // SIWS is Solana-only.
  signIn: false,
  signMessage: true,
  // EVM adapters don't expose a standalone signTransaction (most
  // wallets reject eth_signTransaction); use sendTx.
  signTransaction: false,
  subscribe: true,
  // EIP-1193 has no silent "use address X" RPC.
  switchAccount: false,
  switchChain: true,
});

export type { Eip6963CapabilityInput };
export { EIP6963_RDNS_WITH_REQUEST_ACCOUNTS, resolveEip6963Capabilities };
