import type { ChainBase, ConnectorEvent } from "@usebutr/core";
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
    chainPrefix: "solana:",
    id: "wallet-standard:svm-mock",
    label: "SVM",
    namespace: "solana",
    platform: "Solana",
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

const listenerFn = () => vi.fn<(event: ConnectorEvent) => void>();

const chain = (id: string, namespace = "solana"): ChainBase => ({
  id,
  name: "Mock Solana Wallet",
  namespace,
  reference: id.slice(id.indexOf(":") + 1),
});

const accountOn = (chainId: string, address: string) => ({
  chain: chain(chainId),
  id: `${chainId}:${address}`,
  walletAddress: address,
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

  it("prefers a preferred chain over the wallet's first-listed chain", () => {
    const core = coreFor(
      { chains: ["solana:devnet", "solana:mainnet"] },
      { preferredChainIds: ["solana:mainnet"] },
    );
    expect(core.currentChainId()).toBe("solana:mainnet");
  });

  it("keeps the wallet's ordering when several preferred chains are advertised", () => {
    const core = coreFor(
      { chains: ["solana:devnet", "solana:mainnet"] },
      { preferredChainIds: ["solana:mainnet", "solana:devnet"] },
    );
    expect(core.currentChainId()).toBe("solana:devnet");
  });

  it("falls back to the first prefix-matching chain when no preferred chain is advertised", () => {
    const core = coreFor(
      { chains: ["eip155:1", "solana:testnet", "solana:devnet"] },
      { preferredChainIds: ["solana:mainnet"] },
    );
    expect(core.currentChainId()).toBe("solana:testnet");
  });

  it("builds a butr chain from the active chain id", () => {
    const core = coreFor({ chains: ["solana:devnet"] });
    expect(core.toChain()).toEqual({
      id: "solana:devnet",
      name: "Mock Solana Wallet",
      namespace: "solana",
      reference: "devnet",
    });
  });
});

describe("createWalletStandardCore chainCount", () => {
  it("counts only the chains matching the prefix", () => {
    const core = coreFor({
      chains: ["solana:mainnet", "solana:devnet", "bip122:000000000019d6689c085ae1", "sui:mainnet"],
    });
    expect(core.chainCount).toBe(2);
  });

  it("counts a multi-namespace wallet with one Solana chain as one", () => {
    const core = coreFor({ chains: ["solana:mainnet", "sui:mainnet", "sui:testnet"] });
    expect(core.chainCount).toBe(1);
  });
});

describe("createWalletStandardCore metadata", () => {
  it("exposes the caller's id alongside the wallet's name", () => {
    const core = coreFor({ name: "Phantom" });
    expect(core.id).toBe("wallet-standard:svm-mock");
    expect(core.name).toBe("Phantom");
  });

  it("trims the wallet icon", () => {
    const core = coreFor({ icon: "  data:image/png;base64,AA  " });
    expect(core.icon).toBe("data:image/png;base64,AA");
  });

  it("treats an all-whitespace icon as absent", () => {
    const core = coreFor({ icon: "   " });
    expect(core.icon).toBeUndefined();
  });

  it("reports whether the wallet advertises standard:events", () => {
    expect(coreFor().hasEvents).toBe(false);
    const events = buildEventsFeature();
    const core = coreFor({ features: { "standard:events": events.feature } });
    expect(core.hasEvents).toBe(true);
  });

  it("hands back the raw Wallet Standard wallet as the signer", async () => {
    const wallet = buildWallet();
    const core = buildCore(wallet);
    await expect(core?.getSigner()).resolves.toBe(wallet);
  });
});

describe("createWalletStandardCore connect", () => {
  it("forwards { silent: true } to standard:connect", async () => {
    const connectFeature = buildConnectFeature();
    const core = coreFor({ features: { "standard:connect": connectFeature } });
    await core.connect({ silent: true });
    expect(connectFeature.connect).toHaveBeenCalledWith({ silent: true });
  });

  it("passes no options for a plain connect()", async () => {
    const connectFeature = buildConnectFeature();
    const core = coreFor({ features: { "standard:connect": connectFeature } });
    await core.connect();
    expect(connectFeature.connect).toHaveBeenCalledWith(undefined);
  });

  it("passes no options when silent is false", async () => {
    const connectFeature = buildConnectFeature();
    const core = coreFor({ features: { "standard:connect": connectFeature } });
    await core.connect({ silent: false });
    expect(connectFeature.connect).toHaveBeenCalledWith(undefined);
  });
});

