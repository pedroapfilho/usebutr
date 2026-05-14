import { describe, expect, it } from "vitest";
import { resolveCapabilities } from "../capabilities";

// EIP-6963 cases moved to @butr/evm/src/__tests__/capabilities.test.ts.
// SVM cases move to @butr/svm in Task 8.

describe("resolveCapabilities", () => {
  describe("Wallet Standard (SVM)", () => {
    const baseFeatures = {
      events: true,
      signAndSendTransaction: true,
      signMessage: true,
    };

    it("all-features wallet gets the expected SVM shape", () => {
      const caps = resolveCapabilities({
        chainCount: 1,
        features: baseFeatures,
        transport: "wallet-standard",
      });
      expect(caps).toEqual({
        getBalance: false,
        getTransactionReceipt: false,
        requestAccounts: false,
        sendTransaction: true,
        signMessage: true,
        subscribe: true,
        switchAccount: false,
        switchChain: false,
      });
    });

    it("missing signAndSendTransaction → sendTransaction: false", () => {
      const caps = resolveCapabilities({
        chainCount: 1,
        features: { ...baseFeatures, signAndSendTransaction: false },
        transport: "wallet-standard",
      });
      expect(caps.sendTransaction).toBe(false);
    });

    it("missing signMessage → signMessage: false", () => {
      const caps = resolveCapabilities({
        chainCount: 1,
        features: { ...baseFeatures, signMessage: false },
        transport: "wallet-standard",
      });
      expect(caps.signMessage).toBe(false);
    });

    it("missing events → subscribe: false", () => {
      const caps = resolveCapabilities({
        chainCount: 1,
        features: { ...baseFeatures, events: false },
        transport: "wallet-standard",
      });
      expect(caps.subscribe).toBe(false);
    });

    it("chainCount > 1 → switchChain: true", () => {
      const caps = resolveCapabilities({
        chainCount: 2,
        features: baseFeatures,
        transport: "wallet-standard",
      });
      expect(caps.switchChain).toBe(true);
    });

    it("chainCount === 1 → switchChain: false", () => {
      const caps = resolveCapabilities({
        chainCount: 1,
        features: baseFeatures,
        transport: "wallet-standard",
      });
      expect(caps.switchChain).toBe(false);
    });
  });

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
