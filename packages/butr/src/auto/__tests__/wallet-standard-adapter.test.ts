import { describe, expect, it, vi } from "vitest";
import { buildSvmAdapter, slugify } from "../wallet-standard-adapter";
import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  StandardEventsListener,
  SolanaSignAndSendTransactionFeature,
  SolanaSignMessageFeature,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "../wallet-standard-types";

const buildAccount = (
  address: string,
  features: ReadonlyArray<string> = [],
): WalletStandardWalletAccount => ({
  address,
  chains: ["solana:mainnet"],
  features,
});

type FeatureMap = Record<string, unknown>;

const buildWallet = (overrides: Partial<WalletStandardWallet> = {}): WalletStandardWallet => ({
  accounts: [buildAccount("So1Address1")],
  chains: ["solana:mainnet"],
  features: {},
  icon: "data:image/svg+xml;base64,...",
  name: "Mock Solana Wallet",
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
  it("lowercases, collapses non-alphanumeric, prefixes with wallet-standard:", () => {
    expect(slugify("Phantom")).toBe("wallet-standard:phantom");
    expect(slugify("Solflare Wallet")).toBe("wallet-standard:solflare-wallet");
    expect(slugify("  OKX!  Wallet  ")).toBe("wallet-standard:okx-wallet");
  });
});

