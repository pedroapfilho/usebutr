import { describe, expect, it } from "vitest";

import { groupByPlatform } from "../group-by-platform";
import type { ChainPlatform } from "../types";

type Item = { id: string; platform: ChainPlatform };

const getPlatform = (item: Item) => item.platform;

describe("groupByPlatform", () => {
  it("buckets items by platform", () => {
    const groups = groupByPlatform(
      [
        { id: "a", platform: "evm" },
        { id: "b", platform: "svm" },
        { id: "c", platform: "evm" },
      ],
      getPlatform,
    );

    expect(groups.get("evm")).toEqual([
      { id: "a", platform: "evm" },
      { id: "c", platform: "evm" },
    ]);
    expect(groups.get("svm")).toEqual([{ id: "b", platform: "svm" }]);
  });

  it("keys in CHAIN_PLATFORMS order regardless of input order", () => {
    const groups = groupByPlatform(
      [
        { id: "a", platform: "polkadot" },
        { id: "b", platform: "svm" },
        { id: "c", platform: "evm" },
        { id: "d", platform: "bitcoin" },
        { id: "e", platform: "sui" },
      ],
      getPlatform,
    );

    expect([...groups.keys()]).toEqual(["evm", "svm", "sui", "bitcoin", "polkadot"]);
  });

  it("omits platforms with no members", () => {
    const groups = groupByPlatform([{ id: "a", platform: "sui" }], getPlatform);

    expect([...groups.keys()]).toEqual(["sui"]);
    expect(groups.has("evm")).toBe(false);
  });

  it("preserves input order within a bucket", () => {
    const groups = groupByPlatform(
      [
        { id: "third", platform: "evm" },
        { id: "first", platform: "evm" },
        { id: "second", platform: "evm" },
      ],
      getPlatform,
    );

    expect(groups.get("evm")?.map((item) => item.id)).toEqual(["third", "first", "second"]);
  });

  it("returns an empty map for an empty list", () => {
    expect(groupByPlatform([], getPlatform).size).toBe(0);
  });

  it("reads a nested discriminant through the accessor", () => {
    const wallets = [
      { connector: { chainPlatform: "bitcoin" as const } },
      { connector: { chainPlatform: "evm" as const } },
    ];

    const groups = groupByPlatform(wallets, (wallet) => wallet.connector.chainPlatform);

    expect([...groups.keys()]).toEqual(["evm", "bitcoin"]);
  });
});
