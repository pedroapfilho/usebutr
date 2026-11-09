import { afterEach, describe, expect, it, vi } from "vitest";

import { discoverInjectedPolkadotAdapters } from "../injected";

const extension = () => ({ enable: vi.fn() });

const discover = () => {
  const seen: Array<string> = [];

  const stop = discoverInjectedPolkadotAdapters((adapter) => {
    seen.push(adapter.id);
  });

  return { seen, stop };
};

describe("discoverInjectedPolkadotAdapters", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("emits one adapter per window.injectedWeb3 key", () => {
    vi.stubGlobal("window", {
      injectedWeb3: { "polkadot-js": extension(), talisman: extension() },
    });
    const { seen, stop } = discover();
    stop();

    expect(seen.toSorted()).toEqual([
      "injected:polkadot:polkadot-js",
      "injected:polkadot:talisman",
    ]);
  });

  it("emits nothing when injectedWeb3 is absent", () => {
    vi.stubGlobal("window", {});
    const { seen, stop } = discover();
    stop();

    expect(seen).toEqual([]);
  });

  it("picks up an extension that injects late, once", () => {
    vi.useFakeTimers();
    const host: { injectedWeb3?: Record<string, ReturnType<typeof extension>> } = {};
    vi.stubGlobal("window", host);
    const { seen, stop } = discover();
    host.injectedWeb3 = { talisman: extension() };
    vi.runAllTimers();
    stop();

    expect(seen).toEqual(["injected:polkadot:talisman"]);
  });

  it("stops rescanning once unsubscribed", () => {
    vi.useFakeTimers();
    const host: { injectedWeb3?: Record<string, ReturnType<typeof extension>> } = {};
    vi.stubGlobal("window", host);
    const { seen, stop } = discover();
    stop();
    host.injectedWeb3 = { talisman: extension() };
    vi.runAllTimers();

    expect(seen).toEqual([]);
  });
});
