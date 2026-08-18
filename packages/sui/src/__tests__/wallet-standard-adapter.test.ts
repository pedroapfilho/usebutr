import { base64ToBytes } from "@usebutr/core";
import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "@usebutr/wallet-standard-shared";
import { describe, expect, it, vi } from "vitest";

import { buildSuiAdapter } from "../wallet-standard-adapter";
import type {
  SuiSignAndExecuteTransactionFeature,
  SuiSignPersonalMessageFeature,
  SuiSignTransactionFeature,
} from "../wallet-standard-types";

/** Narrows the WalletAdapter union; `signTransaction` only exists on the sui
 *  variant. */
const expectSuiAdapter = (adapter: ReturnType<typeof buildSuiAdapter>) => {
  if (adapter?.chainPlatform !== "sui") {
    throw new Error("expected a sui adapter");
  }
  return adapter;
};

const buildAccount = (
  address: string,
  features: ReadonlyArray<string> = [],
): WalletStandardWalletAccount => ({
  address,
  chains: ["sui:mainnet"],
  features,
});

type SuiFeature =
  | StandardConnectFeature
  | StandardDisconnectFeature
  | SuiSignAndExecuteTransactionFeature
  | SuiSignPersonalMessageFeature
  | SuiSignTransactionFeature;

type FeatureMap = Record<string, SuiFeature>;

