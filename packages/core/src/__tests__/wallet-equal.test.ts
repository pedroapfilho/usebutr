import { describe, expect, it } from "vitest";

import { EVM_CHAINS } from "../chains";
import { buildAccount } from "../types";
import { accountsEqual, walletEqual } from "../wallet-equal";

import { ETHEREUM, evmAdapter, walletOf } from "./helpers";

const a = buildAccount("0xa", ETHEREUM);
const b = buildAccount("0xb", ETHEREUM);

describe("accountsEqual", () => {
  it("compares account ids in order", () => {
    expect(
      accountsEqual([a, b], [buildAccount("0xa", ETHEREUM), buildAccount("0xb", ETHEREUM)]),
    ).toBe(true);
    expect(accountsEqual([a, b], [b, a])).toBe(false);
    expect(accountsEqual([a], [a, b])).toBe(false);
    expect(accountsEqual([], [])).toBe(true);
  });

  it("tells the same address on another chain apart", () => {
    expect(accountsEqual([a], [buildAccount("0xa", EVM_CHAINS.base)])).toBe(false);
  });
});

describe("walletEqual", () => {
  const adapter = evmAdapter("metamask");

  it("handles undefined on either side", () => {
    const wallet = walletOf(adapter);
    expect(walletEqual(undefined, undefined)).toBe(true);
    expect(walletEqual(wallet, undefined)).toBe(false);
    expect(walletEqual(undefined, wallet)).toBe(false);
  });

  it("equates entries with the same adapter, active account and account list", () => {
    expect(walletEqual(walletOf(adapter, [a, b]), walletOf(adapter, [a, b]))).toBe(true);
  });

  it("tells a shadow and its live adapter apart under the same id", () => {
    const live = walletOf(evmAdapter("metamask"));
    expect(walletEqual(walletOf(adapter), live)).toBe(false);
  });

  it("tells a changed active account or account list apart", () => {
    const wallet = walletOf(adapter, [a, b]);
    expect(walletEqual(wallet, { ...wallet, account: b })).toBe(false);
    expect(walletEqual(wallet, walletOf(adapter, [a]))).toBe(false);
  });
});
