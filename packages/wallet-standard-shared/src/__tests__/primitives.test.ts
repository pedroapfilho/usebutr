import { describe, expect, it } from "vitest";

import { findAccount, getFeature, slugify } from "../primitives";
import type {
  StandardConnectFeature,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "../types";

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

describe("slugify", () => {
  it("produces wallet-standard:<prefix>-<slug>", () => {
    expect(slugify("svm", "Phantom")).toBe("wallet-standard:svm-phantom");
    expect(slugify("svm", "Solflare Wallet")).toBe("wallet-standard:svm-solflare-wallet");
    expect(slugify("svm", "  OKX!  Wallet  ")).toBe("wallet-standard:svm-okx-wallet");
    expect(slugify("sui", "Sui Wallet")).toBe("wallet-standard:sui-sui-wallet");
    expect(slugify("sui", "Suiet")).toBe("wallet-standard:sui-suiet");
    expect(slugify("sui", "  Phantom  ")).toBe("wallet-standard:sui-phantom");
    expect(slugify("btc", "Phantom")).toBe("wallet-standard:btc-phantom");
    expect(slugify("btc", "Magic Eden")).toBe("wallet-standard:btc-magic-eden");
  });
});

describe("getFeature", () => {
  it("returns the wallet's own feature object when the method is present", () => {
    const connectFeature: StandardConnectFeature = {
      connect: () => Promise.resolve({ accounts: [] }),
      version: "1.0.0",
    };
    const w = wallet({ features: { "standard:connect": connectFeature } });
    expect(getFeature<StandardConnectFeature>(w, "standard:connect", "connect")).toBe(
      connectFeature,
    );
  });

  it("returns undefined when the feature is absent", () => {
    expect(
      getFeature<StandardConnectFeature>(wallet(), "standard:connect", "connect"),
    ).toBeUndefined();
  });

  it("returns undefined when the feature lacks the named method", () => {
    const w = wallet({ features: { "standard:connect": { connect: "nope", version: "1.0.0" } } });
    expect(getFeature<StandardConnectFeature>(w, "standard:connect", "connect")).toBeUndefined();
  });
});

describe("findAccount", () => {
  it("returns the account with the exact address", () => {
    const a = account("0x1");
    const b = account("0x2");
    expect(findAccount([a, b], "0x2")).toBe(b);
  });

  it("returns undefined for an address the wallet does not expose", () => {
    expect(findAccount([account("0x1")], "0xmissing")).toBeUndefined();
    expect(findAccount([], "0x1")).toBeUndefined();
  });

  it("matches case-sensitively, since addresses are never normalised", () => {
    expect(findAccount([account("AbC")], "abc")).toBeUndefined();
  });
});
