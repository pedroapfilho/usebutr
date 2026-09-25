import type { ChainBase, ConnectorEvent, SvmAdapter } from "@usebutr/core";
import { base58ToBytes, buildAccount, bytesToBase58, SVM_CHAINS } from "@usebutr/core";
import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  StandardEventsListener,
  WalletStandardFeature,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "@usebutr/wallet-standard-shared";
import { describe, expect, it, vi } from "vitest";

import { buildSvmAdapter } from "../wallet-standard-adapter";
import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignInFeature,
  SolanaSignMessageFeature,
  SolanaSignTransactionFeature,
} from "../wallet-standard-types";

const walletAccount = (address: string): WalletStandardWalletAccount => ({
  address,
  chains: ["solana:mainnet"],
  features: [],
});

const connectFeature = (): StandardConnectFeature => ({
  connect: vi.fn().mockResolvedValue({ accounts: [] }),
  version: "1.0.0",
});

const buildWallet = (
  overrides: Partial<WalletStandardWallet> = {},
  features: Readonly<Record<string, WalletStandardFeature>> = {},
): WalletStandardWallet => ({
  accounts: [walletAccount("So1Address1")],
  chains: ["solana:mainnet"],
  icon: "data:image/svg+xml;base64,AAA",
  name: "Mock Solana Wallet",
  version: "1.0.0",
  ...overrides,
  features: { "standard:connect": connectFeature(), ...features },
});

/** Narrows away the `null` returned for wallets butr cannot drive. */
const adapterFor = (
  overrides: Partial<WalletStandardWallet> = {},
  features: Readonly<Record<string, WalletStandardFeature>> = {},
): SvmAdapter => {
  const adapter = buildSvmAdapter(buildWallet(overrides, features));
  if (adapter === null) {
    throw new Error("expected an svm adapter");
  }
  return adapter;
};

/** Optional methods exist only when the wallet supports them; a test that
 *  calls one asserts its presence first. */
const present = <T>(value: T | undefined, name: string): T => {
  if (value === undefined) {
    throw new Error(`expected ${name} to be defined`);
  }
  return value;
};

const sendFeature = (): SolanaSignAndSendTransactionFeature => ({
  signAndSendTransaction: vi.fn().mockResolvedValue([{ signature: new Uint8Array([1, 2, 3, 4]) }]),
  version: "1.0.0",
});

const signMessageFeature = (): SolanaSignMessageFeature => ({
  signMessage: vi
    .fn()
    .mockResolvedValue([{ signature: new Uint8Array([7]), signedMessage: new Uint8Array([8]) }]),
  version: "1.0.0",
});

const signTransactionFeature = (): SolanaSignTransactionFeature => ({
  signTransaction: vi.fn().mockResolvedValue([{ signedTransaction: new Uint8Array([9, 9]) }]),
  version: "1.0.0",
});

const signInFeature = (): SolanaSignInFeature => ({
  signIn: vi.fn().mockResolvedValue([
    {
      account: walletAccount("So1Address1"),
      signature: new Uint8Array([1]),
      signedMessage: new Uint8Array([2]),
    },
  ]),
  version: "1.0.0",
});

const eventsFeature = () => {
  const listeners = new Set<StandardEventsListener>();
  const feature: StandardEventsFeature = {
    on: vi.fn((_event: "change", listener: StandardEventsListener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }),
    version: "1.0.0",
  };
  return {
    emit: (changes: Parameters<StandardEventsListener>[0]) => {
      for (const listener of listeners) {
        listener(changes);
      }
    },
    feature,
  };
};

const ethereum: ChainBase = {
  id: "eip155:1",
  name: "Ethereum",
  namespace: "eip155",
  reference: "1",
};

const listenerFn = () => vi.fn<(event: ConnectorEvent) => void>();