describe("buildSvmAdapter", () => {
  it("returns null when the wallet advertises no Solana chain", () => {
    const wallet = buildWallet({ chains: ["eip155:1"] });
    expect(buildSvmAdapter(wallet)).toBeNull();
  });

  it("returns null when standard:connect is missing", () => {
    const wallet = buildWallet({ features: {} });
    expect(buildSvmAdapter(wallet)).toBeNull();
  });

  it("uses wallet name and slug for the adapter id/name", () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet({ name: "Phantom" }), {
      "standard:connect": connectFeature,
    });
    const adapter = buildSvmAdapter(wallet);
    expect(adapter?.id).toBe("wallet-standard:phantom");
    expect(adapter?.name).toBe("Phantom");
    expect(adapter?.chainPlatform).toBe("svm");
  });

  it("calls standard:connect on connect()", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    const adapter = buildSvmAdapter(wallet);
    await adapter?.connect();
    expect(connectFeature.connect).toHaveBeenCalledTimes(1);
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
    const adapter = buildSvmAdapter(wallet);
    await adapter?.disconnect?.();
    expect(disconnectFeature.disconnect).toHaveBeenCalledTimes(1);
  });

  it("ignores missing standard:disconnect — disconnect() resolves silently", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    const adapter = buildSvmAdapter(wallet);
    await expect(adapter?.disconnect?.()).resolves.toBeUndefined();
  });

  it("returns the first account from getAccount() with a CAIP-2 chain", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(
      buildWallet({
        accounts: [buildAccount("So1Address1"), buildAccount("So1Address2")],
      }),
      { "standard:connect": connectFeature },
    );
    const adapter = buildSvmAdapter(wallet);
    const account = await adapter?.getAccount();
    expect(account?.walletAddress).toBe("So1Address1");
    expect(account?.chain.id).toBe("solana:mainnet");
    expect(account?.chain.namespace).toBe("solana");
    expect(account?.chain.reference).toBe("mainnet");
  });

  it("returns every advertised account from getAccounts()", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(
      buildWallet({
        accounts: [buildAccount("So1Address1"), buildAccount("So1Address2")],
      }),
      { "standard:connect": connectFeature },
    );
    const adapter = buildSvmAdapter(wallet);
    const accounts = await adapter?.getAccounts?.();
    expect(accounts).toHaveLength(2);
    expect(accounts?.[0]?.walletAddress).toBe("So1Address1");
    expect(accounts?.[1]?.walletAddress).toBe("So1Address2");
  });

  it("getBalance() returns a 0-balance default (no RPC in Wallet Standard)", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    const adapter = buildSvmAdapter(wallet);
    const balance = await adapter?.getBalance();
    expect(balance?.value).toBe(0n);
    expect(balance?.symbol).toBe("SOL");
    expect(balance?.decimals).toBe(9);
  });

  it("getTransactionReceipt() returns Pending (no RPC in Wallet Standard)", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    const adapter = buildSvmAdapter(wallet);
    const receipt = await adapter?.getTransactionReceipt("anyhash");
    expect(receipt?.status).toBe("Pending");
  });

  it("signMessage() bridges through solana:signMessage", async () => {
    const account = buildAccount("So1Address1");
    const expectedSignature = new Uint8Array([1, 2, 3]);
    const signFeature: SolanaSignMessageFeature = {
      signMessage: vi
        .fn()
        .mockResolvedValue([
          { signature: expectedSignature, signedMessage: new Uint8Array([10, 20]) },
        ]),
    };
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet({ accounts: [account] }), {
      "solana:signMessage": signFeature,
      "standard:connect": connectFeature,
    });
    const adapter = buildSvmAdapter(wallet);

    const msg = new Uint8Array([99]);
    const result = await adapter?.signMessage(msg);

    expect(signFeature.signMessage).toHaveBeenCalledWith({ account, message: msg });
    expect(result?.signature).toEqual(expectedSignature);
  });

  it("signMessage() throws when solana:signMessage isn't advertised", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    const adapter = buildSvmAdapter(wallet);
    await expect(adapter?.signMessage(new Uint8Array())).rejects.toThrow(/solana:signMessage/);
  });

  it("sendTx() bridges through solana:signAndSendTransaction, returns base64 signature", async () => {
    const account = buildAccount("So1Address1");
    const signatureBytes = new Uint8Array([1, 2, 3, 4]);
    const sendFeature: SolanaSignAndSendTransactionFeature = {
      signAndSendTransaction: vi.fn().mockResolvedValue([{ signature: signatureBytes }]),
    };
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet({ accounts: [account] }), {
      "solana:signAndSendTransaction": sendFeature,
      "standard:connect": connectFeature,
    });
    const adapter = buildSvmAdapter(wallet);

    const txBytes = new Uint8Array([42]);
    const sig = await adapter?.sendTx(txBytes);

    expect(sendFeature.signAndSendTransaction).toHaveBeenCalledWith({
      account,
      chain: "solana:mainnet",
      transaction: txBytes,
    });
    expect(sig).toBe(Buffer.from(signatureBytes).toString("base64"));
  });

  it("sendTx() rejects when transaction isn't a Uint8Array", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const sendFeature: SolanaSignAndSendTransactionFeature = {
      signAndSendTransaction: vi.fn().mockResolvedValue([{ signature: new Uint8Array() }]),
    };
    const wallet = withFeatures(buildWallet(), {
      "solana:signAndSendTransaction": sendFeature,
      "standard:connect": connectFeature,
    });
    const adapter = buildSvmAdapter(wallet);
    await expect(adapter?.sendTx({})).rejects.toThrow(TypeError);
  });

  it("sendTx() throws when solana:signAndSendTransaction isn't advertised", async () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    const adapter = buildSvmAdapter(wallet);
    await expect(adapter?.sendTx(new Uint8Array())).rejects.toThrow(
      /solana:signAndSendTransaction/,
    );
  });

  it("subscribe() bridges standard:events change → accountChanged", () => {
    let registered: StandardEventsListener | null = null;
    const eventsFeature: StandardEventsFeature = {
      on: vi.fn((_event, listener) => {
        registered = listener;
        return () => {
          registered = null;
        };
      }),
    };
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet(), {
      "standard:connect": connectFeature,
      "standard:events": eventsFeature,
    });
    const adapter = buildSvmAdapter(wallet);
    const listener = vi.fn();
    const unsub = adapter?.subscribe?.(listener);

    registered?.({ accounts: [buildAccount("So1New")] });
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        account: expect.objectContaining({ walletAddress: "So1New" }),
        type: "accountChanged",
      }),
    );

    registered?.({ accounts: [] });
    expect(listener).toHaveBeenCalledWith({ type: "disconnected" });

    unsub?.();
  });

  it("subscribe() returns a no-op when standard:events isn't advertised", () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    const adapter = buildSvmAdapter(wallet);
    const listener = vi.fn();
    const unsub = adapter?.subscribe?.(listener);
    expect(typeof unsub).toBe("function");
    unsub?.();
    expect(listener).not.toHaveBeenCalled();
  });

  it("prefers solana:mainnet-beta over other solana chains", () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const wallet = withFeatures(
      buildWallet({ chains: ["solana:devnet", "solana:mainnet-beta", "solana:testnet"] }),
      { "standard:connect": connectFeature },
    );
    const adapter = buildSvmAdapter(wallet);
    expect(adapter).not.toBeNull();
    // The active chain leaks through via the account's chain.id
    void adapter
      ?.getAccount()
      // oxlint-disable-next-line promise/prefer-await-to-then -- one-off assertion in sync test
      .then((account) => {
        expect(account?.chain.id).toBe("solana:mainnet-beta");
        return undefined;
      });
  });
});
