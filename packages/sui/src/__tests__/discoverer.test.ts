import type { WalletAdapter } from "@usebutr/core";
import { describe, expect, it, vi } from "vitest";

import { suiDiscoverer } from "../discoverer";

describe("suiDiscoverer", () => {
  it("exposes Wallet Standard discovery with no legacy fallback", () => {
    expect(typeof suiDiscoverer.subscribe).toBe("function");
    expect(suiDiscoverer.fallback).toBeUndefined();
  });

  // The optional `@wallet-standard/app` peer dep is absent in this suite, so
  // subscribing must degrade to a no-op teardown rather than throwing.
  it("returns an unsubscribe handle without the optional peer dep present", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const unsubscribe = suiDiscoverer.subscribe(onAdapter);

    expect(typeof unsubscribe).toBe("function");
    expect(() => {
      unsubscribe();
    }).not.toThrow();
  });
});