describe("buildSvmAdapter", () => {
  it("returns null when the wallet advertises no Solana chain", () => {
    expect(buildSvmAdapter(buildWallet({ chains: ["eip155:1"] }))).toBeNull();
  });

  it("returns null when standard:connect is missing", () => {
    const wallet = { ...buildWallet(), features: {} };
    expect(buildSvmAdapter(wallet)).toBeNull();
  });

  it("uses the wallet name, a namespaced slug and the svm platform", () => {
    const adapter = adapterFor({ name: "Phantom" });
    expect(adapter.id).toBe("wallet-standard:svm-phantom");
    expect(adapter.name).toBe("Phantom");
    expect(adapter.chainPlatform).toBe("svm");
    expect(adapter.icon).toBe("data:image/svg+xml;base64,AAA");
  });

  it("hands back the Wallet Standard wallet as a wallet-standard signer", async () => {
    const wallet = buildWallet();
    await expect(buildSvmAdapter(wallet)?.getSigner()).resolves.toEqual({
      kind: "wallet-standard",
      wallet,
    });
  });

  it("defines no balance, receipt or requestAccounts: Wallet Standard cannot serve them", () => {
    const adapter = adapterFor(
      {},
      {
        "solana:signAndSendTransaction": sendFeature(),
        "solana:signMessage": signMessageFeature(),
      },
    );
    expect(adapter.getBalance).toBeUndefined();
    expect(adapter.getTransactionReceipt).toBeUndefined();
    expect(adapter.requestAccounts).toBeUndefined();
  });

  it("defines each optional method only when the wallet advertises its feature", () => {
    const bare = adapterFor();
    expect(bare.sendTx).toBeUndefined();
    expect(bare.signMessage).toBeUndefined();
    expect(bare.signTransaction).toBeUndefined();
    expect(bare.signIn).toBeUndefined();
    expect(bare.disconnect).toBeUndefined();
    expect(bare.subscribe).toBeUndefined();
    expect(bare.switchChain).toBeUndefined();

    const full = adapterFor(
      { chains: ["solana:mainnet", "solana:devnet"] },
      {
        "solana:signAndSendTransaction": sendFeature(),
        "solana:signIn": signInFeature(),
        "solana:signMessage": signMessageFeature(),
        "solana:signTransaction": signTransactionFeature(),
        "standard:disconnect": { disconnect: vi.fn().mockResolvedValue(undefined) },
        "standard:events": eventsFeature().feature,
      },
    );
    expect(full.sendTx).toBeTypeOf("function");
    expect(full.signMessage).toBeTypeOf("function");
    expect(full.signTransaction).toBeTypeOf("function");
    expect(full.signIn).toBeTypeOf("function");
    expect(full.disconnect).toBeTypeOf("function");
    expect(full.subscribe).toBeTypeOf("function");
    expect(full.switchChain).toBeTypeOf("function");
  });

  it("ignores a feature that lacks its method", () => {
    const adapter = adapterFor({}, { "solana:signMessage": { version: "1.0.0" } });
    expect(adapter.signMessage).toBeUndefined();
  });
});

