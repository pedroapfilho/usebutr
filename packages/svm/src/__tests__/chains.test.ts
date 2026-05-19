import { describe, expect, it } from "vitest";

import { SVM_CHAINS, SVM_CHAINS_LIST } from "../chains";

describe("SVM_CHAINS", () => {
  it("exposes mainnet, devnet, and testnet under stable CAIP-2 ids", () => {
    expect(SVM_CHAINS.mainnet.id).toBe("solana:mainnet");
    expect(SVM_CHAINS.devnet.id).toBe("solana:devnet");
    expect(SVM_CHAINS.testnet.id).toBe("solana:testnet");
  });

  it("uses the solana namespace consistently", () => {
    expect(SVM_CHAINS.mainnet.namespace).toBe("solana");
    expect(SVM_CHAINS.devnet.namespace).toBe("solana");
    expect(SVM_CHAINS.testnet.namespace).toBe("solana");
  });

  it("matches reference to cluster shortname", () => {
    expect(SVM_CHAINS.mainnet.reference).toBe("mainnet");
    expect(SVM_CHAINS.devnet.reference).toBe("devnet");
    expect(SVM_CHAINS.testnet.reference).toBe("testnet");
  });
});

describe("SVM_CHAINS_LIST", () => {
  it("is the flat array projection of the registry", () => {
    expect(SVM_CHAINS_LIST.length).toBe(3);
    const ids = SVM_CHAINS_LIST.map((c) => c.id).toSorted();
    expect(ids).toEqual(["solana:devnet", "solana:mainnet", "solana:testnet"]);
  });
});
