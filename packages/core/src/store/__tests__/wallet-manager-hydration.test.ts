import { afterEach, describe, expect, it, vi } from "vitest";

import type { Callbacks } from "../../__tests__/helpers";
import {
  createGate,
  createManualSource,
  createMemoryPersistence,
  evmAdapter,
  flush,
  staticSource,
  svmAdapter,
  walletOf,
} from "../../__tests__/helpers";
import type { PersistedWalletState, StoredPoolEntry } from "../../storage/persistence";
import type { WalletAdapter, WalletManagerConfig } from "../../types";
import { ConnectionError } from "../../types";
import { ShadowConnectorError } from "../shadow-adapter";
import { createWalletManager } from "../wallet-manager";

const storedEntry = (adapter: WalletAdapter): StoredPoolEntry => {
  const { account, accounts } = walletOf(adapter);
  return {
    account,
    accounts,
    chainPlatform: adapter.chainPlatform,
    connectorId: adapter.id,
    icon: adapter.icon,
    name: adapter.name,
  };
};

const poolOf = (...adapters: ReadonlyArray<WalletAdapter>) =>
  Object.fromEntries(adapters.map((adapter) => [adapter.id, storedEntry(adapter)]));

type Setup = {
  config?: WalletManagerConfig;
  persisted?: Partial<PersistedWalletState>;
  sources?: WalletManagerConfig["sources"];
};

const startManager = async ({ config = {}, persisted = {}, sources = [] }: Setup = {}) => {
  const storage = createMemoryPersistence(persisted);
  const manager = createWalletManager({ sources, storage, ...config });
  manager.start();
  await flush();
  return { manager, storage };
};

