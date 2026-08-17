import type {
  StandardConnectFeature,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "@usebutr/wallet-standard-shared";
import { describe, expect, it, vi } from "vitest";

import { buildBitcoinAdapter } from "../wallet-standard-adapter";
import type {
  BitcoinSendTransferFeature,
  BitcoinSignMessageFeature,
  BitcoinSignPsbtFeature,
} from "../wallet-standard-types";

const MAINNET = "bip122:000000000019d6689c085ae165831e93";
const TESTNET = "bip122:000000000933ea01ad0ee984209779ba";

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

  describe("sendTxToChain", () => {
    const buildSendable = (chains: ReadonlyArray<string>) => {
      const sendFeature: BitcoinSendTransferFeature = {
        sendTransfer: vi.fn().mockResolvedValue({ txid: "abcd1234" }),
      };
      const wallet = withFeatures(buildWallet({ chains }), {
        "bitcoin:sendTransfer": sendFeature,
        "standard:connect": { connect: vi.fn().mockResolvedValue({ accounts: [] }) },
      });
      return { adapter: buildBitcoinAdapter(wallet), sendFeature };
    };
    const payload = { amount: 1n, recipient: "bc1qto" };

    it("submits to the requested chain, not the adapter's current one", async () => {
      const { adapter, sendFeature } = buildSendable([MAINNET, TESTNET]);
      const cb = vi.fn<() => void>();

      await adapter?.sendTxToChain(payload, TESTNET, undefined, cb);

      expect(sendFeature.sendTransfer).toHaveBeenCalledWith(
        expect.objectContaining({ chain: TESTNET }),
      );
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it("does not fire the switched callback when already on the target chain", async () => {
      const { adapter } = buildSendable([MAINNET, TESTNET]);
      const cb = vi.fn<() => void>();

      await adapter?.sendTxToChain(payload, MAINNET, undefined, cb);

      expect(cb).not.toHaveBeenCalled();
    });

    it("rejects a chain the wallet does not advertise", async () => {
      const { adapter } = buildSendable([MAINNET]);

      await expect(adapter?.sendTxToChain(payload, TESTNET)).rejects.toThrow(
        /does not advertise chain/v,
      );
    });
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

  it("switchChain() rejects a non-bip122 namespace", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet(), {
      "standard:connect": connectFeature,
    });
    const adapter = buildBitcoinAdapter(wallet);
    await expect(
      adapter?.switchChain({
        id: "sui:mainnet",
        name: "Sui",
        namespace: "sui",
        reference: "mainnet",
      }),
    ).rejects.toThrow(/non-Bitcoin/v);
  });
});
