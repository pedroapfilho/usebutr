import { describe, expect, it } from "vitest";

import { groupByWallet } from "../group-by-wallet";

import { evmAdapter, svmAdapter } from "./helpers";

describe("groupByWallet", () => {
  it("lists each wallet once, with its adapters in announcement order", () => {
    const phantomEvm = evmAdapter("app.phantom", { name: "Phantom", walletKey: "phantom" });
    const metamask = evmAdapter("io.metamask", { name: "MetaMask", walletKey: "metamask" });

    const phantomSvm = svmAdapter("wallet-standard:svm-phantom", {
      icon: "data:image/svg+xml,phantom",
      name: "Phantom",
      walletKey: "phantom",
    });

    expect(groupByWallet([phantomEvm, metamask, phantomSvm])).toEqual([
      {
        adapters: [phantomEvm, phantomSvm],
        icon: "data:image/svg+xml,phantom",
        name: "Phantom",
        walletKey: "phantom",
      },
      { adapters: [metamask], icon: undefined, name: "MetaMask", walletKey: "metamask" },
    ]);
  });

  it("keeps wallets apart whatever their names, since the key is the link", () => {
    const first = evmAdapter("a", { name: "Wallet", walletKey: "one" });
    const second = evmAdapter("b", { name: "Wallet", walletKey: "two" });
    expect(groupByWallet([first, second])).toHaveLength(2);
  });
});