const lastSave = (storage: ReturnType<typeof createMemoryPersistence>) => storage.saves.at(-1);

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("hydration", () => {
  it("silently restores persisted wallets whose adapters are announced", async () => {
    const onConnect = vi.fn<Callbacks["onConnect"]>();
    const onHydrated = vi.fn<Callbacks["onHydrated"]>();
    const metamask = evmAdapter("metamask");
    const rabby = evmAdapter("rabby");
    const { manager } = await startManager({
      config: { onConnect, onHydrated },
      persisted: { pool: poolOf(metamask) },
      sources: [staticSource(metamask, rabby)],
    });

    const state = manager.getState();
    expect(metamask.connect).toHaveBeenCalledExactlyOnceWith({ silent: true });
    expect(rabby.connect).not.toHaveBeenCalled();
    expect(state.isHydrated).toBe(true);
    expect(state.pool.get("metamask")?.connector).toBe(metamask);
    expect(state.dormant.size).toBe(0);
    expect(onConnect).toHaveBeenCalledExactlyOnceWith(state.pool.get("metamask"), {
      reconnected: true,
    });
    expect(onHydrated).toHaveBeenCalledExactlyOnceWith({
      dropped: [],
      pendingIds: [],
      restoredIds: ["metamask"],
    });
  });

  it("applies the stored active wallet and selection", async () => {
    const metamask = evmAdapter("metamask");
    const rabby = evmAdapter("rabby");
    const { manager } = await startManager({
      persisted: {
        activeConnectorId: "rabby",
        pool: poolOf(metamask, rabby),
        selection: { evm: "rabby" },
      },
      sources: [staticSource(metamask, rabby)],
    });

    expect(manager.getState().activeConnectorId).toBe("rabby");
    expect(manager.getState().selection.get("evm")).toBe("rabby");
  });

  it("ignores a stored active wallet or selection that is not live or not on that platform", async () => {
    const metamask = evmAdapter("metamask");
    const phantom = svmAdapter("phantom");
    const { manager } = await startManager({
      persisted: {
        activeConnectorId: "gone",
        pool: poolOf(metamask, phantom),
        selection: { evm: "phantom", svm: "gone" },
      },
      sources: [staticSource(metamask, phantom)],
    });

    const state = manager.getState();
    expect(state.activeConnectorId).toBe("metamask");
    expect(state.selection).toEqual(
      new Map([
        ["evm", "metamask"],
        ["svm", "phantom"],
      ]),
    );
  });

  it("takes the stored disconnect intent until the user connects again", async () => {
    const { manager } = await startManager({
      persisted: { isUserDisconnected: true },
      sources: [staticSource(evmAdapter("metamask"))],
    });
    expect(manager.getState().isUserDisconnected).toBe(true);

    await manager.connect("metamask");
    expect(manager.getState().isUserDisconnected).toBe(false);
  });

  it("does not let a stored preference override a choice made during hydration", async () => {
    const gate = createGate();
    const metamask = evmAdapter("metamask", {
      connect: (options) => (options?.silent === true ? gate.promise : Promise.resolve()),
    });
    const rabby = evmAdapter("rabby");
    const storage = createMemoryPersistence({
      activeConnectorId: "metamask",
      pool: poolOf(metamask),
      selection: { evm: "metamask" },
    });
    const manager = createWalletManager({ sources: [staticSource(metamask, rabby)], storage });
    manager.start();

    await manager.connect("rabby");
    gate.open();
    await flush();

    const state = manager.getState();
    expect([...state.pool.keys()]).toEqual(["rabby", "metamask"]);
    expect(state.activeConnectorId).toBe("rabby");
    expect(state.selection.get("evm")).toBe("rabby");
  });

  it("drops a failed silent reconnect but keeps it persisted for the next load", async () => {
    const onHydrated = vi.fn<Callbacks["onHydrated"]>();
    const metamask = evmAdapter("metamask", {
      connect: () => Promise.reject(new Error("wallet is locked")),
    });
    const { manager, storage } = await startManager({
      config: { onHydrated },
      persisted: { pool: poolOf(metamask) },
      sources: [staticSource(metamask)],
    });

    expect(manager.getState().pool.size).toBe(0);
    expect(manager.getState().dormant.has("metamask")).toBe(true);
    expect(lastSave(storage)?.pool.metamask).toEqual(storedEntry(metamask));
    const [outcome] = onHydrated.mock.lastCall ?? [];
    expect(outcome).toMatchObject({ pendingIds: [], restoredIds: [] });
    expect(outcome?.dropped).toEqual([
      { connectorId: "metamask", reason: expect.any(ConnectionError) },
    ]);
    expect(outcome?.dropped[0]?.reason.kind).toBe("WalletLocked");
  });

  it("drops a silent reconnect that exposes no accounts as NotConnected", async () => {
    const onHydrated = vi.fn<Callbacks["onHydrated"]>();
    const metamask = evmAdapter("metamask", { accounts: [] });
    await startManager({
      config: { onHydrated },
      persisted: { pool: poolOf(metamask) },
      sources: [staticSource(metamask)],
    });

    expect(onHydrated.mock.lastCall?.[0]?.dropped[0]?.reason.kind).toBe("NotConnected");
  });

  it("logs dropped reconnects when no onHydrated is given", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const metamask = evmAdapter("metamask", { connect: () => Promise.reject(new Error("no")) });
    await startManager({
      persisted: { pool: poolOf(metamask) },
      sources: [staticSource(metamask)],
    });

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("silent reconnect failed for metamask"),
      expect.any(ConnectionError),
    );
  });

  it("times out a silent reconnect that never settles, so hydration completes", async () => {
    vi.useFakeTimers();
    const onHydrated = vi.fn<Callbacks["onHydrated"]>();
    const metamask = evmAdapter("metamask", { connect: () => new Promise(() => {}) });
    const manager = createWalletManager({
      onHydrated,
      sources: [staticSource(metamask)],
      storage: createMemoryPersistence({ pool: poolOf(metamask) }),
    });
    manager.start();

    await vi.advanceTimersByTimeAsync(14_999);
    expect(manager.getState().isHydrated).toBe(false);
    await vi.advanceTimersByTimeAsync(1);

    expect(manager.getState().isHydrated).toBe(true);
    expect(onHydrated.mock.lastCall?.[0]?.dropped[0]?.reason.kind).toBe("Timeout");
  });

  it("does not silently reconnect a wallet the user connected before storage loaded", async () => {
    const onHydrated = vi.fn<Callbacks["onHydrated"]>();
    const metamask = evmAdapter("metamask");
    const storage = createMemoryPersistence();
    const load = Promise.withResolvers<PersistedWalletState>();
    storage.load.mockReturnValueOnce(load.promise);
    const manager = createWalletManager({ onHydrated, sources: [staticSource(metamask)], storage });
    manager.start();

    await manager.connect("metamask");
    load.resolve({
      activeConnectorId: "metamask",
      isUserDisconnected: false,
      pool: poolOf(metamask),
      selection: {},
    });
    await flush();

    expect(metamask.connect).toHaveBeenCalledExactlyOnceWith();
    expect(manager.getState().dormant.size).toBe(0);
    expect(onHydrated).toHaveBeenCalledExactlyOnceWith({
      dropped: [],
      pendingIds: [],
      restoredIds: [],
    });
  });

  it("restores a pending wallet the moment its adapter is announced", async () => {
    const onConnect = vi.fn<Callbacks["onConnect"]>();
    const onHydrated = vi.fn<Callbacks["onHydrated"]>();
    const phantom = svmAdapter("phantom");
    const manual = createManualSource();
    const { manager, storage } = await startManager({
      config: { onConnect, onHydrated },
      persisted: { pool: poolOf(phantom) },
      sources: [manual.source],
    });

    expect(onHydrated).toHaveBeenCalledExactlyOnceWith({
      dropped: [],
      pendingIds: ["phantom"],
      restoredIds: [],
    });
    expect(lastSave(storage)?.pool.phantom).toEqual(storedEntry(phantom));

    manual.announce(phantom);
    await flush();
    manual.announce(phantom);
    await flush();

    expect(phantom.connect).toHaveBeenCalledExactlyOnceWith({ silent: true });
    expect(manager.getState().pool.get("phantom")?.connector).toBe(phantom);
    expect(onConnect).toHaveBeenCalledWith(manager.getState().pool.get("phantom"), {
      reconnected: true,
    });
  });

  it("reports a wallet announced mid-hydration as pending, then restores it", async () => {
    const onHydrated = vi.fn<Callbacks["onHydrated"]>();
    const gate = createGate();
    const metamask = evmAdapter("metamask", { connect: () => gate.promise });
    const phantom = svmAdapter("phantom");
    const manual = createManualSource();
    const manager = createWalletManager({
      onHydrated,
      sources: [staticSource(metamask), manual.source],
      storage: createMemoryPersistence({ pool: poolOf(metamask, phantom) }),
    });
    manager.start();
    await flush();

    manual.announce(phantom);
    gate.open();
    await flush();

    expect(onHydrated).toHaveBeenCalledExactlyOnceWith({
      dropped: [],
      pendingIds: ["phantom"],
      restoredIds: ["metamask"],
    });
    expect([...manager.getState().pool.keys()]).toEqual(["phantom", "metamask"]);
  });

  it("closes the session a silent reconnect reopened after the user disconnected it", async () => {
    const gate = createGate();
    const metamask = evmAdapter("metamask", { connect: () => gate.promise });
    const manager = createWalletManager({
      sources: [staticSource(metamask)],
      storage: createMemoryPersistence({ pool: poolOf(metamask) }),
    });
    manager.start();
    await flush();

    manager.disconnect("metamask");
    gate.open();
    await flush();

    expect(manager.getState().pool.size).toBe(0);
    expect(metamask.disconnect).toHaveBeenCalledOnce();
  });

  it("keeps a wallet the user connected while its silent reconnect was in flight", async () => {
    const onConnect = vi.fn<Callbacks["onConnect"]>();
    const gate = createGate();
    const metamask = evmAdapter("metamask", {
      connect: (options) => (options?.silent === true ? gate.promise : Promise.resolve()),
    });
    const manager = createWalletManager({
      onConnect,
      sources: [staticSource(metamask)],
      storage: createMemoryPersistence({ pool: poolOf(metamask) }),
    });
    manager.start();

    const wallet = await manager.connect("metamask");
    gate.open();
    await flush();

    expect(manager.getState().pool.get("metamask")).toBe(wallet);
    expect(metamask.disconnect).not.toHaveBeenCalled();
    expect(onConnect).toHaveBeenCalledExactlyOnceWith(wallet, { reconnected: false });
  });

  it("hydrates as empty and reports a load that rejects", async () => {
    const onStorageError = vi.fn<Callbacks["onStorageError"]>();
    const storage = createMemoryPersistence();
    storage.load.mockRejectedValueOnce("disk on fire");
    const manager = createWalletManager({ onStorageError, storage });
    manager.start();
    await flush();

    expect(manager.getState().isHydrated).toBe(true);
    expect(onStorageError).toHaveBeenCalledExactlyOnceWith(new Error("disk on fire"));
  });
});

