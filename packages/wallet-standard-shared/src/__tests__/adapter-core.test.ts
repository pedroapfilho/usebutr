import type { ChainBase, ConnectorEvent } from "@usebutr/core";
import { buildAccount, SVM_CHAINS, SVM_CHAINS_LIST } from "@usebutr/core";
import { describe, expect, it, vi } from "vitest";

import type { WalletStandardCore } from "../adapter-core";
import { createWalletStandardCore } from "../adapter-core";
import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  StandardEventsListener,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "../types";

type Changes = Parameters<StandardEventsListener>[0];

type WalletOverrides = Partial<WalletStandardWallet>;

type CoreOverrides = {
  preferredChainIds?: ReadonlyArray<string>;
  registerDisconnector?: (emit: () => void) => void;
  trackChainChanges?: boolean;
};

const buildWalletAccount = (address: string): WalletStandardWalletAccount => ({
  address,
  chains: ["solana:mainnet"],
  features: [],
});

const buildConnectFeature = (): StandardConnectFeature => ({
  connect: vi.fn().mockResolvedValue({ accounts: [] }),
  version: "1.0.0",
});

const buildWallet = (overrides: WalletOverrides = {}): WalletStandardWallet => ({
  accounts: [buildWalletAccount("So1Address1")],
  chains: ["solana:mainnet"],
  icon: "data:image/svg+xml;base64,AAA",
  name: "Mock Solana Wallet",
  version: "1.0.0",
  ...overrides,
  features: { "standard:connect": buildConnectFeature(), ...overrides.features },
});

/** A `standard:events` feature plus a handle that drives its `change`
 *  listeners, so tests can play the role of the wallet extension. */
const buildEventsFeature = () => {
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
    emit: (changes: Changes) => {
      for (const listener of listeners) {
        listener(changes);
      }
    },
    feature,
    listenerCount: () => listeners.size,
  };
};

/** Captures the callback the core hands to `registerDisconnector`, standing
 *  in for the discovery layer's Wallet Standard `unregister` hook. */
const buildDisconnector = () => {
  const captured: Array<() => void> = [];
  return {
    emit: () => {
      const [first] = captured;
      if (first === undefined) {
        throw new Error("registerDisconnector was never called");
      }
      first();
    },
    register: (emit: () => void) => {
      captured.push(emit);
    },
  };
};

const buildCore = (
  wallet: WalletStandardWallet,
  overrides: CoreOverrides = {},
): WalletStandardCore | null =>
  createWalletStandardCore({
    chains: SVM_CHAINS_LIST,
    id: "wallet-standard:svm-mock",
    label: "Solana",
    namespace: "solana",
    preferredChainIds: ["solana:mainnet"],
    trackChainChanges: true,
    wallet,
    ...overrides,
  });

/** Builds a core and narrows away the `null` the factory returns for
 *  wallets butr can't drive. */
const coreFor = (
  wallet: WalletOverrides = {},
  overrides: CoreOverrides = {},
): WalletStandardCore => {
  const core = buildCore(buildWallet(wallet), overrides);
  if (core === null) {
    throw new Error("expected a wallet standard core");
  }
  return core;
};

/** Optional members exist only when the wallet supports them; tests that
 *  exercise one assert its presence first. */
const present = <T>(value: T | undefined, name: string): T => {
  if (value === undefined) {
    throw new Error(`expected ${name} to be defined`);
  }
  return value;
};

const subscribeTo = (core: WalletStandardCore) => present(core.base.subscribe, "subscribe");
const switchChainOf = (core: WalletStandardCore) => present(core.base.switchChain, "switchChain");

const listenerFn = () => vi.fn<(event: ConnectorEvent) => void>();

const chain = (id: string, namespace = "solana"): ChainBase => ({
  id,
  name: id,
  namespace,
  reference: id.slice(id.indexOf(":") + 1),
});

const accountsChanged = (chainBase: ChainBase, ...addresses: ReadonlyArray<string>) => ({
  accounts: addresses.map((address) => buildAccount(address, chainBase)),
  type: "accountsChanged",
});

