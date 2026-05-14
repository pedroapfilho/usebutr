import { describe, expect, it } from "vitest";
import { resolveCapabilities } from "../capabilities";

// EIP-6963 cases moved to @butr/evm/src/__tests__/capabilities.test.ts.
// Wallet Standard cases moved to @butr/svm/src/__tests__/capabilities.test.ts.
// WalletConnect + Ledger cases move with their packages.

describe("resolveCapabilities", () => {
  describe("WalletConnect", () => {
    it("returns the same shape as EIP-6963 except for requestAccounts (no EIP-2255)", () => {
      const caps = resolveCapabilities({ transport: "walletconnect" });
      expect(caps).toEqual({
        getBalance: true,
        getTransactionReceipt: true,
        requestAccounts: false,
        sendTransaction: true,
        signMessage: true,
        subscribe: true,
        switchAccount: false,
        switchChain: true,
      });
    });
  });

  describe("Ledger", () => {
    it("hardware-only profile — only signMessage + switchChain are true", () => {
      const caps = resolveCapabilities({ transport: "ledger" });
      expect(caps).toEqual({
        getBalance: false,
        getTransactionReceipt: false,
        requestAccounts: false,
        sendTransaction: false,
        signMessage: true,
        subscribe: false,
        switchAccount: false,
        switchChain: true,
      });
    });
  });
});