const buildWallet = (overrides: Partial<WalletStandardWallet> = {}): WalletStandardWallet => ({
  accounts: [buildAccount("0xSuiAddress1")],
  chains: ["sui:mainnet"],
  features: {},
  icon: "data:image/svg+xml;base64,...",
  name: "Mock Sui Wallet",
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

describe("buildSuiAdapter", () => {
  it("returns null when the wallet advertises no Sui chain", () => {
    const wallet = buildWallet({ chains: ["eip155:1"] });
    expect(buildSuiAdapter(wallet)).toBeNull();
  });

  it("returns null when standard:connect is missing", () => {
    const wallet = buildWallet({ features: {} });
    expect(buildSuiAdapter(wallet)).toBeNull();
  });

  it("uses wallet name and slug for the adapter id/name", () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet({ name: "Sui Wallet" }), {
      "standard:connect": connectFeature,
    });
    const adapter = buildSuiAdapter(wallet);
    expect(adapter?.id).toBe("wallet-standard:sui-sui-wallet");
    expect(adapter?.name).toBe("Sui Wallet");
    expect(adapter?.chainPlatform).toBe("sui");
  });

  it("calls standard:connect on connect()", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    const adapter = buildSuiAdapter(wallet);
    await adapter?.connect();
    expect(connectFeature.connect).toHaveBeenCalledTimes(1);
  });

  it("forwards { silent: true } when butr requests a silent reconnect", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    const adapter = buildSuiAdapter(wallet);
    await adapter?.connect({ silent: true });
    expect(connectFeature.connect).toHaveBeenCalledWith({ silent: true });
  });

  it("calls standard:disconnect on disconnect() when available", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const disconnectFeature: StandardDisconnectFeature = {
      disconnect: vi.fn().mockResolvedValue(undefined),
    };
    const wallet = withFeatures(buildWallet(), {
      "standard:connect": connectFeature,
      "standard:disconnect": disconnectFeature,
    });
    const adapter = buildSuiAdapter(wallet);
    await adapter?.disconnect?.();
    expect(disconnectFeature.disconnect).toHaveBeenCalledTimes(1);
  });

  it("returns the first account from getAccount() with a CAIP-2 chain", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(
      buildWallet({
        accounts: [buildAccount("0xSuiAddress1"), buildAccount("0xSuiAddress2")],
      }),
      { "standard:connect": connectFeature },
    );
    const adapter = buildSuiAdapter(wallet);
    const account = await adapter?.getAccount();
    expect(account?.walletAddress).toBe("0xSuiAddress1");
    expect(account?.chain.id).toBe("sui:mainnet");
    expect(account?.chain.namespace).toBe("sui");
    expect(account?.chain.reference).toBe("mainnet");
  });

  it("getBalance() returns a 0-balance default (no RPC in Wallet Standard)", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    const adapter = buildSuiAdapter(wallet);
    const balance = await adapter?.getBalance();
    expect(balance?.value).toBe(0n);
    expect(balance?.symbol).toBe("SUI");
    expect(balance?.decimals).toBe(9);
  });

  it("signMessage() bridges through sui:signPersonalMessage and decodes base64 output", async () => {
    const account = buildAccount("0xSuiAddress1");
    const signatureB64 = btoa(String.fromCodePoint(1, 2, 3));
    const bytesB64 = btoa(String.fromCodePoint(10, 20));
    const signFeature: SuiSignPersonalMessageFeature = {
      signPersonalMessage: vi.fn().mockResolvedValue({ bytes: bytesB64, signature: signatureB64 }),
    };
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet({ accounts: [account] }), {
      "standard:connect": connectFeature,
      "sui:signPersonalMessage": signFeature,
    });
    const adapter = buildSuiAdapter(wallet);

    const msg = new Uint8Array([99]);
    const result = await adapter?.signMessage(msg);

    expect(signFeature.signPersonalMessage).toHaveBeenCalledWith({ account, message: msg });
    expect([...(result?.signature ?? [])]).toEqual([1, 2, 3]);
    expect([...(result?.signedMessage ?? [])]).toEqual([10, 20]);
  });

  it("signMessage() throws when sui:signPersonalMessage isn't advertised", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    const adapter = buildSuiAdapter(wallet);
    await expect(adapter?.signMessage(new Uint8Array())).rejects.toThrow(
      /sui:signPersonalMessage/v,
    );
  });

  it("sendTx() bridges through sui:signAndExecuteTransaction, returns digest", async () => {
    const account = buildAccount("0xSuiAddress1");
    const sendFeature: SuiSignAndExecuteTransactionFeature = {
      signAndExecuteTransaction: vi.fn().mockResolvedValue({
        bytes: "",
        digest: "DigEst123",
        effects: "",
        signature: "",
      }),
    };
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet({ accounts: [account] }), {
      "standard:connect": connectFeature,
      "sui:signAndExecuteTransaction": sendFeature,
    });
    const adapter = buildSuiAdapter(wallet);

    const tx = { toJSON: () => Promise.resolve("{}") };
    const digest = await adapter?.sendTx(tx);

    expect(sendFeature.signAndExecuteTransaction).toHaveBeenCalledWith({
      account,
      chain: "sui:mainnet",
      transaction: tx,
    });
    expect(digest).toBe("DigEst123");
  });

  // Sui's executeTransactionBlock needs { transactionBlock, signature }, so a
  // bare Uint8Array cannot express the result of a sign-only call.
  it("signTransaction() returns both the bytes and the signature", async () => {
    const account = buildAccount("0xSuiAddress1");
    const signFeature: SuiSignTransactionFeature = {
      signTransaction: vi.fn().mockResolvedValue({ bytes: "AQID", signature: "BAUG" }),
    };
    const wallet = withFeatures(buildWallet({ accounts: [account] }), {
      "standard:connect": {
        connect: vi.fn().mockResolvedValue({ accounts: [] }),
        version: "1.0.0",
      },
      "sui:signTransaction": signFeature,
    });
    const adapter = expectSuiAdapter(buildSuiAdapter(wallet));

    const result = await adapter.signTransaction?.({ toJSON: () => Promise.resolve("{}") });

    expect(result?.bytes).toEqual(base64ToBytes("AQID"));
    expect(result?.signature).toEqual(base64ToBytes("BAUG"));
  });

  it("signTransaction() is absent when sui:signTransaction is not advertised", () => {
    const wallet = withFeatures(buildWallet(), {
      "standard:connect": {
        connect: vi.fn().mockResolvedValue({ accounts: [] }),
        version: "1.0.0",
      },
    });
    const adapter = expectSuiAdapter(buildSuiAdapter(wallet));
    expect(adapter.signTransaction).toBeUndefined();
  });

  it("wraps a base64 string into the toJSON shape wallets actually accept", async () => {
    const account = buildAccount("0xSuiAddress1");
    const sendFeature: SuiSignAndExecuteTransactionFeature = {
      signAndExecuteTransaction: vi
        .fn()
        .mockResolvedValue({ bytes: "", digest: "d", effects: "", signature: "" }),
    };
    const wallet = withFeatures(buildWallet({ accounts: [account] }), {
      "standard:connect": {
        connect: vi.fn().mockResolvedValue({ accounts: [] }),
        version: "1.0.0",
      },
      "sui:signAndExecuteTransaction": sendFeature,
    });
    const adapter = buildSuiAdapter(wallet);

    await adapter?.sendTx("AQID");

    const passed = vi.mocked(sendFeature.signAndExecuteTransaction).mock.calls[0]?.[0];
    await expect(passed?.transaction.toJSON()).resolves.toBe("AQID");
  });

  it("wraps BCS bytes into the toJSON shape", async () => {
    const account = buildAccount("0xSuiAddress1");
    const sendFeature: SuiSignAndExecuteTransactionFeature = {
      signAndExecuteTransaction: vi
        .fn()
        .mockResolvedValue({ bytes: "", digest: "d", effects: "", signature: "" }),
    };
    const wallet = withFeatures(buildWallet({ accounts: [account] }), {
      "standard:connect": {
        connect: vi.fn().mockResolvedValue({ accounts: [] }),
        version: "1.0.0",
      },
      "sui:signAndExecuteTransaction": sendFeature,
    });
    const adapter = buildSuiAdapter(wallet);

    await adapter?.sendTx(new Uint8Array([1, 2, 3]));

    const passed = vi.mocked(sendFeature.signAndExecuteTransaction).mock.calls[0]?.[0];
    await expect(passed?.transaction.toJSON()).resolves.toBe("AQID");
  });

  describe("sendTxToChain", () => {
    const buildSendable = (chains: ReadonlyArray<string>) => {
      const sendFeature: SuiSignAndExecuteTransactionFeature = {
        signAndExecuteTransaction: vi
          .fn()
          .mockResolvedValue({ bytes: "", digest: "d", effects: "", signature: "" }),
      };
      const wallet = withFeatures(buildWallet({ chains }), {
        "standard:connect": {
          connect: vi.fn().mockResolvedValue({ accounts: [] }),
          version: "1.0.0",
        },
        "sui:signAndExecuteTransaction": sendFeature,
      });
      return { adapter: buildSuiAdapter(wallet), sendFeature };
    };
    const tx = { toJSON: () => Promise.resolve("{}") };

    it("submits to the requested chain, not the adapter's current one", async () => {
      const { adapter, sendFeature } = buildSendable(["sui:mainnet", "sui:testnet"]);
      const cb = vi.fn<() => void>();

      await adapter?.sendTxToChain(tx, "sui:testnet", undefined, cb);

      expect(sendFeature.signAndExecuteTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ chain: "sui:testnet" }),
      );
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it("accepts a bare chain reference", async () => {
      const { adapter, sendFeature } = buildSendable(["sui:mainnet", "sui:testnet"]);

      await adapter?.sendTxToChain(tx, "testnet");

      expect(sendFeature.signAndExecuteTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ chain: "sui:testnet" }),
      );
    });

    it("does not fire the switched callback when already on the target chain", async () => {
      const { adapter } = buildSendable(["sui:mainnet", "sui:testnet"]);
      const cb = vi.fn<() => void>();

      await adapter?.sendTxToChain(tx, "sui:mainnet", undefined, cb);

      expect(cb).not.toHaveBeenCalled();
    });

    it("rejects a chain the wallet does not advertise", async () => {
      const { adapter } = buildSendable(["sui:mainnet"]);

      await expect(adapter?.sendTxToChain(tx, "sui:testnet")).rejects.toThrow(
        /does not advertise chain/v,
      );
    });
  });

  it("requestAccounts() re-runs the connect handshake", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    const adapter = buildSuiAdapter(wallet);

    await adapter?.requestAccounts?.();

    expect(connectFeature.connect).toHaveBeenCalled();
  });

  it("getTransactionReceipt() returns Pending (no RPC in Wallet Standard)", async () => {
    const wallet = withFeatures(buildWallet(), {
      "standard:connect": {
        connect: vi.fn().mockResolvedValue({ accounts: [] }),
        version: "1.0.0",
      },
    });
    const adapter = buildSuiAdapter(wallet);

    await expect(adapter?.getTransactionReceipt("anyhash")).resolves.toEqual({
      status: "Pending",
    });
  });

  it("sendTx() rejects when transaction isn't a Transaction nor a string", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const sendFeature: SuiSignAndExecuteTransactionFeature = {
      signAndExecuteTransaction: vi.fn().mockResolvedValue({
        bytes: "",
        digest: "",
        effects: "",
        signature: "",
      }),
    };
    const wallet = withFeatures(buildWallet(), {
      "standard:connect": connectFeature,
      "sui:signAndExecuteTransaction": sendFeature,
    });
    const adapter = buildSuiAdapter(wallet);
    // @ts-expect-error Runtime validation protects JavaScript consumers from invalid payloads.
    await expect(adapter?.sendTx(42)).rejects.toThrow(TypeError);
  });

  it("switchChain() rejects a non-sui namespace", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet({ chains: ["sui:mainnet", "sui:testnet"] }), {
      "standard:connect": connectFeature,
    });
    const adapter = buildSuiAdapter(wallet);
    await expect(
      adapter?.switchChain({
        id: "eip155:1",
        name: "Ethereum",
        namespace: "eip155",
        reference: "1",
      }),
    ).rejects.toThrow(/non-Sui/v);
  });

  it("switchChain() rejects chains the wallet doesn't advertise", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet({ chains: ["sui:mainnet"] }), {
      "standard:connect": connectFeature,
    });
    const adapter = buildSuiAdapter(wallet);
    await expect(
      adapter?.switchChain({
        id: "sui:testnet",
        name: "Sui Testnet",
        namespace: "sui",
        reference: "testnet",
      }),
    ).rejects.toThrow(/does not advertise chain/v);
  });
});
