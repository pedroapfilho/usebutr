import { describe, expect, it, vi } from "vitest";

import type { Callbacks } from "../../__tests__/helpers";
import {
  createGate,
  createMemoryPersistence,
  evmAdapter,
  flush,
  rejectionOf,
  staticSource,
  walletOf,
} from "../../__tests__/helpers";
import { toStoredPoolEntry } from "../../storage/wallet-state-codec";
import { createWalletManager } from "../wallet-manager";

const setup = async () => {
  const pending = Promise.withResolvers<undefined>();
  const adapter = evmAdapter("wallet", { connect: () => pending.promise });
  const storage = createMemoryPersistence();
  const onConnect = vi.fn<Callbacks["onConnect"]>();
  const onConnectError = vi.fn<Callbacks["onConnectError"]>();
  const onDisconnect = vi.fn<Callbacks["onDisconnect"]>();

  const manager = createWalletManager({
    onConnect,
    onConnectError,
    onDisconnect,
    sources: [staticSource(adapter)],
    storage,
  });

  manager.start();
  await flush();

  return { adapter, manager, onConnect, onConnectError, onDisconnect, pending, storage };
};

describe("connection lifetimes", () => {
  for (const disconnect of ["disconnect", "disconnectAll"] as const) {
    it(`${disconnect} rejects a late successful connect without persisting or announcing it`, async () => {
      const { adapter, manager, onConnect, onConnectError, onDisconnect, pending, storage } =
        await setup();

      const attempt = rejectionOf(manager.connect(adapter.id));
      manager[disconnect](adapter.id);
      pending.resolve(undefined);
      expect(await attempt).toMatchObject({ kind: "NotConnected" });
      await flush();

      expect(manager.getState()).toMatchObject({
        activeConnectorId: null,
        connectingConnectorId: null,
        connectionError: null,
        connectionStatus: "idle",
        isUserDisconnected: true,
      });
      expect(manager.getState().pool.size).toBe(0);
      expect(adapter.disconnect).toHaveBeenCalledOnce();
      expect(onConnect).not.toHaveBeenCalled();
      expect(onConnectError).not.toHaveBeenCalled();
      expect(onDisconnect).not.toHaveBeenCalled();
      expect(storage.saves.at(-1)).toMatchObject({ isUserDisconnected: true, pool: {} });
    });

    it(`${disconnect} ignores a late failure after a fresh connection succeeds`, async () => {
      const { adapter, manager, onConnect, onConnectError, pending } = await setup();
      const attempt = rejectionOf(manager.connect(adapter.id));
      manager[disconnect](adapter.id);
      adapter.connect = vi.fn().mockResolvedValue(undefined);
      const fresh = await manager.connect(adapter.id);
      pending.reject(new Error("user rejected"));
      expect(await attempt).toMatchObject({ kind: "UserRejected" });

      expect(manager.getState().pool.get(adapter.id)).toBe(fresh);
      expect(manager.getState()).toMatchObject({
        connectionError: null,
        connectionStatus: "success",
      });
      expect(adapter.disconnect).not.toHaveBeenCalled();
      expect(onConnect).toHaveBeenCalledOnce();
      expect(onConnectError).not.toHaveBeenCalled();
    });

    it(`${disconnect} keeps a fresh pooled session when the old permission request succeeds`, async () => {
      const { adapter, manager, onConnect, pending } = await setup();
      const attempt = rejectionOf(manager.connect(adapter.id));
      manager[disconnect](adapter.id);
      adapter.connect = vi.fn().mockResolvedValue(undefined);
      const fresh = await manager.connect(adapter.id);
      pending.resolve(undefined);
      expect(await attempt).toMatchObject({ kind: "NotConnected" });

      expect(manager.getState().pool.get(adapter.id)).toBe(fresh);
      expect(manager.getState().isUserDisconnected).toBe(false);
      expect(adapter.disconnect).not.toHaveBeenCalled();
      expect(onConnect).toHaveBeenCalledExactlyOnceWith(fresh, { reconnected: false });
    });
  }

  it("does not let a stale failure change a fresh pending attempt", async () => {
    const { adapter, manager, onConnectError, pending } = await setup();
    const stale = rejectionOf(manager.connect(adapter.id));
    manager.disconnect(adapter.id);
    const next = createGate();
    adapter.connect = () => next.promise;
    const fresh = manager.connect(adapter.id);
    pending.reject(new Error("user rejected"));
    await stale;
    expect(manager.getState()).toMatchObject({
      connectingConnectorId: adapter.id,
      connectionError: null,
      connectionStatus: "connecting",
    });
    expect(onConnectError).not.toHaveBeenCalled();
    expect(adapter.disconnect).not.toHaveBeenCalled();
    next.open();
    await fresh;
    expect(manager.getState().connectionStatus).toBe("success");
  });

  it("invalidates pending reconnects when a live wallet disconnects remotely", async () => {
    const { adapter, manager, onConnect, onDisconnect, pending } = await setup();
    adapter.connect = () => Promise.resolve();
    const first = await manager.connect(adapter.id);
    adapter.connect = () => pending.promise;
    const attempt = rejectionOf(manager.connect(adapter.id));
    adapter.emit({ type: "disconnected" });
    pending.resolve(undefined);
    expect(await attempt).toMatchObject({ kind: "NotConnected" });
    expect(manager.getState().pool.size).toBe(0);
    expect(onConnect).toHaveBeenCalledOnce();
    expect(onDisconnect).toHaveBeenCalledExactlyOnceWith(first, { byUser: false });
  });

  it("does not resurrect a forgotten restore when a fresh failed attempt leaves it unpooled", async () => {
    const gate = createGate();
    const adapter = evmAdapter("wallet", { connect: () => gate.promise });

    const storage = createMemoryPersistence({
      pool: { wallet: toStoredPoolEntry(walletOf(adapter)) },
    });

    const onConnect = vi.fn<Callbacks["onConnect"]>();
    const onHydrated = vi.fn<Callbacks["onHydrated"]>();

    const manager = createWalletManager({
      onConnect,
      onHydrated,
      sources: [staticSource(adapter)],
      storage,
    });

    manager.start();
    await flush();
    manager.disconnectAll();
    adapter.connect = () => Promise.reject(new Error("user rejected"));
    await expect(manager.connect(adapter.id)).rejects.toMatchObject({ kind: "UserRejected" });
    gate.open();
    await flush();
    expect(manager.getState().pool.size).toBe(0);
    expect(manager.getState().dormant.size).toBe(0);
    expect(onConnect).not.toHaveBeenCalled();
    expect(onHydrated).toHaveBeenCalledWith({ dropped: [], pendingIds: [], restoredIds: [] });
    expect(storage.saves.at(-1)?.pool).toEqual({});
  });
});