describe("buildSvmAdapter session", () => {
  it("forwards { silent: true } to standard:connect", async () => {
    const connect = connectFeature();
    const adapter = adapterFor({}, { "standard:connect": connect });
    await adapter.connect({ silent: true });
    expect(connect.connect).toHaveBeenCalledWith({ silent: true });
    await adapter.connect();
    expect(connect.connect).toHaveBeenLastCalledWith(undefined);
  });

  it("calls standard:disconnect", async () => {
    const disconnectFeature: StandardDisconnectFeature = {
      disconnect: vi.fn().mockResolvedValue(undefined),
    };
    const adapter = adapterFor({}, { "standard:disconnect": disconnectFeature });
    await present(adapter.disconnect, "disconnect")();
    expect(disconnectFeature.disconnect).toHaveBeenCalledTimes(1);
  });

  it("resolves every exposed account, active first, on a registry-named chain", async () => {
    const adapter = adapterFor(
      { accounts: [walletAccount("So1Address1"), walletAccount("So1Address2")] },
      {},
    );
    await expect(adapter.getAccounts()).resolves.toEqual([
      buildAccount("So1Address1", SVM_CHAINS.mainnet),
      buildAccount("So1Address2", SVM_CHAINS.mainnet),
    ]);
  });

  it("resolves no accounts before connect", async () => {
    await expect(adapterFor({ accounts: [] }).getAccounts()).resolves.toEqual([]);
  });

  it("prefers solana:mainnet-beta, named by its id, over other clusters", async () => {
    const adapter = adapterFor({
      chains: ["solana:devnet", "solana:mainnet-beta", "solana:testnet"],
    });
    const [account] = await adapter.getAccounts();
    expect(account?.chain).toEqual({
      id: "solana:mainnet-beta",
      name: "solana:mainnet-beta",
      namespace: "solana",
      reference: "mainnet-beta",
    });
  });

  it("translates standard:events changes into accountsChanged", () => {
    const events = eventsFeature();
    const adapter = adapterFor({}, { "standard:events": events.feature });
    const listener = listenerFn();
    present(adapter.subscribe, "subscribe")(listener);
    events.emit({ accounts: [walletAccount("So1Address2"), walletAccount("So1Address1")] });
    expect(listener).toHaveBeenCalledWith({
      accounts: [
        buildAccount("So1Address2", SVM_CHAINS.mainnet),
        buildAccount("So1Address1", SVM_CHAINS.mainnet),
      ],
      type: "accountsChanged",
    });
  });

  it("follows a cluster switch reported by the wallet", () => {
    const events = eventsFeature();
    const adapter = adapterFor(
      { chains: ["solana:mainnet", "solana:devnet"] },
      { "standard:events": events.feature },
    );
    const listener = listenerFn();
    present(adapter.subscribe, "subscribe")(listener);
    events.emit({ chains: ["solana:devnet"] });
    expect(listener).toHaveBeenCalledWith({
      accounts: [buildAccount("So1Address1", SVM_CHAINS.devnet)],
      type: "accountsChanged",
    });
  });

  it("pushes disconnected through the discovery disconnector", () => {
    const emits: Array<() => void> = [];
    const adapter = buildSvmAdapter(buildWallet(), (emit) => {
      emits.push(emit);
    });
    const listener = listenerFn();
    present(adapter?.subscribe, "subscribe")(listener);
    for (const emit of emits) {
      emit();
    }
    expect(listener).toHaveBeenCalledWith({ type: "disconnected" });
  });
});

describe("buildSvmAdapter.switchChain", () => {
  const switchable = (features: Readonly<Record<string, WalletStandardFeature>> = {}) =>
    adapterFor({ chains: ["solana:mainnet", "solana:devnet"] }, features);

  it("rejects a non-Solana chain", async () => {
    await expect(present(switchable().switchChain, "switchChain")(ethereum)).rejects.toThrow(
      /non-Solana chain "eip155:1"/v,
    );
  });

  it("rejects a Solana chain the wallet does not advertise", async () => {
    await expect(
      present(switchable().switchChain, "switchChain")(SVM_CHAINS.testnet),
    ).rejects.toThrow(/does not advertise chain "solana:testnet"/v);
  });

  it("re-points the adapter and notifies subscribers with the new chain", async () => {
    const events = eventsFeature();
    const adapter = switchable({ "standard:events": events.feature });
    const listener = listenerFn();
    present(adapter.subscribe, "subscribe")(listener);
    await present(adapter.switchChain, "switchChain")(SVM_CHAINS.devnet);
    const expected = [buildAccount("So1Address1", SVM_CHAINS.devnet)];
    expect(listener).toHaveBeenCalledWith({ accounts: expected, type: "accountsChanged" });
    await expect(adapter.getAccounts()).resolves.toEqual(expected);
  });
});

