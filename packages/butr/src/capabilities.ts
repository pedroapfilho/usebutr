import type { WalletCapabilities } from "./types";

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

type CapabilityInput =
  | { rdns: string; transport: "eip6963" }
  | {
      chainCount: number;
      features: {
        events: boolean;
        signAndSendTransaction: boolean;
        signMessage: boolean;
      };
      transport: "wallet-standard";
    }
  | { transport: "walletconnect" }
  | { transport: "ledger" };

const resolveCapabilities = (input: CapabilityInput): WalletCapabilities => {
  switch (input.transport) {
    case "eip6963": {
      return {
        getBalance: true,
        getTransactionReceipt: true,
        requestAccounts: EIP6963_RDNS_WITH_REQUEST_ACCOUNTS.has(input.rdns),
        sendTransaction: true,
        signMessage: true,
        subscribe: true,
        // EIP-1193 has no silent "use address X" RPC.
        switchAccount: false,
        switchChain: true,
      };
    }
    case "wallet-standard": {
      return {
        // Wallet Standard exposes no balance/receipt RPC.
        getBalance: false,
        getTransactionReceipt: false,
        // No programmatic equivalent of EIP-2255 — re-running
        // `standard:connect` doesn't produce new accounts on any major
        // Wallet Standard wallet in practice (Phantom Solana, MetaMask
        // Snap, Solflare, Backpack).
        requestAccounts: false,
        sendTransaction: input.features.signAndSendTransaction,
        signMessage: input.features.signMessage,
        subscribe: input.features.events,
        switchAccount: false,
        switchChain: input.chainCount > 1,
      };
    }
    case "walletconnect": {
      return {
        // Once paired, the adapter speaks EIP-1193 against the relay.
        getBalance: true,
        getTransactionReceipt: true,
        // WalletConnect has no EIP-2255 equivalent; "request more
        // accounts" means tearing down the session and re-pairing.
        requestAccounts: false,
        sendTransaction: true,
        signMessage: true,
        subscribe: true,
        switchAccount: false,
        // True regardless of session-namespace chain count — even a
        // single-chain session can route `wallet_switchEthereumChain`
        // to the wallet's UI for re-selection.
        switchChain: true,
      };
    }
    case "ledger": {
      return {
        // Hardware-only — no RPC, no events, no broadcast.
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
    }
  }
};

export type { CapabilityInput };
export { EIP6963_RDNS_WITH_REQUEST_ACCOUNTS, resolveCapabilities };