describe("late session cleanup", () => {
  it("keeps a fresh pending connection open when stale success arrives first", async () => {
    const { adapter, manager, pending } = await setup();
    const stale = rejectionOf(manager.connect(adapter.id));
    manager.disconnectAll();
    const next = createGate();
    adapter.connect = () => next.promise;
    const fresh = manager.connect(adapter.id);
    pending.resolve(undefined);
    expect(await stale).toMatchObject({ kind: "NotConnected" });
    expect(adapter.disconnect).not.toHaveBeenCalled();
    expect(manager.getState().connectionStatus).toBe("connecting");
    next.open();
    await fresh;
    expect(manager.getState().pool.has(adapter.id)).toBe(true);
  });

  it("closes a stale session when the newer connection already failed", async () => {
    const { adapter, manager, pending } = await setup();
    const stale = rejectionOf(manager.connect(adapter.id));
    manager.disconnectAll();
    adapter.connect = () => Promise.reject(new Error("user rejected"));
    await expect(manager.connect(adapter.id)).rejects.toMatchObject({ kind: "UserRejected" });
    vi.mocked(adapter.disconnect)?.mockClear();
    pending.resolve(undefined);
    expect(await stale).toMatchObject({ kind: "NotConnected" });
    expect(adapter.disconnect).toHaveBeenCalledOnce();
    expect(manager.getState().pool.size).toBe(0);
  });
});

it("closes a forgotten session that opens after the connection timeout", async () => {
  const { adapter, manager, pending } = await setup();
  vi.useFakeTimers();

  try {
    const stale = rejectionOf(manager.connect(adapter.id));
    manager.disconnectAll();
    await vi.advanceTimersByTimeAsync(90_000);
    expect(await stale).toMatchObject({ kind: "Timeout" });
    expect(adapter.disconnect).toHaveBeenCalledOnce();
    vi.mocked(adapter.disconnect)?.mockClear();
    pending.resolve(undefined);
    await vi.advanceTimersByTimeAsync(0);
    expect(adapter.disconnect).toHaveBeenCalledOnce();
    expect(manager.getState().pool.size).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
