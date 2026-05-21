import { describe, expect, it } from "vitest";

import { CHAINS, CHAINS_BY_PLATFORM } from "../chains";

describe("CHAINS", () => {
  it("exposes evm, svm, sui, and bitcoin registries", () => {
    expect(CHAINS.evm).toBeDefined();
    expect(CHAINS.svm).toBeDefined();
    expect(CHAINS.sui).toBeDefined();
    expect(CHAINS.bitcoin).toBeDefined();
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

  it("sui registry includes mainnet/testnet/devnet/localnet", () => {
    expect(CHAINS.sui.mainnet.id).toBe("sui:mainnet");
    expect(CHAINS.sui.testnet.id).toBe("sui:testnet");
    expect(CHAINS.sui.devnet.id).toBe("sui:devnet");
    expect(CHAINS.sui.localnet.id).toBe("sui:localnet");
  });

  it("bitcoin registry uses CAIP-2 bip122 ids", () => {
    expect(CHAINS.bitcoin.mainnet.id).toBe("bip122:000000000019d6689c085ae165831e93");
    expect(CHAINS.bitcoin.testnet.id).toBe("bip122:000000000933ea01ad0ee984209779ba");
    expect(CHAINS.bitcoin.signet.id).toBe("bip122:00000008819873e925422c1ff0f99f7c");
  });
});

describe("CHAINS_BY_PLATFORM", () => {
  it("is indexed by chainPlatform and returns the matching list", () => {
    expect(CHAINS_BY_PLATFORM.evm.length).toBeGreaterThan(0);
    expect(CHAINS_BY_PLATFORM.svm.length).toBeGreaterThan(0);
    expect(CHAINS_BY_PLATFORM.sui.length).toBeGreaterThan(0);
    expect(CHAINS_BY_PLATFORM.bitcoin.length).toBeGreaterThan(0);
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

  it("sui chains all use the sui namespace", () => {
    for (const chain of CHAINS_BY_PLATFORM.sui) {
      expect(chain.namespace).toBe("sui");
    }
  });

  it("bitcoin chains all use the bip122 namespace", () => {
    for (const chain of CHAINS_BY_PLATFORM.bitcoin) {
      expect(chain.namespace).toBe("bip122");
    }
  });
});