describe("createWalletStandardCore chain resolution", () => {
  it("returns null when the wallet advertises no chain in the namespace", () => {
    const wallet = buildWallet({ chains: ["eip155:1", "bip122:000000000019d6689c085ae1"] });
    expect(buildCore(wallet)).toBeNull();
  });

  it("returns null when standard:connect is absent", () => {
    const wallet: WalletStandardWallet = {
      accounts: [],
      chains: ["solana:mainnet"],
      features: {},
      icon: "",
      name: "Mock Solana Wallet",
      version: "1.0.0",
    };
    expect(buildCore(wallet)).toBeNull();
  });

  it("returns null when standard:connect carries no connect method", () => {
    const wallet = buildWallet({ features: { "standard:connect": { version: "1.0.0" } } });
    expect(buildCore(wallet)).toBeNull();
  });

  it("prefers a preferred chain over the wallet's first-listed chain", () => {
    const core = coreFor({ chains: ["solana:devnet", "solana:mainnet"] });
    expect(core.currentChain()).toBe(SVM_CHAINS.mainnet);
  });

  it("keeps the wallet's ordering when several preferred chains are advertised", () => {
    const core = coreFor(
      { chains: ["solana:devnet", "solana:mainnet"] },
      { preferredChainIds: ["solana:mainnet", "solana:devnet"] },
    );
    expect(core.currentChain()).toBe(SVM_CHAINS.devnet);
  });

  it("falls back to the first chain in the namespace when no preferred chain is advertised", () => {
    const core = coreFor({ chains: ["eip155:1", "solana:testnet", "solana:devnet"] });
    expect(core.currentChain()).toBe(SVM_CHAINS.testnet);
  });

  it("names a chain from the registry, never after the wallet", () => {
    const core = coreFor({ chains: ["solana:devnet"], name: "Phantom" });
    expect(core.currentChain()).toEqual({
      id: "solana:devnet",
      name: "Solana Devnet",
      namespace: "solana",
      reference: "devnet",
    });
  });

  it("names a chain outside the registry by its CAIP-2 id", () => {
    const core = coreFor({ chains: ["solana:mainnet-beta"] });
    expect(core.currentChain()).toEqual({
      id: "solana:mainnet-beta",
      name: "solana:mainnet-beta",
      namespace: "solana",
      reference: "mainnet-beta",
    });
  });
});

describe("createWalletStandardCore metadata", () => {
  it("exposes the caller's id alongside the wallet's name", () => {
    const core = coreFor({ name: "Phantom" });
    expect(core.base.id).toBe("wallet-standard:svm-mock");
    expect(core.base.name).toBe("Phantom");
  });

  it("trims the wallet icon", () => {
    const core = coreFor({ icon: "  data:image/png;base64,AA  " });
    expect(core.base.icon).toBe("data:image/png;base64,AA");
  });

  it("treats an all-whitespace icon as absent", () => {
    const core = coreFor({ icon: "   " });
    expect(core.base.icon).toBeUndefined();
  });

  it("hands back the raw Wallet Standard wallet as a wallet-standard signer", async () => {
    const wallet = buildWallet();
    const core = buildCore(wallet);
    await expect(core?.base.getSigner()).resolves.toEqual({ kind: "wallet-standard", wallet });
  });
});

describe("createWalletStandardCore connect", () => {
  it("forwards { silent: true } to standard:connect", async () => {
    const connectFeature = buildConnectFeature();
    const core = coreFor({ features: { "standard:connect": connectFeature } });
    await core.base.connect({ silent: true });
    expect(connectFeature.connect).toHaveBeenCalledWith({ silent: true });
  });

  it("passes no options for a plain connect()", async () => {
    const connectFeature = buildConnectFeature();
    const core = coreFor({ features: { "standard:connect": connectFeature } });
    await core.base.connect();
    expect(connectFeature.connect).toHaveBeenCalledWith(undefined);
  });

  it("passes no options when silent is false", async () => {
    const connectFeature = buildConnectFeature();
    const core = coreFor({ features: { "standard:connect": connectFeature } });
    await core.base.connect({ silent: false });
    expect(connectFeature.connect).toHaveBeenCalledWith(undefined);
  });
});

