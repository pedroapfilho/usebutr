import { describe, expect, it } from "vitest";
import { createDiscoveryWalletSource } from "../wallet-source";

describe("createDiscoveryWalletSource", () => {
  it("returns an object satisfying the WalletSource shape", () => {
    const source = createDiscoveryWalletSource();
    expect(typeof source.subscribe).toBe("function");
  });

  it("subscribe returns an unsubscribe function", () => {
    const source = createDiscoveryWalletSource({ evm: false, svm: false });
    const unsubscribe = source.subscribe(() => {});
    expect(typeof unsubscribe).toBe("function");
    expect(() => unsubscribe()).not.toThrow();
  });

  it("forwards options through to discoverWalletAdapters", () => {
    // Smoke: passing options shouldn't throw, and we should still get a cleanup fn.
    const source = createDiscoveryWalletSource({ evm: true, svm: false });
    const unsubscribe = source.subscribe(() => {});
    expect(typeof unsubscribe).toBe("function");
    unsubscribe();
  });
});
