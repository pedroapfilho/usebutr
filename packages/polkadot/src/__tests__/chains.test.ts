import { describe, expect, it } from "vitest";

import {
  POLKADOT_CHAIN_BY_ID,
  POLKADOT_CHAINS,
  POLKADOT_CHAINS_LIST,
  POLKADOT_MAINNET_IDS,
} from "../chains";

describe("POLKADOT_CHAINS", () => {
  it("uses CAIP-2 genesis-hash ids under the polkadot namespace", () => {
    expect(POLKADOT_CHAINS.polkadot.id).toBe("polkadot:91b171bb158e2d3848fa23a9f1c25182");
    expect(POLKADOT_CHAINS.polkadot.namespace).toBe("polkadot");
    expect(POLKADOT_CHAINS.polkadot.reference).toBe("91b171bb158e2d3848fa23a9f1c25182");
  });

  it("includes Kusama, Westend, and Paseo testnets", () => {
    expect(POLKADOT_CHAINS.kusama.id).toBe("polkadot:b0a8d493285c2df73290dfb7e61f870f");
    expect(POLKADOT_CHAINS.westend.id).toBe("polkadot:e143f23803ac50e8f6f8e62695d1ce9e");
    expect(POLKADOT_CHAINS.paseo.id).toBe("polkadot:77afd6190f1554ad45fd0d31aee62aac");
  });

  it("exposes the same entries as a list", () => {
    expect(POLKADOT_CHAINS_LIST).toHaveLength(4);
    expect(POLKADOT_CHAINS_LIST.map((c) => c.namespace)).toEqual([
      "polkadot",
      "polkadot",
      "polkadot",
      "polkadot",
    ]);
  });

  it("indexes every listed chain by id", () => {
    expect(POLKADOT_CHAIN_BY_ID.size).toBe(POLKADOT_CHAINS_LIST.length);
    for (const chain of POLKADOT_CHAINS_LIST) {
      expect(POLKADOT_CHAIN_BY_ID.get(chain.id)).toBe(chain);
    }
    expect(POLKADOT_CHAIN_BY_ID.get("polkadot:unknown")).toBeUndefined();
  });

  it("prefers Polkadot and Kusama, never the testnets", () => {
    expect(POLKADOT_MAINNET_IDS).toEqual([POLKADOT_CHAINS.polkadot.id, POLKADOT_CHAINS.kusama.id]);
    expect(POLKADOT_MAINNET_IDS).not.toContain(POLKADOT_CHAINS.westend.id);
    expect(POLKADOT_MAINNET_IDS).not.toContain(POLKADOT_CHAINS.paseo.id);
  });
});
