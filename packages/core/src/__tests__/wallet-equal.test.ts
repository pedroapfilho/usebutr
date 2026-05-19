import { describe, expect, it } from "vitest";
import type { ConnectedWallet } from "../types";
import { walletEqual } from "../wallet-equal";

const buildWallet = (id: string, address: string, chainId: string): ConnectedWallet => ({
  account: {
    chain: {
      id: chainId,
      name: "Ethereum",
      namespace: "eip155",
      reference: chainId.split(":")[1] ?? "1",
    },
    id: `${chainId}:${address}`,
    walletAddress: address,
  },
  accounts: [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connector: { id } as never,
});

describe("walletEqual", () => {
  it("returns true when both are undefined", () => {
    expect(walletEqual(undefined, undefined)).toBe(true);
  });

  it("returns false when only one is undefined", () => {
    expect(walletEqual(buildWallet("a", "0x1", "eip155:1"), undefined)).toBe(false);
    expect(walletEqual(undefined, buildWallet("a", "0x1", "eip155:1"))).toBe(false);
  });

  it("returns true when identity is the same reference", () => {
    const w = buildWallet("a", "0x1", "eip155:1");
    expect(walletEqual(w, w)).toBe(true);
  });

  it("returns true when connectorId + walletAddress + chain id all match", () => {
    expect(
      walletEqual(buildWallet("a", "0x1", "eip155:1"), buildWallet("a", "0x1", "eip155:1")),
    ).toBe(true);
  });

  it("returns false when connectorId differs", () => {
    expect(
      walletEqual(buildWallet("a", "0x1", "eip155:1"), buildWallet("b", "0x1", "eip155:1")),
    ).toBe(false);
  });

  it("returns false when walletAddress differs", () => {
    expect(
      walletEqual(buildWallet("a", "0x1", "eip155:1"), buildWallet("a", "0x2", "eip155:1")),
    ).toBe(false);
  });

  it("returns false when chain id differs", () => {
    expect(
      walletEqual(buildWallet("a", "0x1", "eip155:1"), buildWallet("a", "0x1", "eip155:137")),
    ).toBe(false);
  });
});
