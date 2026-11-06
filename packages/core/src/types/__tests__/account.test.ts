import { describe, expect, it } from "vitest";

import { buildBalance } from "../account";

describe("buildBalance", () => {
  it("formats base units without trailing zeros", () => {
    expect(buildBalance(1_500_000_000n, 9, "SOL").formatted).toBe("1.5");
    expect(buildBalance(10n ** 18n, 18, "ETH").formatted).toBe("1");
    expect(buildBalance(1n, 18, "ETH").formatted).toBe("0.000000000000000001");
  });

  it("keeps whole amounts whole at zero decimals", () => {
    expect(buildBalance(42n, 0, "PTS")).toEqual({
      decimals: 0,
      formatted: "42",
      symbol: "PTS",
      value: 42n,
    });
  });
});
