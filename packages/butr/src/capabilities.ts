import type { WalletCapabilities } from "@butr/core";

// EVM capability logic moved to @butr/evm. SVM capability logic
// moves to @butr/svm in Task 8. WalletConnect/Ledger move with
// their packages in Tasks 9-10. After Task 10 this file disappears.

type CapabilityInput =
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
    case "wallet-standard": {
      return {
        getBalance: false,
        getTransactionReceipt: false,
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
