import type {
  StandardConnectFeature,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "@usebutr/wallet-standard-shared";
import { describe, expect, it, vi } from "vitest";

import { buildBitcoinAdapter, slugify } from "../wallet-standard-adapter";
import type {
  BitcoinSendTransferFeature,
  BitcoinSignMessageFeature,
  BitcoinSignPsbtFeature,
} from "../wallet-standard-types";

const MAINNET = "bip122:000000000019d6689c085ae165831e93";

const buildAccount = (
  address: string,
  features: ReadonlyArray<string> = [],
): WalletStandardWalletAccount => ({
  address,
  chains: [MAINNET],
  features,
});

type FeatureMap = Record<string, unknown>;

const buildWallet = (overrides: Partial<WalletStandardWallet> = {}): WalletStandardWallet => ({
  accounts: [buildAccount("bc1qexample")],
  chains: [MAINNET],
  features: {},
  icon: "data:image/svg+xml;base64,...",
  name: "Mock Bitcoin Wallet",
  version: "1.0.0",
  ...overrides,
});

const withFeatures = (
  wallet: WalletStandardWallet,
  features: FeatureMap,
): WalletStandardWallet => ({
  ...wallet,
  features: { ...wallet.features, ...features },
});

describe("slugify", () => {
  it("lowercases, collapses non-alphanumeric, prefixes with wallet-standard:btc-", () => {
    expect(slugify("Phantom")).toBe("wallet-standard:btc-phantom");
    expect(slugify("Magic Eden")).toBe("wallet-standard:btc-magic-eden");
  });
});

describe("buildBitcoinAdapter", () => {
  it("returns null when the wallet advertises no bip122 chain", () => {
    const wallet = buildWallet({ chains: ["eip155:1"] });
    expect(buildBitcoinAdapter(wallet)).toBeNull();
  });

  it("returns null when standard:connect is missing", () => {
    const wallet = buildWallet({ features: {} });
    expect(buildBitcoinAdapter(wallet)).toBeNull();
  });

  it("uses wallet name and slug for the adapter id/name", () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet({ name: "Phantom" }), {
      "standard:connect": connectFeature,
    });
    const adapter = buildBitcoinAdapter(wallet);
    expect(adapter?.id).toBe("wallet-standard:btc-phantom");
    expect(adapter?.name).toBe("Phantom");
    expect(adapter?.chainPlatform).toBe("bitcoin");
  });

  it("returns the first account from getAccount() with a CAIP-2 bip122 chain", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(
      buildWallet({
        accounts: [buildAccount("bc1qaddr1"), buildAccount("bc1qaddr2")],
      }),
      { "standard:connect": connectFeature },
    );
    const adapter = buildBitcoinAdapter(wallet);
    const account = await adapter?.getAccount();
    expect(account?.walletAddress).toBe("bc1qaddr1");
    expect(account?.chain.id).toBe(MAINNET);
    expect(account?.chain.namespace).toBe("bip122");
  });

  it("getBalance() returns a 0-balance default (no RPC in Wallet Standard)", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    const adapter = buildBitcoinAdapter(wallet);
    const balance = await adapter?.getBalance();
    expect(balance?.value).toBe(0n);
    expect(balance?.symbol).toBe("BTC");
    expect(balance?.decimals).toBe(8);
  });

  it("signMessage() bridges through bitcoin:signMessage", async () => {
    const account = buildAccount("bc1qaddr");
    const expectedSignature = new Uint8Array([7, 8, 9]);
    const expectedSigned = new Uint8Array([1, 2]);
    const signFeature: BitcoinSignMessageFeature = {
      signMessage: vi
        .fn()
        .mockResolvedValue({ signature: expectedSignature, signedMessage: expectedSigned }),
    };
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet({ accounts: [account] }), {
      "bitcoin:signMessage": signFeature,
      "standard:connect": connectFeature,
    });
    const adapter = buildBitcoinAdapter(wallet);

    const msg = new Uint8Array([99]);
    const result = await adapter?.signMessage(msg);

    expect(signFeature.signMessage).toHaveBeenCalledWith({ account, message: msg });
    expect(result?.signature).toEqual(expectedSignature);
    expect(result?.signedMessage).toEqual(expectedSigned);
  });

  it("sendTx() bridges through bitcoin:sendTransfer, returns txid", async () => {
    const account = buildAccount("bc1qaddr");
    const sendFeature: BitcoinSendTransferFeature = {
      sendTransfer: vi.fn().mockResolvedValue({ txid: "abcd1234" }),
    };
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet({ accounts: [account] }), {
      "bitcoin:sendTransfer": sendFeature,
      "standard:connect": connectFeature,
    });
    const adapter = buildBitcoinAdapter(wallet);

    const txid = await adapter?.sendTx({ amount: 12_345n, recipient: "bc1qto" });

    expect(sendFeature.sendTransfer).toHaveBeenCalledWith({
      account,
      amount: 12_345n,
      chain: MAINNET,
      recipient: "bc1qto",
    });
    expect(txid).toBe("abcd1234");
  });

  it("sendTx() rejects when payload isn't { amount, recipient }", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const sendFeature: BitcoinSendTransferFeature = {
      sendTransfer: vi.fn().mockResolvedValue({ txid: "" }),
    };
    const wallet = withFeatures(buildWallet(), {
      "bitcoin:sendTransfer": sendFeature,
      "standard:connect": connectFeature,
    });
    const adapter = buildBitcoinAdapter(wallet);
    await expect(adapter?.sendTx(42)).rejects.toThrow(TypeError);
  });

  it("signTransaction() bridges through bitcoin:signPsbt", async () => {
    const account = buildAccount("bc1qaddr");
    const signedPsbt = new Uint8Array([10, 11, 12]);
    const signFeature: BitcoinSignPsbtFeature = {
      signPsbt: vi.fn().mockResolvedValue({ signedPsbt }),
    };
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet({ accounts: [account] }), {
      "bitcoin:signPsbt": signFeature,
      "standard:connect": connectFeature,
    });
    const adapter = buildBitcoinAdapter(wallet);
    if (adapter?.chainPlatform !== "bitcoin") {
      throw new Error("expected a bitcoin adapter");
    }

    const psbt = new Uint8Array([1, 2, 3]);
    const result = await adapter.signTransaction?.(psbt);

    expect(signFeature.signPsbt).toHaveBeenCalledWith({
      account,
      chain: MAINNET,
      psbt,
    });
    expect(result).toEqual(signedPsbt);
  });

  it("switchChain() rejects a non-bip122 namespace", () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet(), {
      "standard:connect": connectFeature,
    });
    const adapter = buildBitcoinAdapter(wallet);
    expect(() =>
      adapter?.switchChain({
        id: "sui:mainnet",
        name: "Sui",
        namespace: "sui",
        reference: "mainnet",
      }),
    ).toThrow(/non-Bitcoin/v);
  });
});
