import { describe, expect, it } from "vitest";

import { SUI_CHAINS, SUI_CHAINS_LIST } from "../chains";

describe("SUI_CHAINS", () => {
  it("includes mainnet, testnet, devnet, localnet", () => {
    expect(SUI_CHAINS.mainnet.id).toBe("sui:mainnet");
    expect(SUI_CHAINS.testnet.id).toBe("sui:testnet");
    expect(SUI_CHAINS.devnet.id).toBe("sui:devnet");
    expect(SUI_CHAINS.localnet.id).toBe("sui:localnet");
  });

  it("every entry uses the sui namespace", () => {
    for (const chain of Object.values(SUI_CHAINS)) {
      expect(chain.namespace).toBe("sui");
    }
  });

  it("reference matches the trailing CAIP-2 segment", () => {
    for (const chain of Object.values(SUI_CHAINS)) {
      expect(chain.id).toBe(`sui:${chain.reference}`);
    }
  });
});

describe("SUI_CHAINS_LIST", () => {
  it("has one entry per chain in SUI_CHAINS", () => {
    expect(SUI_CHAINS_LIST).toHaveLength(Object.keys(SUI_CHAINS).length);
  });
});
