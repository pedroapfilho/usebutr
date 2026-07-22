import { describe, expect, it } from "vitest";

import { polkadotDiscoverer } from "../discoverer";

describe("polkadotDiscoverer", () => {
  it("is the polkadot platform with a primary subscribe and a WS fallback", () => {
    expect(polkadotDiscoverer.platform).toBe("polkadot");
    expect(typeof polkadotDiscoverer.subscribe).toBe("function");
    expect(typeof polkadotDiscoverer.fallback?.subscribe).toBe("function");
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
