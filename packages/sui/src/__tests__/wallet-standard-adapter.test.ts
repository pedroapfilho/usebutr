import type { ChainBase, ConnectorEvent, SuiAdapter } from "@usebutr/core";
import { base64ToBytes, buildAccount, SUI_CHAINS } from "@usebutr/core";
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

import { buildSuiAdapter } from "../wallet-standard-adapter";
import type {
  SuiSignAndExecuteTransactionFeature,
  SuiSignPersonalMessageFeature,
  SuiSignTransactionFeature,
} from "../wallet-standard-types";

const walletAccount = (address: string): WalletStandardWalletAccount => ({
  address,
  chains: ["sui:mainnet"],
  features: [],
});

const connectFeature = (): StandardConnectFeature => ({
  connect: vi.fn().mockResolvedValue({ accounts: [] }),
  version: "1.0.0",
});

type Features = Readonly<Record<string, WalletStandardFeature>>;

const buildWallet = (
  overrides: Partial<WalletStandardWallet> = {},
  features: Features = {},
): WalletStandardWallet => ({
  accounts: [walletAccount("0xSuiAddress1")],
  chains: ["sui:mainnet"],
  icon: "data:image/svg+xml;base64,AAA",
  name: "Mock Sui Wallet",
  version: "1.0.0",
  ...overrides,
  features: { "standard:connect": connectFeature(), ...features },
});

