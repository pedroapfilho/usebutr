import { describe, expect, it } from "vitest";

import { EVM_CHAINS, EVM_CHAINS_LIST } from "../chains";

describe("EVM_CHAINS", () => {
  it("exposes the canonical mainnets keyed by short name", () => {
    expect(EVM_CHAINS.ethereum.id).toBe("eip155:1");
    expect(EVM_CHAINS.arbitrum.id).toBe("eip155:42161");
    expect(EVM_CHAINS.base.id).toBe("eip155:8453");
    expect(EVM_CHAINS.bsc.id).toBe("eip155:56");
    expect(EVM_CHAINS.optimism.id).toBe("eip155:10");
    expect(EVM_CHAINS.polygon.id).toBe("eip155:137");
    expect(EVM_CHAINS.sepolia.id).toBe("eip155:11155111");
  });

  it("uses the eip155 namespace consistently", () => {
    for (const chain of Object.values(EVM_CHAINS)) {
      expect(chain.namespace).toBe("eip155");
    }
  });
});

describe("EVM_CHAINS_LIST", () => {
  it("flattens the registry into an array indexed by chain order", () => {
    expect(EVM_CHAINS_LIST.length).toBe(Object.keys(EVM_CHAINS).length);
    const ids = EVM_CHAINS_LIST.map((c) => c.id);
    expect(new Set(ids).size).toBe(EVM_CHAINS_LIST.length); // unique
  });
});
