import { describe, expect, it } from "vitest";

import type { ConnectedWallet, WalletAdapter } from "../types";
import { walletEqual } from "../wallet-equal";

const buildConnector = (id: string): WalletAdapter => ({ id }) as unknown as WalletAdapter;

const buildWallet = (
  connector: WalletAdapter,
  address: string,
  chainId: string,
): ConnectedWallet => ({
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
  connector,
});

describe("walletEqual", () => {
  it("returns true when both are undefined", () => {
    expect(walletEqual(undefined, undefined)).toBe(true);
  });

  it("returns false when only one is undefined", () => {
    const wallet = buildWallet(buildConnector("a"), "0x1", "eip155:1");
    expect(walletEqual(wallet, undefined)).toBe(false);
    expect(walletEqual(undefined, wallet)).toBe(false);
  });

  it("returns true when identity is the same reference", () => {
    const wallet = buildWallet(buildConnector("a"), "0x1", "eip155:1");
    expect(walletEqual(wallet, wallet)).toBe(true);
  });

  it("returns true when connector + walletAddress + chain id all match", () => {
    const connector = buildConnector("a");
    const first = buildWallet(connector, "0x1", "eip155:1");
    const second = buildWallet(connector, "0x1", "eip155:1");
    expect(walletEqual(first, second)).toBe(true);
  });

  it("returns false when the adapter instance is swapped under an unchanged id", () => {
    const shadow = buildWallet(buildConnector("a"), "0x1", "eip155:1");
    const live = buildWallet(buildConnector("a"), "0x1", "eip155:1");
    expect(walletEqual(shadow, live)).toBe(false);
  });

  it("returns false when connectorId differs", () => {
    const first = buildWallet(buildConnector("a"), "0x1", "eip155:1");
    const second = buildWallet(buildConnector("b"), "0x1", "eip155:1");
    expect(walletEqual(first, second)).toBe(false);
  });

  it("returns false when walletAddress differs", () => {
    const connector = buildConnector("a");
    const first = buildWallet(connector, "0x1", "eip155:1");
    const second = buildWallet(connector, "0x2", "eip155:1");
    expect(walletEqual(first, second)).toBe(false);
  });

  it("returns false when chain id differs", () => {
    const connector = buildConnector("a");
    const first = buildWallet(connector, "0x1", "eip155:1");
    const second = buildWallet(connector, "0x1", "eip155:137");
    expect(walletEqual(first, second)).toBe(false);
  });
});
