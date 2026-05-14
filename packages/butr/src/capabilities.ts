import type { WalletCapabilities } from "@butr/core";

// EVM + SVM capability logic moved to @butr/evm and @butr/svm.
// WalletConnect / Ledger move with their packages in Tasks 9-10.
// After Task 10 this file disappears.

type CapabilityInput = { transport: "walletconnect" } | { transport: "ledger" };

const resolveCapabilities = (input: CapabilityInput): WalletCapabilities => {
  switch (input.transport) {
    case "walletconnect": {
      return {
        getBalance: true,
        getTransactionReceipt: true,
        requestAccounts: false,
        sendTransaction: true,
        signMessage: true,
        subscribe: true,
        switchAccount: false,
        switchChain: true,
      };
    }
    case "ledger": {
      return {
        getBalance: false,
        getTransactionReceipt: false,
        requestAccounts: false,
        sendTransaction: false,
        signMessage: true,
        subscribe: false,
        switchAccount: false,
        switchChain: true,
      };
    }
  }
};

export type { CapabilityInput };
export { resolveCapabilities };