describe("initialState seeding", () => {
  const metamask = evmAdapter("metamask", { icon: "data:image/svg+xml,mm", name: "MetaMask" });
  const snapshot = {
    activeConnectorId: "metamask",
    pool: poolOf(metamask),
    selection: { evm: "metamask" },
  };

  it("makes the first seeded wallet active when the snapshot names none", () => {
    const phantom = svmAdapter("phantom");
    const rabby = evmAdapter("rabby");
    const manager = createWalletManager(
      { storage: createMemoryPersistence() },
      { initialState: { activeConnectorId: null, pool: poolOf(phantom, rabby), selection: {} } },
    );

    const state = manager.getState();
    expect(state.activeConnectorId).toBe("phantom");
    expect([...state.reconnectingIds]).toEqual(["phantom", "rabby"]);
    expect([...state.dormant.keys()]).toEqual(["phantom", "rabby"]);
    expect(state.selection).toEqual(
      new Map([
        ["svm", "phantom"],
        ["evm", "rabby"],
      ]),
    );
  });

  it("renders seeded wallets as reconnecting shadows before start", async () => {
    const storage = createMemoryPersistence();
    const manager = createWalletManager({ storage }, { initialState: snapshot });

    const state = manager.getState();
    expect(manager.getInitialState()).toBe(state);
    expect(storage.load).not.toHaveBeenCalled();
    expect(state.isHydrated).toBe(true);
    expect(state.activeConnectorId).toBe("metamask");
    expect([...state.reconnectingIds]).toEqual(["metamask"]);
    const shadow = state.pool.get("metamask")?.connector;
    expect(shadow).toMatchObject({ icon: "data:image/svg+xml,mm", name: "MetaMask" });
    await expect(shadow?.getSigner()).rejects.toBeInstanceOf(ShadowConnectorError);
  });

  it("swaps a shadow for the live adapter once its silent reconnect lands", async () => {
    const manager = createWalletManager(
      { sources: [staticSource(metamask)], storage: createMemoryPersistence() },
      { initialState: snapshot },
    );
    manager.start();
    await flush();

    const state = manager.getState();
    expect(state.pool.get("metamask")?.connector).toBe(metamask);
    expect(state.reconnectingIds.size).toBe(0);
    expect(state.dormant.size).toBe(0);
    expect(metamask.listenerCount()).toBe(1);
  });

  it("evicts a shadow whose silent reconnect fails but keeps it persisted", async () => {
    const locked = evmAdapter("metamask", { connect: () => Promise.reject(new Error("locked")) });
    const storage = createMemoryPersistence();
    const manager = createWalletManager(
      { sources: [staticSource(locked)], storage },
      { initialState: snapshot },
    );
    manager.start();
    await flush();

    const state = manager.getState();
    expect(state.pool.size).toBe(0);
    expect(state.reconnectingIds.size).toBe(0);
    expect(state.activeConnectorId).toBeNull();
    expect(lastSave(storage)?.pool.metamask?.name).toBe("MetaMask");
  });

  it("replaces a shadow with the wallet the user connects before its reconnect lands", async () => {
    const gate = createGate();
    const live = evmAdapter("metamask", {
      connect: (options) => (options?.silent === true ? gate.promise : Promise.resolve()),
    });
    const manager = createWalletManager(
      { sources: [staticSource(live)], storage: createMemoryPersistence() },
      { initialState: snapshot },
    );
    manager.start();

    const wallet = await manager.connect("metamask");
    expect(manager.getState().reconnectingIds.size).toBe(0);
    gate.open();
    await flush();

    expect(manager.getState().pool.get("metamask")).toBe(wallet);
    expect(live.disconnect).not.toHaveBeenCalled();
  });

  it("keeps the user's choice of active wallet and selection over the stored ones", async () => {
    const rabby = evmAdapter("rabby");
    const stored = {
      activeConnectorId: "metamask",
      pool: poolOf(metamask, rabby),
      selection: { evm: "metamask" },
    };
    const manager = createWalletManager(
      {
        sources: [staticSource(metamask, rabby)],
        storage: createMemoryPersistence(stored),
      },
      { initialState: stored },
    );
    manager.start();

    manager.setActive("rabby");
    manager.setSelection("evm", "rabby");
    await flush();

    const state = manager.getState();
    expect(state.reconnectingIds.size).toBe(0);
    expect(state.activeConnectorId).toBe("rabby");
    expect(state.selection.get("evm")).toBe("rabby");
  });

  it("keeps a shadow reconnecting until its adapter is announced", async () => {
    const onHydrated = vi.fn<Callbacks["onHydrated"]>();
    const manager = createWalletManager(
      { onHydrated, storage: createMemoryPersistence() },
      { initialState: snapshot },
    );
    manager.start();
    await flush();

    expect(manager.getState().reconnectingIds.has("metamask")).toBe(true);
    expect(onHydrated.mock.lastCall?.[0]?.pendingIds).toEqual(["metamask"]);
  });
});

