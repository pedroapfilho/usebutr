import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "@usebutr/wallet-standard-shared";
import { describe, expect, it, vi } from "vitest";

import { buildSuiAdapter, slugify } from "../wallet-standard-adapter";
import type {
  SuiSignAndExecuteTransactionFeature,
  SuiSignPersonalMessageFeature,
} from "../wallet-standard-types";

const buildAccount = (
  address: string,
  features: ReadonlyArray<string> = [],
): WalletStandardWalletAccount => ({
  address,
  chains: ["sui:mainnet"],
  features,
});

type FeatureMap = Record<string, unknown>;

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

describe("slugify", () => {
  it("lowercases, collapses non-alphanumeric, prefixes with wallet-standard:sui-", () => {
    expect(slugify("Sui Wallet")).toBe("wallet-standard:sui-sui-wallet");
    expect(slugify("Suiet")).toBe("wallet-standard:sui-suiet");
    expect(slugify("  Phantom  ")).toBe("wallet-standard:sui-phantom");
  });
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
    // base64 for [1, 2, 3] and [10, 20]
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
    await expect(adapter?.sendTx(42 as unknown)).rejects.toThrow(TypeError);
  });

  it("switchChain() rejects a non-sui namespace", () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet({ chains: ["sui:mainnet", "sui:testnet"] }), {
      "standard:connect": connectFeature,
    });
    const adapter = buildSuiAdapter(wallet);
    expect(() =>
      adapter?.switchChain({
        id: "eip155:1",
        name: "Ethereum",
        namespace: "eip155",
        reference: "1",
      }),
    ).toThrow(/non-Sui/v);
  });

  it("switchChain() rejects chains the wallet doesn't advertise", () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet({ chains: ["sui:mainnet"] }), {
      "standard:connect": connectFeature,
    });
    const adapter = buildSuiAdapter(wallet);
    expect(() =>
      adapter?.switchChain({
        id: "sui:testnet",
        name: "Sui Testnet",
        namespace: "sui",
        reference: "testnet",
      }),
    ).toThrow(/does not advertise chain/v);
  });
});