/** Narrows away the `null` returned for wallets butr cannot drive. */
const adapterFor = (
  overrides: Partial<WalletStandardWallet> = {},
  features: Features = {},
): SuiAdapter => {
  const adapter = buildSuiAdapter(buildWallet(overrides, features));
  if (adapter === null) {
    throw new Error("expected a sui adapter");
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

const executeFeature = (): SuiSignAndExecuteTransactionFeature => ({
  signAndExecuteTransaction: vi
    .fn()
    .mockResolvedValue({ bytes: "", digest: "DigEst123", effects: "", signature: "" }),
  version: "1.0.0",
});

const personalMessageFeature = (): SuiSignPersonalMessageFeature => ({
  signPersonalMessage: vi.fn().mockResolvedValue({
    bytes: btoa(String.fromCodePoint(10, 20)),
    signature: btoa(String.fromCodePoint(1, 2, 3)),
  }),
  version: "1.0.0",
});

const signTransactionFeature = (): SuiSignTransactionFeature => ({
  signTransaction: vi.fn().mockResolvedValue({ bytes: "AQID", signature: "BAUG" }),
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

/** Stands in for `@mysten/sui`'s `Transaction`, whose `toJSON` reads
 *  private instance state through `this`. */
class FakeTransaction {
  readonly #json = '{"version":2}';

  toJSON() {
    return Promise.resolve(this.#json);
  }
}

const ethereum: ChainBase = {
  id: "eip155:1",
  name: "Ethereum",
  namespace: "eip155",
  reference: "1",
};

const listenerFn = () => vi.fn<(event: ConnectorEvent) => void>();

const passedTransaction = (feature: SuiSignAndExecuteTransactionFeature) => {
  const [input] = vi.mocked(feature.signAndExecuteTransaction).mock.calls[0] ?? [];
  if (input === undefined) {
    throw new Error("signAndExecuteTransaction was not called");
  }
  return input.transaction;
};

describe("buildSuiAdapter", () => {
  it("returns null when the wallet advertises no Sui chain", () => {
    expect(buildSuiAdapter(buildWallet({ chains: ["eip155:1"] }))).toBeNull();
  });

  it("returns null when standard:connect is missing", () => {
    expect(buildSuiAdapter({ ...buildWallet(), features: {} })).toBeNull();
  });

  it("uses the wallet name, a namespaced slug and the sui platform", () => {
    const adapter = adapterFor({ name: "Sui Wallet" });
    expect(adapter.id).toBe("wallet-standard:sui-sui-wallet");
    expect(adapter.name).toBe("Sui Wallet");
    expect(adapter.chainPlatform).toBe("sui");
  });

  it("hands back the Wallet Standard wallet as a wallet-standard signer", async () => {
    const wallet = buildWallet();
    await expect(buildSuiAdapter(wallet)?.getSigner()).resolves.toEqual({
      kind: "wallet-standard",
      wallet,
    });
  });

  it("defines no balance, receipt or requestAccounts: Wallet Standard cannot serve them", () => {
    const adapter = adapterFor({}, { "sui:signAndExecuteTransaction": executeFeature() });
    expect(adapter.getBalance).toBeUndefined();
    expect(adapter.getTransactionReceipt).toBeUndefined();
    expect(adapter.requestAccounts).toBeUndefined();
  });

  it("defines each optional method only when the wallet advertises its feature", () => {
    const bare = adapterFor();
    expect(bare.sendTx).toBeUndefined();
    expect(bare.signMessage).toBeUndefined();
    expect(bare.signTransaction).toBeUndefined();
    expect(bare.disconnect).toBeUndefined();
    expect(bare.subscribe).toBeUndefined();
    expect(bare.switchChain).toBeUndefined();

    const full = adapterFor(
      { chains: ["sui:mainnet", "sui:testnet"] },
      {
        "standard:disconnect": { disconnect: vi.fn().mockResolvedValue(undefined) },
        "standard:events": eventsFeature().feature,
        "sui:signAndExecuteTransaction": executeFeature(),
        "sui:signPersonalMessage": personalMessageFeature(),
        "sui:signTransaction": signTransactionFeature(),
      },
    );
    expect(full.sendTx).toBeTypeOf("function");
    expect(full.signMessage).toBeTypeOf("function");
    expect(full.signTransaction).toBeTypeOf("function");
    expect(full.disconnect).toBeTypeOf("function");
    expect(full.subscribe).toBeTypeOf("function");
    expect(full.switchChain).toBeTypeOf("function");
  });
});

describe("buildSuiAdapter session", () => {
  it("forwards { silent: true } to standard:connect", async () => {
    const connect = connectFeature();
    const adapter = adapterFor({}, { "standard:connect": connect });
    await adapter.connect({ silent: true });
    expect(connect.connect).toHaveBeenCalledWith({ silent: true });
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
    const adapter = adapterFor({
      accounts: [walletAccount("0xSuiAddress1"), walletAccount("0xSuiAddress2")],
    });
    await expect(adapter.getAccounts()).resolves.toEqual([
      buildAccount("0xSuiAddress1", SUI_CHAINS.mainnet),
      buildAccount("0xSuiAddress2", SUI_CHAINS.mainnet),
    ]);
  });

  it("prefers sui:mainnet over the wallet's first-listed network", async () => {
    const adapter = adapterFor({ chains: ["sui:testnet", "sui:mainnet"] });
    const [account] = await adapter.getAccounts();
    expect(account?.chain).toBe(SUI_CHAINS.mainnet);
  });

  it("translates standard:events changes into accountsChanged", () => {
    const events = eventsFeature();
    const adapter = adapterFor({}, { "standard:events": events.feature });
    const listener = listenerFn();
    present(adapter.subscribe, "subscribe")(listener);
    events.emit({ accounts: [walletAccount("0xSuiAddress2")] });
    expect(listener).toHaveBeenCalledWith({
      accounts: [buildAccount("0xSuiAddress2", SUI_CHAINS.mainnet)],
      type: "accountsChanged",
    });
  });

  it("pushes disconnected through the discovery disconnector", () => {
    const emits: Array<() => void> = [];
    const adapter = buildSuiAdapter(buildWallet(), (emit) => {
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

describe("buildSuiAdapter.switchChain", () => {
  const switchable = () => adapterFor({ chains: ["sui:mainnet", "sui:testnet"] });

  it("rejects a non-Sui chain", async () => {
    await expect(present(switchable().switchChain, "switchChain")(ethereum)).rejects.toThrow(
      /non-Sui chain "eip155:1"/v,
    );
  });

  it("rejects a Sui network the wallet does not advertise", async () => {
    await expect(
      present(switchable().switchChain, "switchChain")(SUI_CHAINS.devnet),
    ).rejects.toThrow(/does not advertise chain "sui:devnet"/v);
  });

  it("re-points the accounts to the new network", async () => {
    const adapter = switchable();
    await present(adapter.switchChain, "switchChain")(SUI_CHAINS.testnet);
    await expect(adapter.getAccounts()).resolves.toEqual([
      buildAccount("0xSuiAddress1", SUI_CHAINS.testnet),
    ]);
  });
});

describe("buildSuiAdapter.sendTx", () => {
  it("executes through sui:signAndExecuteTransaction and resolves the digest", async () => {
    const feature = executeFeature();
    const adapter = adapterFor({}, { "sui:signAndExecuteTransaction": feature });
    const tx = new FakeTransaction();

    const digest = await present(adapter.sendTx, "sendTx")(tx);

    expect(feature.signAndExecuteTransaction).toHaveBeenCalledWith({
      account: walletAccount("0xSuiAddress1"),
      chain: "sui:mainnet",
      transaction: tx,
    });
    expect(digest).toBe("DigEst123");
  });

  it("hands a Transaction to the wallet as-is, so its toJSON keeps `this`", async () => {
    const feature = executeFeature();
    const adapter = adapterFor({}, { "sui:signAndExecuteTransaction": feature });
    const tx = new FakeTransaction();

    await present(adapter.sendTx, "sendTx")(tx);

    const passed = passedTransaction(feature);
    expect(passed).toBe(tx);
    await expect(passed.toJSON()).resolves.toBe('{"version":2}');
  });

  it("wraps a string into the toJSON shape wallets accept", async () => {
    const feature = executeFeature();
    const adapter = adapterFor({}, { "sui:signAndExecuteTransaction": feature });

    await present(adapter.sendTx, "sendTx")("AQID");

    await expect(passedTransaction(feature).toJSON()).resolves.toBe("AQID");
  });

  it("wraps BCS bytes as base64 in the toJSON shape", async () => {
    const feature = executeFeature();
    const adapter = adapterFor({}, { "sui:signAndExecuteTransaction": feature });

    await present(adapter.sendTx, "sendTx")(new Uint8Array([1, 2, 3]));

    await expect(passedTransaction(feature).toJSON()).resolves.toBe("AQID");
  });

  it("signs with the requested account", async () => {
    const feature = executeFeature();
    const adapter = adapterFor(
      { accounts: [walletAccount("0xSuiAddress1"), walletAccount("0xSuiAddress2")] },
      { "sui:signAndExecuteTransaction": feature },
    );

    await present(adapter.sendTx, "sendTx")("AQID", {
      account: buildAccount("0xSuiAddress2", SUI_CHAINS.mainnet),
    });

    expect(feature.signAndExecuteTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ account: walletAccount("0xSuiAddress2") }),
    );
  });

  it("rejects an account the wallet does not expose instead of signing with another", async () => {
    const feature = executeFeature();
    const adapter = adapterFor({}, { "sui:signAndExecuteTransaction": feature });

    await expect(
      present(adapter.sendTx, "sendTx")("AQID", {
        account: buildAccount("0xStranger", SUI_CHAINS.mainnet),
      }),
    ).rejects.toThrow("Wallet Mock Sui Wallet does not expose account 0xStranger");
    expect(feature.signAndExecuteTransaction).not.toHaveBeenCalled();
  });

  it("routes this call to options.chain without moving the adapter", async () => {
    const feature = executeFeature();
    const adapter = adapterFor(
      { chains: ["sui:mainnet", "sui:testnet"] },
      { "sui:signAndExecuteTransaction": feature },
    );

    await present(adapter.sendTx, "sendTx")("AQID", { chain: SUI_CHAINS.testnet });

    expect(feature.signAndExecuteTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ chain: "sui:testnet" }),
    );
    const [account] = await adapter.getAccounts();
    expect(account?.chain).toBe(SUI_CHAINS.mainnet);
  });

  it("rejects a network the wallet does not advertise", async () => {
    const feature = executeFeature();
    const adapter = adapterFor({}, { "sui:signAndExecuteTransaction": feature });

    await expect(
      present(adapter.sendTx, "sendTx")("AQID", { chain: SUI_CHAINS.testnet }),
    ).rejects.toThrow(/does not advertise chain "sui:testnet"/v);
    expect(feature.signAndExecuteTransaction).not.toHaveBeenCalled();
  });

  it("rejects a chain from another namespace", async () => {
    const adapter = adapterFor({}, { "sui:signAndExecuteTransaction": executeFeature() });
    await expect(present(adapter.sendTx, "sendTx")("AQID", { chain: ethereum })).rejects.toThrow(
      /non-Sui chain/v,
    );
  });
});

describe("buildSuiAdapter.signMessage", () => {
  it("signs through sui:signPersonalMessage and decodes the base64 output", async () => {
    const feature = personalMessageFeature();
    const adapter = adapterFor({}, { "sui:signPersonalMessage": feature });
    const message = new Uint8Array([99]);

    const result = await present(adapter.signMessage, "signMessage")(message);

    expect(feature.signPersonalMessage).toHaveBeenCalledWith({
      account: walletAccount("0xSuiAddress1"),
      message,
    });
    expect([...result.signature]).toEqual([1, 2, 3]);
    expect([...result.signedMessage]).toEqual([10, 20]);
  });

  it("rejects an account the wallet does not expose", async () => {
    const feature = personalMessageFeature();
    const adapter = adapterFor({}, { "sui:signPersonalMessage": feature });
    await expect(
      present(adapter.signMessage, "signMessage")(new Uint8Array([1]), {
        account: buildAccount("0xStranger", SUI_CHAINS.mainnet),
      }),
    ).rejects.toThrow(/does not expose account 0xStranger/v);
    expect(feature.signPersonalMessage).not.toHaveBeenCalled();
  });

  it("rejects when the wallet exposes no account", async () => {
    const adapter = adapterFor(
      { accounts: [] },
      { "sui:signPersonalMessage": personalMessageFeature() },
    );
    await expect(present(adapter.signMessage, "signMessage")(new Uint8Array([1]))).rejects.toThrow(
      /has no connected account/v,
    );
  });
});

// `executeTransactionBlock` needs the bytes and the signature, so a bare
// signature could not be broadcast.
describe("buildSuiAdapter.signTransaction", () => {
  it("resolves both the transaction bytes and the signature", async () => {
    const feature = signTransactionFeature();
    const adapter = adapterFor({}, { "sui:signTransaction": feature });

    const result = await present(adapter.signTransaction, "signTransaction")("AQID");

    expect(result).toEqual({ bytes: base64ToBytes("AQID"), signature: base64ToBytes("BAUG") });
  });

  it("routes options.chain and options.account to the wallet", async () => {
    const feature = signTransactionFeature();
    const adapter = adapterFor(
      {
        accounts: [walletAccount("0xSuiAddress1"), walletAccount("0xSuiAddress2")],
        chains: ["sui:mainnet", "sui:testnet"],
      },
      { "sui:signTransaction": feature },
    );

    await present(adapter.signTransaction, "signTransaction")("AQID", {
      account: buildAccount("0xSuiAddress2", SUI_CHAINS.testnet),
      chain: SUI_CHAINS.testnet,
    });

    expect(feature.signTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ account: walletAccount("0xSuiAddress2"), chain: "sui:testnet" }),
    );
  });

  it("rejects a network the wallet does not advertise", async () => {
    const feature = signTransactionFeature();
    const adapter = adapterFor({}, { "sui:signTransaction": feature });
    await expect(
      present(adapter.signTransaction, "signTransaction")("AQID", { chain: SUI_CHAINS.devnet }),
    ).rejects.toThrow(/does not advertise chain "sui:devnet"/v);
    expect(feature.signTransaction).not.toHaveBeenCalled();
  });
});