describe("createWalletStandardCore disconnect", () => {
  it("calls standard:disconnect when the wallet advertises it", async () => {
    const disconnectFeature: StandardDisconnectFeature = {
      disconnect: vi.fn().mockResolvedValue(undefined),
    };
    const core = coreFor({ features: { "standard:disconnect": disconnectFeature } });
    await present(core.base.disconnect, "disconnect")();
    expect(disconnectFeature.disconnect).toHaveBeenCalledTimes(1);
  });

  it("is absent when the wallet advertises no standard:disconnect", () => {
    expect(coreFor().base.disconnect).toBeUndefined();
  });

  it("swallows a throwing standard:disconnect and warns", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const failure = new Error("wallet locked");
    const disconnectFeature: StandardDisconnectFeature = {
      disconnect: vi.fn().mockRejectedValue(failure),
    };
    const core = coreFor({ features: { "standard:disconnect": disconnectFeature } });
    await expect(present(core.base.disconnect, "disconnect")()).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith("[butr] Solana Wallet Standard disconnect threw:", failure);
    warn.mockRestore();
  });
});

describe("createWalletStandardCore getAccounts", () => {
  it("maps every exposed account on the current chain, in the wallet's order", async () => {
    const core = coreFor({ accounts: [buildWalletAccount("A"), buildWalletAccount("B")] });
    await expect(core.base.getAccounts()).resolves.toEqual([
      buildAccount("A", SVM_CHAINS.mainnet),
      buildAccount("B", SVM_CHAINS.mainnet),
    ]);
  });

  it("resolves an empty list when the wallet exposes no accounts", async () => {
    const core = coreFor({ accounts: [] });
    await expect(core.base.getAccounts()).resolves.toEqual([]);
  });

  it("keeps the address exactly as the wallet reports it", async () => {
    const core = coreFor({ accounts: [buildWalletAccount("MixedCaseAddr")] });
    const [account] = await core.base.getAccounts();
    expect(account?.walletAddress).toBe("MixedCaseAddr");
    expect(account?.id).toBe("solana:mainnet:MixedCaseAddr");
  });
});

describe("createWalletStandardCore resolveAccount", () => {
  it("returns the Wallet Standard account matching the address", () => {
    const second = buildWalletAccount("B");
    const core = coreFor({ accounts: [buildWalletAccount("A"), second] });
    expect(core.resolveAccount(buildAccount("B", SVM_CHAINS.mainnet))).toBe(second);
  });

  it("throws for an address the wallet does not expose instead of signing with another", () => {
    const core = coreFor({ accounts: [buildWalletAccount("A")] });
    expect(() => core.resolveAccount(buildAccount("unknown", SVM_CHAINS.mainnet))).toThrow(
      "Wallet Mock Solana Wallet does not expose account unknown",
    );
  });

  it("returns the active (first) account when no account is passed", () => {
    const first = buildWalletAccount("A");
    const core = coreFor({ accounts: [first, buildWalletAccount("B")] });
    expect(core.resolveAccount()).toBe(first);
  });

  it("throws when the wallet exposes no account", () => {
    const core = coreFor({ accounts: [] });
    expect(() => core.resolveAccount()).toThrow(
      "Wallet Mock Solana Wallet has no connected account",
    );
    expect(() => core.resolveAccount(buildAccount("A", SVM_CHAINS.mainnet))).toThrow(
      "does not expose account A",
    );
  });
});

describe("createWalletStandardCore resolveChainId", () => {
  it("returns the current chain id when no chain is passed", () => {
    expect(coreFor().resolveChainId()).toBe("solana:mainnet");
  });

  it("returns an advertised chain without moving the current chain", () => {
    const core = coreFor({ chains: ["solana:mainnet", "solana:devnet"] });
    expect(core.resolveChainId(SVM_CHAINS.devnet)).toBe("solana:devnet");
    expect(core.currentChain()).toBe(SVM_CHAINS.mainnet);
  });

  it("throws for a chain from another namespace", () => {
    expect(() => coreFor().resolveChainId(chain("eip155:1", "eip155"))).toThrow(
      'Solana adapter received non-Solana chain "eip155:1". Pass a chain with namespace "solana".',
    );
  });

  it("throws for a chain the wallet does not advertise", () => {
    expect(() => coreFor().resolveChainId(SVM_CHAINS.devnet)).toThrow(
      'Wallet Mock Solana Wallet does not advertise chain "solana:devnet". Available: solana:mainnet',
    );
  });
});

