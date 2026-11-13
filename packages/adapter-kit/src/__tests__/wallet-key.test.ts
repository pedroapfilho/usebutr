import { describe, expect, it } from "vitest";

import { toWalletKey } from "../wallet-key";

describe("toWalletKey", () => {
  it.each([
    ["Phantom", "phantom"],
    ["OKX Wallet", "okx"],
    ["OKX", "okx"],
    ["Polkadot{.js}", "polkadotjs"],
    ["Nova Wallet", "nova"],
    ["SubWallet", "subwallet"],
    ["Coinbase Wallet", "coinbase"],
  ])("keys %s as %s", (name, key) => {
    expect(toWalletKey(name)).toBe(key);
  });

  it("keeps a name that is only the word wallet", () => {
    expect(toWalletKey("Wallet")).toBe("wallet");
  });
});