describe("createWalletStandardCore disconnect", () => {
  it("calls standard:disconnect when the wallet advertises it", async () => {
    const disconnectFeature: StandardDisconnectFeature = {
      disconnect: vi.fn().mockResolvedValue(undefined),
    };
    const core = coreFor({ features: { "standard:disconnect": disconnectFeature } });
    await core.disconnect();
    expect(disconnectFeature.disconnect).toHaveBeenCalledTimes(1);
  });

  it("resolves silently when the wallet advertises no standard:disconnect", async () => {
    const core = coreFor();
    await expect(core.disconnect()).resolves.toBeUndefined();
  });

  it("swallows a throwing standard:disconnect and warns", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const failure = new Error("wallet locked");
    const disconnectFeature: StandardDisconnectFeature = {
      disconnect: vi.fn().mockRejectedValue(failure),
    };
    const core = coreFor({ features: { "standard:disconnect": disconnectFeature } });
    await expect(core.disconnect()).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith("[butr] SVM Wallet Standard disconnect threw:", failure);
    warn.mockRestore();
  });
});

describe("createWalletStandardCore account reads", () => {
  it("returns the first exposed account from getAccount()", async () => {
    const core = coreFor({ accounts: [buildWalletAccount("A"), buildWalletAccount("B")] });
    await expect(core.getAccount()).resolves.toEqual(accountOn("solana:mainnet", "A"));
  });

  it("returns null from getAccount() when the wallet exposes no accounts", async () => {
    const core = coreFor({ accounts: [] });
    await expect(core.getAccount()).resolves.toBeNull();
  });

  it("maps every exposed account in getAccounts()", async () => {
    const core = coreFor({ accounts: [buildWalletAccount("A"), buildWalletAccount("B")] });
    await expect(core.getAccounts()).resolves.toEqual([
      accountOn("solana:mainnet", "A"),
      accountOn("solana:mainnet", "B"),
    ]);
  });

  it("returns an empty array from getAccounts() when the wallet exposes no accounts", async () => {
    const core = coreFor({ accounts: [] });
    await expect(core.getAccounts()).resolves.toEqual([]);
  });
});

describe("createWalletStandardCore resolveAccount", () => {
  it("returns the Wallet Standard account matching the address", () => {
    const second = buildWalletAccount("B");
    const core = coreFor({ accounts: [buildWalletAccount("A"), second] });
    expect(core.resolveAccount({ walletAddress: "B" })).toBe(second);
  });

  it("falls back to the first account for an address the wallet doesn't expose", () => {
    const first = buildWalletAccount("A");
    const core = coreFor({ accounts: [first] });
    expect(core.resolveAccount({ walletAddress: "unknown" })).toBe(first);
  });

  it("returns the first account when no account is passed", () => {
    const first = buildWalletAccount("A");
    const core = coreFor({ accounts: [first, buildWalletAccount("B")] });
    expect(core.resolveAccount()).toBe(first);
  });

  it("throws when the wallet exposes no account", () => {
    const core = coreFor({ accounts: [] });
    expect(() => core.resolveAccount()).toThrow("No connected account");
    expect(() => core.resolveAccount({ walletAddress: "A" })).toThrow("No connected account");
  });
});

