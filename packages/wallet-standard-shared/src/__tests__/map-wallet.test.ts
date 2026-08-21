import type { Wallets } from "@wallet-standard/app";
import { describe, expect, it } from "vitest";

import { mapWallet } from "../discovery";

type Wallet = ReturnType<Wallets["get"]>[number];
type WalletAccount = Wallet["accounts"][number];

const account = (address: string): WalletAccount => ({
  address,
  chains: ["solana:mainnet"],
  features: ["solana:signMessage"],
  publicKey: new Uint8Array([1, 2, 3]),
});

/**
 * A real extension exposes `accounts` as a getter over private session state
 * that `standard:connect` fills in, so it is discovered with an empty list.
 */
const sourceWallet = () => {
  let accounts: ReadonlyArray<WalletAccount> = [];
  const connectFeature = {
    connect: () => {
      accounts = [account("phantom-address")];
      return Promise.resolve({ accounts });
    },
    version: "1.0.0" as const,
  };
  const wallet: Wallet = {
    get accounts() {
      return accounts;
    },
    chains: ["solana:mainnet"],
    features: { "standard:connect": connectFeature, "standard:malformed": null },
    icon: "data:image/svg+xml;base64,PHN2Zy8+",
    name: "Phantom",
    version: "1.0.0",
  };
  return { connectFeature, wallet };
};

describe("mapWallet", () => {
  it("reads accounts through to the wallet so they resolve after connect", async () => {
    const source = sourceWallet();
    const mapped = mapWallet(source.wallet);

    expect(mapped.accounts).toEqual([]);

    await source.connectFeature.connect();

    expect(mapped.accounts[0]?.address).toBe("phantom-address");
  });

  it("reads chains through to the wallet", () => {
    let chains: ReadonlyArray<`${string}:${string}`> = ["solana:mainnet"];
    const wallet: Wallet = {
      accounts: [],
      get chains() {
        return chains;
      },
      features: {},
      icon: "data:image/svg+xml;base64,PHN2Zy8+",
      name: "Solflare",
      version: "1.0.0",
    };
    const mapped = mapWallet(wallet);

    chains = ["solana:devnet"];

    expect(mapped.chains).toEqual(["solana:devnet"]);
  });

  it("keeps feature objects bound to the wallet and drops non-object entries", () => {
    const source = sourceWallet();
    const mapped = mapWallet(source.wallet);

    expect(mapped.features["standard:connect"]).toBe(source.connectFeature);
    expect(mapped.features["standard:malformed"]).toBeUndefined();
  });

  it("returns one stable wrapper per wallet so unregister matches register", () => {
    const source = sourceWallet();

    expect(mapWallet(source.wallet)).toBe(mapWallet(source.wallet));
    expect(mapWallet(sourceWallet().wallet)).not.toBe(mapWallet(source.wallet));
  });

  it("copies the wallet's static identity", () => {
    const mapped = mapWallet(sourceWallet().wallet);

    expect(mapped.name).toBe("Phantom");
    expect(mapped.version).toBe("1.0.0");
    expect(mapped.icon).toBe("data:image/svg+xml;base64,PHN2Zy8+");
  });
});
