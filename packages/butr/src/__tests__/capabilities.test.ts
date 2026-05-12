import { describe, expect, it } from "vitest";
import {
  EIP6963_RDNS_WITH_REQUEST_ACCOUNTS,
  resolveCapabilities,
} from "../capabilities";

describe("resolveCapabilities", () => {
  describe("EIP-6963", () => {
    it("MetaMask gets requestAccounts: true (allow-listed)", () => {
      const caps = resolveCapabilities({ rdns: "io.metamask", transport: "eip6963" });
      expect(caps.requestAccounts).toBe(true);
    });

    it.each([
      "io.rabby",
      "com.coinbase.wallet",
      "app.phantom",
      "com.brave.wallet",
      "com.okex.wallet",
      "com.binance.wallet",
      "com.bitkeep.wallet",
      "com.trustwallet.app",
      "com.backpack",
      "sh.frame.wallet",
      "xyz.unknown.wallet",
    ])("non-allow-listed wallet %s gets requestAccounts: false", (rdns) => {
      const caps = resolveCapabilities({ rdns, transport: "eip6963" });
      expect(caps.requestAccounts).toBe(false);
    });

    it("universal EVM capabilities are stable across rdns values", () => {
      for (const rdns of ["io.metamask", "io.rabby", "app.phantom"]) {
        const caps = resolveCapabilities({ rdns, transport: "eip6963" });
        expect(caps).toMatchObject({
          getBalance: true,
          getTransactionReceipt: true,
          sendTransaction: true,
          signMessage: true,
          subscribe: true,
          switchAccount: false,
          switchChain: true,
        });
      }
    });

    it("allow-list contents are stable (pin contract)", () => {
      // Any addition to the allow-list should be a visible diff in
      // this assertion — the resolver's identity is a domain rule,
      // not a one-off datum.
      expect([...EIP6963_RDNS_WITH_REQUEST_ACCOUNTS]).toEqual(["io.metamask"]);
    });
  });

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

    it("chainCount === 1 → switchChain: false (no chain to switch to)", () => {
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
