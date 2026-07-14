import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  StandardEventsListener,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "@usebutr/wallet-standard-shared";
import { describe, expect, it, vi } from "vitest";

import { buildSvmAdapter, slugify } from "../wallet-standard-adapter";
import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignMessageFeature,
} from "../wallet-standard-types";

/** Narrows the WalletAdapter union the builder returns; signIn and
 *  signTransaction only exist on the svm variant. */
const expectSvmAdapter = (adapter: ReturnType<typeof buildSvmAdapter>) => {
  if (adapter?.chainPlatform !== "svm") {
    throw new Error("expected an svm adapter");
  }
  return adapter;
};

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
  it("lowercases, collapses non-alphanumeric, prefixes with wallet-standard:svm-", () => {
    expect(slugify("Phantom")).toBe("wallet-standard:svm-phantom");
    expect(slugify("Solflare Wallet")).toBe("wallet-standard:svm-solflare-wallet");
    expect(slugify("  OKX!  Wallet  ")).toBe("wallet-standard:svm-okx-wallet");
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
    expect(adapter?.id).toBe("wallet-standard:svm-phantom");
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
    await expect(adapter?.signMessage(new Uint8Array())).rejects.toThrow(/solana:signMessage/v);
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
    const expectedBase64 = btoa(String.fromCodePoint(...signatureBytes));
    expect(sig).toBe(expectedBase64);
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
      /solana:signAndSendTransaction/v,
    );
  });

  it("subscribe() bridges standard:events change → accountChanged", () => {
    // Array because TS doesn't track assignments made inside the `on`
    const registered: Array<StandardEventsListener> = [];
    const eventsFeature: StandardEventsFeature = {
      on: vi.fn((_event, listener) => {
        registered.push(listener);
        return () => {
          registered.length = 0;
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

    registered[0]?.({ accounts: [buildAccount("So1New")] });
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        account: expect.objectContaining({ walletAddress: "So1New" }),
        type: "accountChanged",
      }),
    );

    registered[0]?.({ accounts: [] });
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
    void adapter
      ?.getAccount()
      // oxlint-disable-next-line promise/prefer-await-to-then -- one-off assertion in sync test
      .then((account) => {
        expect(account?.chain.id).toBe("solana:mainnet-beta");
        return undefined;
      });
  });
});

// Per-wallet SVM fixtures. Wallet Standard is a stricter protocol
// than EIP-1193, so the wallets above behave uniformly along most
// axes; there are fewer per-wallet quirks to test than on EVM. The
// wallet we ship support for, so a wallet that ever drifts (e.g.
// Wallet Standard spec change) surfaces as a test failure rather

describe("SVM wallet fixtures — protocol-level uniformity", () => {
  const buildWalletWithFullFeatures = (name: string): WalletStandardWallet => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const signMessageFeature: SolanaSignMessageFeature = {
      signMessage: vi
        .fn()
        .mockResolvedValue([{ signature: new Uint8Array(64), signedMessage: new Uint8Array() }]),
    };
    const signAndSendFeature: SolanaSignAndSendTransactionFeature = {
      signAndSendTransaction: vi.fn().mockResolvedValue([{ signature: new Uint8Array(64) }]),
    };
    const eventsFeature: StandardEventsFeature = {
      on: vi.fn().mockReturnValue(() => {}),
    };
    return withFeatures(buildWallet({ name }), {
      "solana:signAndSendTransaction": signAndSendFeature,
      "solana:signMessage": signMessageFeature,
      "standard:connect": connectFeature,
      "standard:events": eventsFeature,
    });
  };

  it.each([
    "Phantom",
    "Solflare",
    "Backpack",
    "MetaMask", // Solana Snap
    "OKX Wallet",
    "Glow",
    "Coinbase Wallet",
    "Trust Wallet",
    "Math Wallet",
    "Coin98",
    "Exodus",
  ])(
    "wallet=%s: capabilities.requestAccounts is false (Wallet Standard has no EIP-2255 equivalent)",
    (name) => {
      const wallet = buildWalletWithFullFeatures(name);
      const adapter = buildSvmAdapter(wallet);
      expect(adapter?.capabilities.requestAccounts).toBe(false);
    },
  );

  it("capabilities.signMessage mirrors `solana:signMessage` feature advertisement", () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const signAndSendFeature: SolanaSignAndSendTransactionFeature = {
      signAndSendTransaction: vi.fn(),
    };

    const withSignMessage = withFeatures(buildWallet(), {
      "solana:signAndSendTransaction": signAndSendFeature,
      "solana:signMessage": { signMessage: vi.fn() } as SolanaSignMessageFeature,
      "standard:connect": connectFeature,
    });
    expect(buildSvmAdapter(withSignMessage)?.capabilities.signMessage).toBe(true);

    const withoutSignMessage = withFeatures(buildWallet(), {
      "solana:signAndSendTransaction": signAndSendFeature,
      "standard:connect": connectFeature,
    });
    expect(buildSvmAdapter(withoutSignMessage)?.capabilities.signMessage).toBe(false);
  });

  it("capabilities.sendTransaction mirrors `solana:signAndSendTransaction` feature advertisement", () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };

    const withFeature = withFeatures(buildWallet(), {
      "solana:signAndSendTransaction": {
        signAndSendTransaction: vi.fn(),
      } as SolanaSignAndSendTransactionFeature,
      "standard:connect": connectFeature,
    });
    expect(buildSvmAdapter(withFeature)?.capabilities.sendTransaction).toBe(true);

    const withoutFeature = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    expect(buildSvmAdapter(withoutFeature)?.capabilities.sendTransaction).toBe(false);
  });

  it("capabilities.subscribe mirrors `standard:events` feature advertisement", () => {
    const connectFeature: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };

    const withEvents = withFeatures(buildWallet(), {
      "standard:connect": connectFeature,
      "standard:events": { on: vi.fn().mockReturnValue(() => {}) } as StandardEventsFeature,
    });
    expect(buildSvmAdapter(withEvents)?.capabilities.subscribe).toBe(true);

    const withoutEvents = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    expect(buildSvmAdapter(withoutEvents)?.capabilities.subscribe).toBe(false);
  });

  it("universal SVM capabilities are constant across wallets", () => {
    const adapter = buildSvmAdapter(buildWalletWithFullFeatures("Phantom"));
    expect(adapter?.capabilities).toMatchObject({
      getBalance: false, // Wallet Standard has no RPC
      getTransactionReceipt: false, // Wallet Standard has no RPC
      requestAccounts: false, // No EIP-2255 equivalent
      switchAccount: false, // No silent "use address X"
    });
  });
});

