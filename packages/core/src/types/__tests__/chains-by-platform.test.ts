import { describe, expect, it } from "vitest";

import { buildChainsByPlatform } from "../chains-by-platform";

describe("buildChainsByPlatform", () => {
  it("defaults every platform — including polkadot — to an empty list", () => {
    const result = buildChainsByPlatform({});
    expect(result.bitcoin).toEqual([]);
    expect(result.evm).toEqual([]);
    expect(result.sui).toEqual([]);
    expect(result.svm).toEqual([]);
    expect(result.polkadot).toEqual([]);
  });

  it("passes through a provided polkadot list", () => {
    const chain = {
      id: "polkadot:91b171bb158e2d3848fa23a9f1c25182",
      name: "Polkadot",
      namespace: "polkadot",
      reference: "91b171bb158e2d3848fa23a9f1c25182",
    };
    const result = buildChainsByPlatform({ polkadot: [chain] });
    expect(result.polkadot).toEqual([chain]);
  });
});