describe("buildSvmAdapter.sendTx", () => {
  const twoAccounts = [walletAccount("So1Address1"), walletAccount("So1Address2")];

  it("signs and sends through solana:signAndSendTransaction, resolving a base58 signature", async () => {
    const feature = sendFeature();
    const adapter = adapterFor({}, { "solana:signAndSendTransaction": feature });
    const tx = new Uint8Array([42]);

    const signature = await present(adapter.sendTx, "sendTx")(tx);

    expect(feature.signAndSendTransaction).toHaveBeenCalledWith({
      account: walletAccount("So1Address1"),
      chain: "solana:mainnet",
      transaction: tx,
    });
    expect(signature).toBe(bytesToBase58(new Uint8Array([1, 2, 3, 4])));
    expect(base58ToBytes(signature)).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it("signs with the requested account", async () => {
    const feature = sendFeature();
    const adapter = adapterFor(
      { accounts: twoAccounts },
      { "solana:signAndSendTransaction": feature },
    );

    await present(adapter.sendTx, "sendTx")(new Uint8Array([1]), {
      account: buildAccount("So1Address2", SVM_CHAINS.mainnet),
    });

    expect(feature.signAndSendTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ account: walletAccount("So1Address2") }),
    );
  });

  it("rejects an account the wallet does not expose instead of signing with another", async () => {
    const feature = sendFeature();
    const adapter = adapterFor(
      { accounts: twoAccounts },
      { "solana:signAndSendTransaction": feature },
    );

    await expect(
      present(adapter.sendTx, "sendTx")(new Uint8Array([1]), {
        account: buildAccount("Stranger", SVM_CHAINS.mainnet),
      }),
    ).rejects.toThrow("Wallet Mock Solana Wallet does not expose account Stranger");
    expect(feature.signAndSendTransaction).not.toHaveBeenCalled();
  });

  it("rejects when the wallet exposes no account", async () => {
    const adapter = adapterFor(
      { accounts: [] },
      { "solana:signAndSendTransaction": sendFeature() },
    );
    await expect(present(adapter.sendTx, "sendTx")(new Uint8Array([1]))).rejects.toThrow(
      /has no connected account/v,
    );
  });

  it("routes this call to options.chain without moving the adapter", async () => {
    const feature = sendFeature();
    const adapter = adapterFor(
      { chains: ["solana:mainnet", "solana:devnet"] },
      { "solana:signAndSendTransaction": feature },
    );

    await present(adapter.sendTx, "sendTx")(new Uint8Array([1]), { chain: SVM_CHAINS.devnet });

    expect(feature.signAndSendTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ chain: "solana:devnet" }),
    );
    await expect(adapter.getAccounts()).resolves.toEqual([
      buildAccount("So1Address1", SVM_CHAINS.mainnet),
    ]);
  });

  it("rejects a chain the wallet does not advertise", async () => {
    const feature = sendFeature();
    const adapter = adapterFor({}, { "solana:signAndSendTransaction": feature });

    await expect(
      present(adapter.sendTx, "sendTx")(new Uint8Array([1]), { chain: SVM_CHAINS.devnet }),
    ).rejects.toThrow(/does not advertise chain "solana:devnet"/v);
    expect(feature.signAndSendTransaction).not.toHaveBeenCalled();
  });

  it("rejects a chain from another namespace", async () => {
    const adapter = adapterFor({}, { "solana:signAndSendTransaction": sendFeature() });
    await expect(
      present(adapter.sendTx, "sendTx")(new Uint8Array([1]), { chain: ethereum }),
    ).rejects.toThrow(/non-Solana chain/v);
  });

  it("rejects when the wallet returns no outputs", async () => {
    const feature: SolanaSignAndSendTransactionFeature = {
      signAndSendTransaction: vi.fn().mockResolvedValue([]),
    };
    const adapter = adapterFor({}, { "solana:signAndSendTransaction": feature });
    await expect(present(adapter.sendTx, "sendTx")(new Uint8Array([1]))).rejects.toThrow(
      "signAndSendTransaction returned no outputs",
    );
  });
});

