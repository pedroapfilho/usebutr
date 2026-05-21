import type { ChainBase } from "@usebutr/core";
import { describe, expect, it } from "vitest";

import {
  buildAccount,
  getFeature,
  pickAccountByAddress,
  pickFirstAddress,
  slugify,
} from "../primitives";
import type { WalletStandardWallet, WalletStandardWalletAccount } from "../types";

const wallet = (overrides: Partial<WalletStandardWallet> = {}): WalletStandardWallet => ({
  accounts: [],
  chains: [],
  features: {},
  icon: "",
  name: "Mock",
  version: "1.0.0",
  ...overrides,
});

const account = (address: string): WalletStandardWalletAccount => ({
  address,
  chains: [],
  features: [],
});

const chain: ChainBase = {
  id: "test:chain",
  name: "Test",
  namespace: "test",
  reference: "chain",
};

describe("slugify", () => {
  it("produces wallet-standard:<prefix>-<slug>", () => {
    expect(slugify("svm", "Phantom")).toBe("wallet-standard:svm-phantom");
    expect(slugify("svm", "Solflare Wallet")).toBe("wallet-standard:svm-solflare-wallet");
    expect(slugify("svm", "  OKX!  Wallet  ")).toBe("wallet-standard:svm-okx-wallet");
    expect(slugify("sui", "Sui Wallet")).toBe("wallet-standard:sui-sui-wallet");
    expect(slugify("btc", "Phantom")).toBe("wallet-standard:btc-phantom");
  });
});

describe("getFeature", () => {
  it("returns the feature value when present", () => {
    const fakeFeature = { connect: () => Promise.resolve() };
    const w = wallet({ features: { "standard:connect": fakeFeature } });
    expect(getFeature(w, "standard:connect")).toBe(fakeFeature);
  });

  it("returns undefined when absent", () => {
    expect(getFeature(wallet(), "standard:connect")).toBeUndefined();
  });
});

describe("buildAccount", () => {
  it("produces the composite account id butr's reducer compares on", () => {
    expect(buildAccount("0xabc", chain)).toEqual({
      chain,
      id: "test:chain:0xabc",
      walletAddress: "0xabc",
    });
  });
});

describe("pickFirstAddress", () => {
  it("returns the first address or null", () => {
    expect(pickFirstAddress([])).toBeNull();
    expect(pickFirstAddress([account("0x1"), account("0x2")])).toBe("0x1");
  });
});

describe("pickAccountByAddress", () => {
  it("returns the matching account when present", () => {
    const a = account("0x1");
    const b = account("0x2");
    expect(pickAccountByAddress([a, b], "0x2")).toBe(b);
  });

  it("falls back to the first account when the address isn't present", () => {
    const a = account("0x1");
    expect(pickAccountByAddress([a], "0xmissing")).toBe(a);
  });
});
