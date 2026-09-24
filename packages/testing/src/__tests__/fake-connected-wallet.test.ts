import type { ConnectedWallet } from "@usebutr/core";
import { buildAccount, SUI_CHAINS } from "@usebutr/core";
import { describe, expect, expectTypeOf, it } from "vitest";

import { createFakeConnectedWallet } from "../fake-connected-wallet";

describe("createFakeConnectedWallet", () => {
  it("builds an EVM pool entry whose accounts match what its adapter exposes", async () => {
    const wallet = createFakeConnectedWallet();
    expect(wallet.connector.chainPlatform).toBe("evm");
    expect(wallet.account).toBe(wallet.accounts[0]);
    expect(wallet.account.id).toBe("eip155:1:0x0000000000000000000000000000000000000001");
    expect(await wallet.connector.getAccounts()).toEqual(wallet.accounts);
  });

  it("builds accounts from addresses on a chain, active first", () => {
    const wallet = createFakeConnectedWallet({
      addresses: ["0xa", "0xb"],
      chain: SUI_CHAINS.testnet,
      chainPlatform: "sui",
    });
    expect(wallet.accounts).toEqual([
      buildAccount("0xa", SUI_CHAINS.testnet),
      buildAccount("0xb", SUI_CHAINS.testnet),
    ]);
    expect(wallet.account.walletAddress).toBe("0xa");
  });

  it("takes prebuilt accounts and adapter options", async () => {
    const account = buildAccount("0xabc", SUI_CHAINS.mainnet);
    const wallet = createFakeConnectedWallet({
      accounts: [account],
      chainPlatform: "sui",
      id: "suiet",
      omit: ["signTransaction"],
    });
    expect(wallet.connector.id).toBe("suiet");
    expect(wallet.connector.signTransaction).toBeUndefined();
    expect(await wallet.connector.signMessage?.(new Uint8Array([1]))).toBeDefined();
    expect(wallet.account).toBe(account);
  });

  it("types the entry to its platform and exposes the fake's controls", () => {
    const wallet = createFakeConnectedWallet({ chainPlatform: "svm" });
    expectTypeOf(wallet).toExtend<ConnectedWallet<"svm">>();
    expectTypeOf(wallet.connector.emit).toBeFunction();
  });

  it("refuses an entry without accounts", () => {
    expect(() => createFakeConnectedWallet({ addresses: [] })).toThrow("at least one account");
  });
});
