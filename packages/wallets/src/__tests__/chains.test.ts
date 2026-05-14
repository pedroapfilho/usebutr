import { describe, expect, it } from "vitest";
import { CHAINS, CHAINS_BY_PLATFORM } from "../chains";

describe("CHAINS", () => {
  it("exposes evm and svm registries", () => {
    expect(CHAINS.evm).toBeDefined();
    expect(CHAINS.svm).toBeDefined();
  });

  it("evm registry includes the well-known canonical chains", () => {
    expect(CHAINS.evm.ethereum.id).toBe("eip155:1");
    expect(CHAINS.evm.arbitrum.id).toBe("eip155:42161");
    expect(CHAINS.evm.base.id).toBe("eip155:8453");
  });

  it("svm registry includes mainnet/devnet/testnet", () => {
    expect(CHAINS.svm.mainnet.id).toBe("solana:mainnet");
    expect(CHAINS.svm.devnet.id).toBe("solana:devnet");
    expect(CHAINS.svm.testnet.id).toBe("solana:testnet");
  });
});

describe("CHAINS_BY_PLATFORM", () => {
  it("is indexed by chainPlatform and returns the matching list", () => {
    expect(CHAINS_BY_PLATFORM.evm.length).toBeGreaterThan(0);
    expect(CHAINS_BY_PLATFORM.svm.length).toBeGreaterThan(0);
  });

  it("evm chains all use the eip155 namespace", () => {
    for (const chain of CHAINS_BY_PLATFORM.evm) {
      expect(chain.namespace).toBe("eip155");
    }
  });

  it("svm chains all use the solana namespace", () => {
    for (const chain of CHAINS_BY_PLATFORM.svm) {
      expect(chain.namespace).toBe("solana");
    }
  });
});