describe("buildSvmAdapter.switchChain", () => {
  const connectFeature: StandardConnectFeature = {
    connect: vi.fn().mockResolvedValue({ accounts: [] }),
  };
  const buildAdapter = () =>
    buildSvmAdapter(
      withFeatures(buildWallet({ chains: ["solana:mainnet", "solana:devnet"] }), {
        "standard:connect": connectFeature,
      }),
    );

  it("rejects a non-Solana chain", () => {
    const adapter = buildAdapter();
    expect(() =>
      adapter?.switchChain({
        id: "eip155:1",
        name: "Ethereum",
        namespace: "eip155",
        reference: "1",
      }),
    ).toThrow(/non-Solana/v);
  });

  it("rejects a Solana chain the wallet does not advertise", () => {
    const adapter = buildAdapter();
    expect(() =>
      adapter?.switchChain({
        id: "solana:testnet",
        name: "Solana Testnet",
        namespace: "solana",
        reference: "testnet",
      }),
    ).toThrow(/does not advertise chain/v);
  });

  it("happy path: switches and synthesises an accountChanged event", async () => {
    const wallet = buildWallet({ chains: ["solana:mainnet", "solana:devnet"] });
    const eventsFeature: StandardEventsFeature = {
      on: vi.fn().mockReturnValue(() => {}),
    };
    const adapter = buildSvmAdapter(
      withFeatures(wallet, {
        "standard:connect": connectFeature,
        "standard:events": eventsFeature,
      }),
    );
    const listener = vi.fn();
    adapter?.subscribe?.(listener);
    await adapter?.switchChain({
      id: "solana:devnet",
      name: "Solana Devnet",
      namespace: "solana",
      reference: "devnet",
    });
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: "accountChanged" }));
  });
});

