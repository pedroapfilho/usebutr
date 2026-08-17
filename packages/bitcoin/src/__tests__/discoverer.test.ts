import type { WalletAdapter } from "@usebutr/core";
import { describe, expect, it, vi } from "vitest";

import { bitcoinDiscoverer } from "../discoverer";

describe("bitcoinDiscoverer", () => {
  it("exposes Wallet Standard discovery plus a legacy injected fallback", () => {
    expect(typeof bitcoinDiscoverer.subscribe).toBe("function");
    expect(typeof bitcoinDiscoverer.fallback?.subscribe).toBe("function");
  });

  it("returns an unsubscribe handle from the primary channel", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();

    const unsubscribe = bitcoinDiscoverer.subscribe(onAdapter);

    expect(typeof unsubscribe).toBe("function");
    expect(() => {
      unsubscribe();
    }).not.toThrow();
  });

  it("returns an unsubscribe handle from the fallback channel", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();

    const unsubscribe = bitcoinDiscoverer.fallback?.subscribe(onAdapter, {
      hasAnyPrimaryAdapter: () => true,
    });

    expect(typeof unsubscribe).toBe("function");
    expect(() => {
      unsubscribe?.();
    }).not.toThrow();
  });
});
