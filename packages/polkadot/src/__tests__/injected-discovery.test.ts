import { describe, expect, it, vi } from "vitest";

import { discoverInjectedPolkadotAdapters } from "../injected";
import type { InjectedWindow } from "../injected/injected-web3";

const makeWindow = (): InjectedWindow => ({
  injectedWeb3: {
    "polkadot-js": { enable: vi.fn() },
    talisman: { enable: vi.fn() },
  },
});

describe("discoverInjectedPolkadotAdapters", () => {
  it("emits one adapter per window.injectedWeb3 key, deduped", () => {
    const seen: Array<string> = [];
    const stop = discoverInjectedPolkadotAdapters(
      (a) => {
        seen.push(a.id);
      },
      {
        pollMs: [],
        target: makeWindow(),
      },
    );
    stop();
    expect(seen.toSorted()).toEqual([
      "injected:polkadot:polkadot-js",
      "injected:polkadot:talisman",
    ]);
  });

  it("emits nothing when injectedWeb3 is absent", () => {
    const seen: Array<string> = [];
    const stop = discoverInjectedPolkadotAdapters(
      (a) => {
        seen.push(a.id);
      },
      {
        pollMs: [],
        target: {},
      },
    );
    stop();
    expect(seen).toEqual([]);
  });
});