describe("buildSvmAdapter edge cases", () => {
  const connectFeature: StandardConnectFeature = {
    connect: vi.fn().mockResolvedValue({ accounts: [] }),
  };

  it("signMessage throws when no account is exposed", async () => {
    const signFeature: SolanaSignMessageFeature = {
      signMessage: vi
        .fn()
        .mockResolvedValue([{ signature: new Uint8Array(), signedMessage: new Uint8Array() }]),
    };
    const wallet = buildWallet({ accounts: [] });
    const adapter = buildSvmAdapter(
      withFeatures(wallet, {
        "solana:signMessage": signFeature,
        "standard:connect": connectFeature,
      }),
    );
    await expect(adapter?.signMessage(new Uint8Array([1, 2, 3]))).rejects.toThrow(
      /No connected account/v,
    );
  });

  it("signMessage throws when the feature returns no outputs", async () => {
    const signFeature: SolanaSignMessageFeature = {
      signMessage: vi.fn().mockResolvedValue([]),
    };
    const adapter = buildSvmAdapter(
      withFeatures(buildWallet(), {
        "solana:signMessage": signFeature,
        "standard:connect": connectFeature,
      }),
    );
    await expect(adapter?.signMessage(new Uint8Array([1]))).rejects.toThrow(
      /signMessage returned no outputs/v,
    );
  });

  it("subscribe ignores `change` events with neither accounts nor chains", () => {
    // Array because TS doesn't track assignments made inside the `on`
    const captured: Array<StandardEventsListener> = [];
    const eventsFeature: StandardEventsFeature = {
      on: vi.fn((_event, listener) => {
        captured.push(listener);
        return () => {};
      }),
    };
    const adapter = buildSvmAdapter(
      withFeatures(buildWallet(), {
        "standard:connect": connectFeature,
        "standard:events": eventsFeature,
      }),
    );
    const fireListener = vi.fn();
    adapter?.subscribe?.(fireListener);
    captured[0]?.({ features: ["solana:signIn"] });
    expect(fireListener).not.toHaveBeenCalled();
  });

  it("subscribe propagates a chain-only `change` (D5: cluster switch)", () => {
    // Array because TS doesn't track assignments made inside the `on`
    const captured: Array<StandardEventsListener> = [];
    const eventsFeature: StandardEventsFeature = {
      on: vi.fn((_event, listener) => {
        captured.push(listener);
        return () => {};
      }),
    };
    const adapter = buildSvmAdapter(
      withFeatures(buildWallet({ chains: ["solana:mainnet", "solana:devnet"] }), {
        "standard:connect": connectFeature,
        "standard:events": eventsFeature,
      }),
    );
    const fireListener = vi.fn();
    adapter?.subscribe?.(fireListener);
    captured[0]?.({ chains: ["solana:devnet"] });
    const expectedChain = expect.objectContaining({ id: "solana:devnet" });
    const expectedAccount = expect.objectContaining({ chain: expectedChain });
    expect(fireListener).toHaveBeenCalledWith(
      expect.objectContaining({
        account: expectedAccount,
        type: "accountChanged",
      }),
    );
  });

  it("connect forwards { silent: true } to standard:connect (D2)", async () => {
    const silentConnect: StandardConnectFeature = {
      connect: vi.fn().mockResolvedValue({ accounts: [] }),
    };
    const adapter = buildSvmAdapter(
      withFeatures(buildWallet(), { "standard:connect": silentConnect }),
    );
    await adapter?.connect({ silent: true });
    expect(silentConnect.connect).toHaveBeenCalledWith({ silent: true });
    await adapter?.connect();
    expect(silentConnect.connect).toHaveBeenLastCalledWith(undefined);
  });

  it("exposes signTransaction + capability when solana:signTransaction is advertised (D3)", async () => {
    const signTxFeature = {
      signTransaction: vi.fn().mockResolvedValue([{ signedTransaction: new Uint8Array([9, 9]) }]),
    };
    const walletWithSignTx = withFeatures(buildWallet(), {
      "solana:signTransaction": signTxFeature,
      "standard:connect": connectFeature,
    });
    const adapter = expectSvmAdapter(buildSvmAdapter(walletWithSignTx));
    expect(adapter.capabilities.signTransaction).toBe(true);
    const signed = await adapter.signTransaction?.(new Uint8Array([1]));
    expect(signed).toEqual(new Uint8Array([9, 9]));

    const bareWallet = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    const without = expectSvmAdapter(buildSvmAdapter(bareWallet));
    expect(without.capabilities.signTransaction).toBe(false);
    expect(without.signTransaction).toBeUndefined();
  });

  it("exposes signIn + capability when solana:signIn is advertised (D4)", async () => {
    const signInFeature = {
      signIn: vi.fn().mockResolvedValue([
        {
          account: buildAccount("So1Address1"),
          signature: new Uint8Array([1]),
          signedMessage: new Uint8Array([2]),
        },
      ]),
    };
    const walletWithSignIn = withFeatures(buildWallet(), {
      "solana:signIn": signInFeature,
      "standard:connect": connectFeature,
    });
    const adapter = expectSvmAdapter(buildSvmAdapter(walletWithSignIn));
    expect(adapter.capabilities.signIn).toBe(true);
    const out = await adapter.signIn?.({ statement: "Sign in" });
    expect(signInFeature.signIn).toHaveBeenCalledWith({ statement: "Sign in" });
    expect(out?.account.walletAddress).toBe("So1Address1");

    const bareWallet = withFeatures(buildWallet(), { "standard:connect": connectFeature });
    const without = expectSvmAdapter(buildSvmAdapter(bareWallet));
    expect(without.capabilities.signIn).toBe(false);
    expect(without.signIn).toBeUndefined();
  });

  it("registerDisconnector emits a synthetic disconnected on invocation (D1)", () => {
    // Collected in an array because TS doesn't track assignments made
    const emits: Array<() => void> = [];
    const adapter = buildSvmAdapter(
      withFeatures(buildWallet(), { "standard:connect": connectFeature }),
      (fn) => {
        emits.push(fn);
      },
    );
    const fireListener = vi.fn();
    adapter?.subscribe?.(fireListener);
    emits[0]?.();
    expect(fireListener).toHaveBeenCalledWith({ type: "disconnected" });
  });
});
