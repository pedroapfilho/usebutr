import type { WalletSource } from "@usebutr/core";
import { describe, expect, it } from "vitest";

import { polkadotDiscoverer } from "../discoverer";
import { discoverInjectedPolkadotAdapters } from "../injected";
import { discoverPolkadotWalletStandardAdapters } from "../wallet-standard-adapter";

describe("polkadotDiscoverer", () => {
  it("exposes a primary subscribe and a WS fallback", () => {
    expect(typeof polkadotDiscoverer.subscribe).toBe("function");
    expect(typeof polkadotDiscoverer.fallback?.subscribe).toBe("function");
  });

  it("keeps every discover export usable as a manager source", () => {
    // The assignment is the assertion: typecheck covers __tests__.
    const sources: ReadonlyArray<WalletSource> = [
      polkadotDiscoverer.subscribe,
      discoverInjectedPolkadotAdapters,
      discoverPolkadotWalletStandardAdapters,
    ];
    expect(sources).toHaveLength(3);
  });

  it("fallback returns a no-op unsubscribe and does not emit when a primary adapter already exists", () => {
    let emitted = 0;
    const stop = polkadotDiscoverer.fallback?.subscribe(
      () => {
        emitted += 1;
      },
      {
        hasAnyPrimaryAdapter: () => true,
      },
    );
    expect(typeof stop).toBe("function");
    stop?.();
    expect(emitted).toBe(0);
  });
});