describe("createWalletStandardCore switchChain", () => {
  it("is absent when the wallet advertises a single chain in the namespace", () => {
    const core = coreFor({ chains: ["solana:mainnet", "sui:mainnet", "sui:testnet"] });
    expect(core.base.switchChain).toBeUndefined();
  });

  it("is present when the wallet advertises several chains in the namespace", () => {
    const core = coreFor({ chains: ["solana:mainnet", "solana:devnet", "sui:mainnet"] });
    expect(core.base.switchChain).toBeTypeOf("function");
  });

  it("rejects a chain from another namespace asynchronously", async () => {
    const switchChain = switchChainOf(coreFor({ chains: ["solana:mainnet", "solana:devnet"] }));
    let result: Promise<void> | undefined;
    expect(() => {
      result = switchChain(chain("eip155:1", "eip155"));
    }).not.toThrow();
    await expect(result).rejects.toThrow(/non-Solana chain "eip155:1"/v);
  });

  it("rejects a chain the wallet does not advertise", async () => {
    const core = coreFor({ chains: ["solana:mainnet", "solana:devnet"] });
    await expect(switchChainOf(core)(SVM_CHAINS.testnet)).rejects.toThrow(
      /does not advertise chain "solana:testnet"/v,
    );
    expect(core.currentChain()).toBe(SVM_CHAINS.mainnet);
  });

  it("re-points the current chain, and later reads, on success", async () => {
    const core = coreFor({ chains: ["solana:mainnet", "solana:devnet"] });
    await switchChainOf(core)(SVM_CHAINS.devnet);
    expect(core.currentChain()).toBe(SVM_CHAINS.devnet);
    expect(core.resolveChainId()).toBe("solana:devnet");
    await expect(core.base.getAccounts()).resolves.toEqual([
      buildAccount("So1Address1", SVM_CHAINS.devnet),
    ]);
  });

  it("notifies subscribers with the accounts on the new chain", async () => {
    const events = buildEventsFeature();
    const core = coreFor({
      accounts: [buildWalletAccount("A"), buildWalletAccount("B")],
      chains: ["solana:mainnet", "solana:devnet"],
      features: { "standard:events": events.feature },
    });
    const listener = listenerFn();
    subscribeTo(core)(listener);
    await switchChainOf(core)(SVM_CHAINS.devnet);
    expect(listener).toHaveBeenCalledExactlyOnceWith(accountsChanged(SVM_CHAINS.devnet, "A", "B"));
  });
});