describe("persistence", () => {
  it("saves nothing before hydration has loaded what was there", async () => {
    const storage = createMemoryPersistence();
    const load = Promise.withResolvers<PersistedWalletState>();
    storage.load.mockReturnValueOnce(load.promise);
    const manager = createWalletManager({
      sources: [staticSource(evmAdapter("metamask"))],
      storage,
    });
    manager.start();

    await manager.connect("metamask");
    await flush();
    expect(storage.save).not.toHaveBeenCalled();

    load.resolve({ activeConnectorId: null, isUserDisconnected: false, pool: {}, selection: {} });
    await flush();
    expect(Object.keys(lastSave(storage)?.pool ?? {})).toEqual(["metamask"]);
  });

  it("saves the live pool, the dormant entries, the selection and the intent", async () => {
    const metamask = evmAdapter("metamask");
    const phantom = svmAdapter("phantom");
    const { manager, storage } = await startManager({
      persisted: { pool: poolOf(phantom) },
      sources: [staticSource(metamask)],
    });
    await manager.connect("metamask");
    await flush();

    expect(lastSave(storage)).toEqual({
      activeConnectorId: "metamask",
      isUserDisconnected: false,
      pool: { metamask: storedEntry(metamask), phantom: storedEntry(phantom) },
      selection: { evm: "metamask" },
    });

    manager.disconnect("metamask");
    await flush();
    expect(lastSave(storage)).toEqual({
      activeConnectorId: null,
      isUserDisconnected: true,
      pool: {},
      selection: {},
    });
  });

  it("does not save a change outside the persisted slice", async () => {
    const { manager, storage } = await startManager();
    const saves = storage.saves.length;

    await manager.connect("nope").catch(() => {});
    manager.clearConnectionError();
    await flush();

    expect(storage.saves).toHaveLength(saves);
  });

  it("coalesces saves so an older state never lands after a newer one", async () => {
    const storage = createMemoryPersistence();
    const gates: Array<ReturnType<typeof createGate>> = [];
    storage.save.mockImplementation((state) => {
      storage.saves.push(state);
      const gate = createGate();
      gates.push(gate);
      return gate.promise;
    });
    const manager = createWalletManager({
      sources: [staticSource(evmAdapter("metamask"), evmAdapter("rabby"))],
      storage,
    });
    manager.start();
    await flush();

    await manager.connect("metamask");
    await manager.connect("rabby");
    manager.setActive("metamask");
    expect(storage.saves).toHaveLength(1);

    gates[0]?.open();
    await flush();
    gates[1]?.open();
    await flush();

    expect(storage.saves).toHaveLength(2);
    expect(lastSave(storage)?.activeConnectorId).toBe("metamask");
    expect(Object.keys(lastSave(storage)?.pool ?? {})).toEqual(["metamask", "rabby"]);
  });

  it("reports a failed save and keeps going", async () => {
    const onStorageError = vi.fn<Callbacks["onStorageError"]>();
    const storage = createMemoryPersistence();
    storage.save.mockRejectedValueOnce(new Error("quota"));
    const manager = createWalletManager({
      onStorageError,
      sources: [staticSource(evmAdapter("metamask"))],
      storage,
    });
    manager.start();
    await flush();

    await manager.connect("metamask");
    await flush();

    expect(onStorageError).toHaveBeenCalledExactlyOnceWith(new Error("quota"));
    expect(Object.keys(lastSave(storage)?.pool ?? {})).toEqual(["metamask"]);
  });

  it("defaults to browser storage under the given key prefix", async () => {
    const manager = createWalletManager({
      sources: [staticSource(evmAdapter("metamask"))],
      storageKeyPrefix: "app",
    });
    manager.start();
    await flush();
    await manager.connect("metamask");
    await flush();

    expect(localStorage.getItem("app-active")).toBe("metamask");
    expect(JSON.parse(localStorage.getItem("app-pool") ?? "{}")).toHaveProperty("metamask");
    localStorage.clear();
  });
});
