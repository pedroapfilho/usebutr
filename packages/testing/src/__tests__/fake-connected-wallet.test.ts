import { buildAccount } from "@usebutr/core";
import { describe, expect, it } from "vitest";

import { createFakeAdapter } from "../fake-adapter";
import { createFakeConnectedWallet } from "../fake-connected-wallet";

describe("createFakeConnectedWallet", () => {
  it("returns a renderable pool entry with no arguments", () => {
    const wallet = createFakeConnectedWallet();

    expect(wallet.connector.chainPlatform).toBe("evm");
    expect(wallet.accounts).toHaveLength(1);
    expect(wallet.account).toBe(wallet.accounts[0]);
  });

  it("builds account ids through buildAccount rather than restating the format", () => {
    const wallet = createFakeConnectedWallet({ addresses: ["0xabc"] });
    const chain = wallet.account.chain;

    expect(wallet.account.id).toBe(buildAccount("0xabc", chain).id);
  });

  it("defaults the chain to the platform's mainnet", () => {
    expect(createFakeConnectedWallet({ chainPlatform: "svm" }).account.chain.id).toBe(
      "solana:mainnet",
    );
    expect(createFakeConnectedWallet({ chainPlatform: "sui" }).account.chain.id).toBe(
      "sui:mainnet",
    );
    expect(createFakeConnectedWallet({ chainPlatform: "evm" }).account.chain.id).toBe("eip155:1");
  });

  it("honors an explicit chain", () => {
    const chain = { id: "eip155:8453", name: "Base", namespace: "eip155", reference: "8453" };
    const wallet = createFakeConnectedWallet({ chain });

    expect(wallet.account.chain).toBe(chain);
    expect(wallet.account.id).toBe(buildAccount(wallet.account.walletAddress, chain).id);
  });

  it("builds one account per address, first one active", () => {
    const wallet = createFakeConnectedWallet({ addresses: ["0x1", "0x2", "0x3"] });

    expect(wallet.accounts.map((a) => a.walletAddress)).toEqual(["0x1", "0x2", "0x3"]);
    expect(wallet.account.walletAddress).toBe("0x1");
  });

  it("passes adapter options through to the connector", () => {
    const wallet = createFakeConnectedWallet({
      capabilities: { signMessage: false },
      chainPlatform: "bitcoin",
      id: "unisat",
      name: "Unisat",
    });

    expect(wallet.connector.id).toBe("unisat");
    expect(wallet.connector.name).toBe("Unisat");
    expect(wallet.connector.capabilities.signMessage).toBe(false);
    expect(wallet.connector.capabilities.signTransaction).toBe(true);
  });

  it("wraps an existing adapter and takes its platform", () => {
    const adapter = createFakeAdapter({ chainPlatform: "svm", id: "phantom" });
    const wallet = createFakeConnectedWallet({ adapter });

    expect(wallet.connector).toBe(adapter);
    expect(wallet.account.chain.id).toBe("solana:mainnet");
  });

  it("keeps the connector's accounts in sync with the entry", async () => {
    const wallet = createFakeConnectedWallet({ addresses: ["0x1", "0x2"] });

    await expect(wallet.connector.getAccounts?.()).resolves.toEqual(wallet.accounts);
    await expect(wallet.connector.getAccount()).resolves.toEqual(wallet.account);
  });

  it("throws rather than returning an entry with no active account", () => {
    expect(() => createFakeConnectedWallet({ accounts: [] })).toThrow(/at least one account/v);
  });

  it("rejects an adapter combined with explicit addresses, which cannot agree", () => {
    const adapter = createFakeAdapter({ chainPlatform: "evm", id: "metamask" });
    expect(() => createFakeConnectedWallet({ adapter, addresses: ["0xdead"] })).toThrow(
      /not both/v,
    );
  });
});
