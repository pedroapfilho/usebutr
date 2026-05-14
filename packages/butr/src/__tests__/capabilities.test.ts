import { describe, expect, it } from "vitest";
import { resolveCapabilities } from "../capabilities";

// EVM, SVM, and WalletConnect cases moved to their packages.
// Ledger case moves with @butr/ledger in Task 10 and this file goes
// away entirely.

describe("resolveCapabilities", () => {
  it("Ledger — hardware-only profile, only signMessage + switchChain are true", () => {
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
