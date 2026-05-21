import { describe, expect, it } from "vitest";

import { BITCOIN_CHAINS, BITCOIN_CHAINS_LIST } from "../chains";

describe("BITCOIN_CHAINS", () => {
  it("uses CAIP-2 bip122 ids with the canonical genesis prefixes", () => {
    expect(BITCOIN_CHAINS.mainnet.id).toBe("bip122:000000000019d6689c085ae165831e93");
    expect(BITCOIN_CHAINS.testnet.id).toBe("bip122:000000000933ea01ad0ee984209779ba");
    expect(BITCOIN_CHAINS.signet.id).toBe("bip122:00000008819873e925422c1ff0f99f7c");
  });

  it("every entry uses the bip122 namespace", () => {
    for (const chain of Object.values(BITCOIN_CHAINS)) {
      expect(chain.namespace).toBe("bip122");
    }
  });

  it("reference matches the trailing CAIP-2 segment", () => {
    for (const chain of Object.values(BITCOIN_CHAINS)) {
      expect(chain.id).toBe(`bip122:${chain.reference}`);
    }
  });
});

describe("BITCOIN_CHAINS_LIST", () => {
  it("has one entry per chain in BITCOIN_CHAINS", () => {
    expect(BITCOIN_CHAINS_LIST).toHaveLength(Object.keys(BITCOIN_CHAINS).length);
  });
});