describe("createWalletStandardCore switchChain", () => {
  it("rejects on a namespace mismatch", async () => {
    const core = coreFor();
    await expect(core.switchChain(chain("eip155:1", "eip155"))).rejects.toThrow(
      'SVM adapter received non-Solana chain "eip155:1". Pass a chain with namespace "solana".',
    );
  });

  it("rejects when the wallet does not advertise the chain", async () => {
    const core = coreFor({ chains: ["solana:mainnet"] });
    await expect(core.switchChain(chain("solana:devnet"))).rejects.toThrow(
      'Wallet Mock Solana Wallet does not advertise chain "solana:devnet". Available: solana:mainnet',
    );
  });

  it("re-points currentChainId and toChain on success", async () => {
    const core = coreFor({ chains: ["solana:mainnet", "solana:devnet"] });
    await core.switchChain(chain("solana:devnet"));
    expect(core.currentChainId()).toBe("solana:devnet");
    expect(core.toChain().reference).toBe("devnet");
  });

  it("notifies subscribers with an accountChanged carrying the new chain", async () => {
    const core = coreFor({
      accounts: [buildWalletAccount("A"), buildWalletAccount("B")],
      chains: ["solana:mainnet", "solana:devnet"],
    });
    const listener = listenerFn();
    core.subscribe(listener);
    await core.switchChain(chain("solana:devnet"));
    expect(listener).toHaveBeenCalledWith({
      account: accountOn("solana:devnet", "A"),
      accounts: [accountOn("solana:devnet", "A"), accountOn("solana:devnet", "B")],
      type: "accountChanged",
    });
  });

  it("re-points the chain but emits nothing when the wallet exposes no accounts", async () => {
    const core = coreFor({ accounts: [], chains: ["solana:mainnet", "solana:devnet"] });
    const listener = listenerFn();
    core.subscribe(listener);
    await core.switchChain(chain("solana:devnet"));
    expect(core.currentChainId()).toBe("solana:devnet");
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("createWalletStandardCore subscribe", () => {
  it("translates a change carrying accounts into accountChanged", () => {
    const events = buildEventsFeature();
    const core = coreFor({ features: { "standard:events": events.feature } });
    const listener = listenerFn();
    core.subscribe(listener);
    events.emit({ accounts: [buildWalletAccount("C")] });
    expect(listener).toHaveBeenCalledWith({
      account: accountOn("solana:mainnet", "C"),
      accounts: [accountOn("solana:mainnet", "C")],
      type: "accountChanged",
    });
  });

  it("translates an empty accounts array into disconnected", () => {
    const events = buildEventsFeature();
    const core = coreFor({ features: { "standard:events": events.feature } });
    const listener = listenerFn();
    core.subscribe(listener);
    events.emit({ accounts: [] });
    expect(listener).toHaveBeenCalledWith({ type: "disconnected" });
  });

  it("emits nothing for a change carrying neither accounts nor chains", () => {
    const events = buildEventsFeature();
    const core = coreFor({ features: { "standard:events": events.feature } });
    const listener = listenerFn();
    core.subscribe(listener);
    events.emit({ features: ["solana:signIn"] });
    expect(listener).not.toHaveBeenCalled();
  });

  it("re-points the chain and re-emits on a chains-only change when trackChainChanges is true", () => {
    const events = buildEventsFeature();
    const core = coreFor({ features: { "standard:events": events.feature } });
    const listener = listenerFn();
    core.subscribe(listener);
    events.emit({ chains: ["solana:devnet"] });
    expect(core.currentChainId()).toBe("solana:devnet");
    expect(listener).toHaveBeenCalledWith({
      account: accountOn("solana:devnet", "So1Address1"),
      accounts: [accountOn("solana:devnet", "So1Address1")],
      type: "accountChanged",
    });
  });

  it("ignores a chains-only change when trackChainChanges is false", () => {
    const events = buildEventsFeature();
    const core = coreFor(
      { features: { "standard:events": events.feature } },
      { trackChainChanges: false },
    );
    const listener = listenerFn();
    core.subscribe(listener);
    events.emit({ chains: ["solana:devnet"] });
    expect(core.currentChainId()).toBe("solana:mainnet");
    expect(listener).not.toHaveBeenCalled();
  });

  it("keeps the active chain when a chains change lists nothing in the namespace", () => {
    const events = buildEventsFeature();
    const core = coreFor({ features: { "standard:events": events.feature } });
    const listener = listenerFn();
    core.subscribe(listener);
    events.emit({ chains: ["eip155:1"] });
    expect(core.currentChainId()).toBe("solana:mainnet");
  });

  it("uses the chain from the same change when accounts and chains move together", () => {
    const events = buildEventsFeature();
    const core = coreFor({ features: { "standard:events": events.feature } });
    const listener = listenerFn();
    core.subscribe(listener);
    events.emit({ accounts: [buildWalletAccount("D")], chains: ["solana:devnet"] });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      account: accountOn("solana:devnet", "D"),
      accounts: [accountOn("solana:devnet", "D")],
      type: "accountChanged",
    });
  });

  it("stops delivery and drops the wallet listener on unsubscribe", () => {
    const events = buildEventsFeature();
    const core = coreFor({ features: { "standard:events": events.feature } });
    const listener = listenerFn();
    const unsubscribe = core.subscribe(listener);
    expect(events.listenerCount()).toBe(1);
    unsubscribe();
    expect(events.listenerCount()).toBe(0);
    events.emit({ accounts: [buildWalletAccount("C")] });
    expect(listener).not.toHaveBeenCalled();
  });

  it("subscribes without standard:events and unsubscribes cleanly", async () => {
    const core = coreFor({ chains: ["solana:mainnet", "solana:devnet"] });
    const listener = listenerFn();
    const unsubscribe = core.subscribe(listener);
    unsubscribe();
    await core.switchChain(chain("solana:devnet"));
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("createWalletStandardCore registerDisconnector", () => {
  it("hands back a callback that pushes disconnected to every subscriber", () => {
    const disconnector = buildDisconnector();
    const core = coreFor({}, { registerDisconnector: disconnector.register });
    const first = listenerFn();
    const second = listenerFn();
    core.subscribe(first);
    core.subscribe(second);
    disconnector.emit();
    expect(first).toHaveBeenCalledWith({ type: "disconnected" });
    expect(second).toHaveBeenCalledWith({ type: "disconnected" });
  });

  it("reaches nobody once every subscriber has unsubscribed", () => {
    const disconnector = buildDisconnector();
    const core = coreFor({}, { registerDisconnector: disconnector.register });
    const listener = listenerFn();
    const unsubscribe = core.subscribe(listener);
    unsubscribe();
    disconnector.emit();
    expect(listener).not.toHaveBeenCalled();
  });
});