describe("buildSvmAdapter.signMessage", () => {
  it("signs through solana:signMessage and returns the wallet's signed bytes", async () => {
    const feature = signMessageFeature();
    const adapter = adapterFor({}, { "solana:signMessage": feature });
    const message = new Uint8Array([99]);

    const result = await present(adapter.signMessage, "signMessage")(message);

    expect(feature.signMessage).toHaveBeenCalledWith({
      account: walletAccount("So1Address1"),
      message,
    });
    expect(result).toEqual({ signature: new Uint8Array([7]), signedMessage: new Uint8Array([8]) });
  });

  it("signs with the requested account", async () => {
    const feature = signMessageFeature();
    const adapter = adapterFor(
      { accounts: [walletAccount("So1Address1"), walletAccount("So1Address2")] },
      { "solana:signMessage": feature },
    );

    await present(adapter.signMessage, "signMessage")(new Uint8Array([1]), {
      account: buildAccount("So1Address2", SVM_CHAINS.mainnet),
    });

    expect(feature.signMessage).toHaveBeenCalledWith(
      expect.objectContaining({ account: walletAccount("So1Address2") }),
    );
  });

  it("rejects an account the wallet does not expose", async () => {
    const feature = signMessageFeature();
    const adapter = adapterFor({}, { "solana:signMessage": feature });
    await expect(
      present(adapter.signMessage, "signMessage")(new Uint8Array([1]), {
        account: buildAccount("Stranger", SVM_CHAINS.mainnet),
      }),
    ).rejects.toThrow(/does not expose account Stranger/v);
    expect(feature.signMessage).not.toHaveBeenCalled();
  });

  it("rejects when the wallet returns no outputs", async () => {
    const feature: SolanaSignMessageFeature = { signMessage: vi.fn().mockResolvedValue([]) };
    const adapter = adapterFor({}, { "solana:signMessage": feature });
    await expect(present(adapter.signMessage, "signMessage")(new Uint8Array([1]))).rejects.toThrow(
      "signMessage returned no outputs",
    );
  });
});

describe("buildSvmAdapter.signTransaction", () => {
  it("resolves the full signed transaction", async () => {
    const feature = signTransactionFeature();
    const adapter = adapterFor({}, { "solana:signTransaction": feature });
    const tx = new Uint8Array([1]);

    const signed = await present(adapter.signTransaction, "signTransaction")(tx);

    expect(feature.signTransaction).toHaveBeenCalledWith({
      account: walletAccount("So1Address1"),
      chain: "solana:mainnet",
      transaction: tx,
    });
    expect(signed).toEqual(new Uint8Array([9, 9]));
  });

  it("routes options.chain and options.account to the wallet", async () => {
    const feature = signTransactionFeature();
    const adapter = adapterFor(
      {
        accounts: [walletAccount("So1Address1"), walletAccount("So1Address2")],
        chains: ["solana:mainnet", "solana:devnet"],
      },
      { "solana:signTransaction": feature },
    );

    await present(adapter.signTransaction, "signTransaction")(new Uint8Array([1]), {
      account: buildAccount("So1Address2", SVM_CHAINS.devnet),
      chain: SVM_CHAINS.devnet,
    });

    expect(feature.signTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ account: walletAccount("So1Address2"), chain: "solana:devnet" }),
    );
  });

  it("rejects a chain the wallet does not advertise", async () => {
    const feature = signTransactionFeature();
    const adapter = adapterFor({}, { "solana:signTransaction": feature });
    await expect(
      present(adapter.signTransaction, "signTransaction")(new Uint8Array([1]), {
        chain: SVM_CHAINS.testnet,
      }),
    ).rejects.toThrow(/does not advertise chain "solana:testnet"/v);
    expect(feature.signTransaction).not.toHaveBeenCalled();
  });
});

describe("buildSvmAdapter.signIn", () => {
  it("passes the SIWS input through and builds the account on the current chain", async () => {
    const feature = signInFeature();
    const adapter = adapterFor(
      { chains: ["solana:mainnet", "solana:devnet"] },
      { "solana:signIn": feature },
    );
    await present(adapter.switchChain, "switchChain")(SVM_CHAINS.devnet);

    const output = await present(adapter.signIn, "signIn")({ statement: "Sign in" });

    expect(feature.signIn).toHaveBeenCalledWith({ statement: "Sign in" });
    expect(output).toEqual({
      account: buildAccount("So1Address1", SVM_CHAINS.devnet),
      signature: new Uint8Array([1]),
      signedMessage: new Uint8Array([2]),
    });
  });

  it("rejects when the wallet returns no outputs", async () => {
    const feature: SolanaSignInFeature = { signIn: vi.fn().mockResolvedValue([]) };
    const adapter = adapterFor({}, { "solana:signIn": feature });
    await expect(present(adapter.signIn, "signIn")()).rejects.toThrow("signIn returned no outputs");
  });
});