describe("createWalletStandardCore subscribe", () => {
  it("is absent without standard:events or a disconnector", () => {
    expect(coreFor().base.subscribe).toBeUndefined();
  });

  it("is present with only a disconnector, so removal still reaches the manager", () => {
    const core = coreFor({}, { registerDisconnector: buildDisconnector().register });
    expect(core.base.subscribe).toBeTypeOf("function");
  });

  it("translates a change carrying accounts into accountsChanged, active first", () => {
    const events = buildEventsFeature();
    const core = coreFor({ features: { "standard:events": events.feature } });
    const listener = listenerFn();
    subscribeTo(core)(listener);
    events.emit({ accounts: [buildWalletAccount("C"), buildWalletAccount("D")] });
    expect(listener).toHaveBeenCalledWith(accountsChanged(SVM_CHAINS.mainnet, "C", "D"));
  });

  it("translates an empty accounts array into disconnected", () => {
    const events = buildEventsFeature();
    const core = coreFor({ features: { "standard:events": events.feature } });
    const listener = listenerFn();
    subscribeTo(core)(listener);
    events.emit({ accounts: [] });
    expect(listener).toHaveBeenCalledWith({ type: "disconnected" });
  });

  it("emits nothing for a change carrying neither accounts nor chains", () => {
    const events = buildEventsFeature();
    const core = coreFor({ features: { "standard:events": events.feature } });
    const listener = listenerFn();
    subscribeTo(core)(listener);
    events.emit({ features: ["solana:signIn"] });
    expect(listener).not.toHaveBeenCalled();
  });

  it("re-points the chain and re-emits on a chains-only change when trackChainChanges is true", () => {
    const events = buildEventsFeature();
    const core = coreFor({ features: { "standard:events": events.feature } });
    const listener = listenerFn();
    subscribeTo(core)(listener);
    events.emit({ chains: ["solana:devnet"] });
    expect(core.currentChain()).toBe(SVM_CHAINS.devnet);
    expect(listener).toHaveBeenCalledWith(accountsChanged(SVM_CHAINS.devnet, "So1Address1"));
  });

  it("ignores a chains-only change when trackChainChanges is false", () => {
    const events = buildEventsFeature();
    const core = coreFor(
      { features: { "standard:events": events.feature } },
      { trackChainChanges: false },
    );
    const listener = listenerFn();
    subscribeTo(core)(listener);
    events.emit({ chains: ["solana:devnet"] });
    expect(core.currentChain()).toBe(SVM_CHAINS.mainnet);
    expect(listener).not.toHaveBeenCalled();
  });

  it("keeps the active chain when a chains change lists nothing in the namespace", () => {
    const events = buildEventsFeature();
    const core = coreFor({ features: { "standard:events": events.feature } });
    const listener = listenerFn();
    subscribeTo(core)(listener);
    events.emit({ chains: ["eip155:1"] });
    expect(core.currentChain()).toBe(SVM_CHAINS.mainnet);
    expect(listener).not.toHaveBeenCalled();
  });

  it("uses the chain from the same change when accounts and chains move together", () => {
    const events = buildEventsFeature();
    const core = coreFor({ features: { "standard:events": events.feature } });
    const listener = listenerFn();
    subscribeTo(core)(listener);
    events.emit({ accounts: [buildWalletAccount("D")], chains: ["solana:devnet"] });
    expect(listener).toHaveBeenCalledExactlyOnceWith(accountsChanged(SVM_CHAINS.devnet, "D"));
  });

  it("delivers each wallet change once to every subscriber", () => {
    const events = buildEventsFeature();
    const core = coreFor({ features: { "standard:events": events.feature } });
    const first = listenerFn();
    const second = listenerFn();
    subscribeTo(core)(first);
    subscribeTo(core)(second);
    events.emit({ accounts: [buildWalletAccount("C")] });
    expect(first).toHaveBeenCalledExactlyOnceWith(accountsChanged(SVM_CHAINS.mainnet, "C"));
    expect(second).toHaveBeenCalledExactlyOnceWith(accountsChanged(SVM_CHAINS.mainnet, "C"));
  });

  it("stops delivery and drops the wallet listener on unsubscribe", async () => {
    const events = buildEventsFeature();
    const core = coreFor({
      chains: ["solana:mainnet", "solana:devnet"],
      features: { "standard:events": events.feature },
    });
    const listener = listenerFn();
    const unsubscribe = subscribeTo(core)(listener);
    expect(events.listenerCount()).toBe(1);
    unsubscribe();
    expect(events.listenerCount()).toBe(0);
    events.emit({ accounts: [buildWalletAccount("C")] });
    await switchChainOf(core)(SVM_CHAINS.devnet);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("createWalletStandardCore registerDisconnector", () => {
  it("hands back a callback that pushes disconnected to every subscriber", () => {
    const disconnector = buildDisconnector();
    const core = coreFor({}, { registerDisconnector: disconnector.register });
    const first = listenerFn();
    const second = listenerFn();
    subscribeTo(core)(first);
    subscribeTo(core)(second);
    disconnector.emit();
    expect(first).toHaveBeenCalledExactlyOnceWith({ type: "disconnected" });
    expect(second).toHaveBeenCalledExactlyOnceWith({ type: "disconnected" });
  });

  it("reaches nobody once every subscriber has unsubscribed", () => {
    const disconnector = buildDisconnector();
    const core = coreFor({}, { registerDisconnector: disconnector.register });
    const listener = listenerFn();
    const unsubscribe = subscribeTo(core)(listener);
    unsubscribe();
    disconnector.emit();
    expect(listener).not.toHaveBeenCalled();
  });
});
