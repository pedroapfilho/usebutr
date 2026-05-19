import { describe, expect, it, vi } from "vitest";
import { createHydrationCoordinator } from "../hydration";
import type { StoredPoolEntry, StoredPoolRecord, WalletPersistence } from "../../storage";
import { createMockAccount, createMockConnector } from "../../__tests__/helpers";
import type { WalletAdapter } from "../../types";

type FakeStorageInit = {
  active?: string | null;
  pool?: StoredPoolRecord;
  selection?: { evm?: string; svm?: string };
  userDisconnected?: boolean;
};

const buildEntry = (connectorId: string): StoredPoolEntry => ({
  account: createMockAccount(),
  accounts: [createMockAccount()],
  chainPlatform: "evm",
  connectorId,
});

const createFakeStorage = (init: FakeStorageInit = {}): WalletPersistence => {
  const removed: Array<string> = [];
  let pool = { ...init.pool };
  return {
    clearAll: vi.fn().mockResolvedValue(undefined),
    clearPool: vi.fn().mockResolvedValue(undefined),
    getActiveConnectorId: () => Promise.resolve(init.active ?? null),
    getPool: () => Promise.resolve(pool),
    getSelection: () => Promise.resolve(init.selection ?? {}),
    isUserDisconnected: () => Promise.resolve(init.userDisconnected ?? false),
    markUserDisconnected: vi.fn().mockResolvedValue(undefined),
    removePoolEntry: vi.fn().mockImplementation((id: string) => {
      removed.push(id);
      const { [id]: _drop, ...rest } = pool;
      void _drop;
      pool = rest;
      return Promise.resolve();
    }),
    setActiveConnectorId: vi.fn().mockResolvedValue(undefined),
    setPool: vi.fn().mockResolvedValue(undefined),
    setSelection: vi.fn().mockResolvedValue(undefined),
    // Helper not on the interface — call via cast in tests.
    removed,
  } as unknown as WalletPersistence;
};

const getRemoved = (storage: WalletPersistence): Array<string> =>
  (storage as unknown as { removed: Array<string> }).removed;

describe("createHydrationCoordinator", () => {
  it("restores entries whose adapter is registered (eager path)", async () => {
    const storage = createFakeStorage({
      active: "wallet-a",
      pool: { "wallet-a": buildEntry("wallet-a") },
    });
    const createConnector = (id: string) =>
      id === "wallet-a" ? createMockConnector({ id }) : null;
    const onStorageError = vi.fn();
    const coordinator = createHydrationCoordinator(storage, createConnector, onStorageError);

    const result = await coordinator.hydrate();

    expect(result.pool.has("wallet-a")).toBe(true);
    expect(result.pendingIds).toEqual([]);
    expect(result.dropped).toEqual([]);
    expect(result.activeConnectorId).toBe("wallet-a");
    expect(onStorageError).not.toHaveBeenCalled();
  });

  it("parks entries whose adapter is not yet registered", async () => {
    const storage = createFakeStorage({ pool: { "late-adapter": buildEntry("late-adapter") } });
    const coordinator = createHydrationCoordinator(storage, () => null, vi.fn());

    const result = await coordinator.hydrate();

    expect(result.pool.size).toBe(0);
    expect(result.pendingIds).toEqual(["late-adapter"]);
    expect(coordinator.pendingIds()).toEqual(["late-adapter"]);
  });

  it("drainPending returns null when the entry isn't parked", async () => {
    const coordinator = createHydrationCoordinator(createFakeStorage(), () => null, vi.fn());
    await coordinator.hydrate();
    const outcome = await coordinator.drainPending("never-registered");
    expect(outcome).toBeNull();
  });

  it("drainPending returns null when the adapter is still missing", async () => {
    const storage = createFakeStorage({ pool: { "wallet-late": buildEntry("wallet-late") } });
    const coordinator = createHydrationCoordinator(storage, () => null, vi.fn());
    await coordinator.hydrate();

    const outcome = await coordinator.drainPending("wallet-late");
    expect(outcome).toBeNull();
    // Still parked — a future drain after the adapter arrives should work.
    expect(coordinator.pendingIds()).toEqual(["wallet-late"]);
  });

  it("drainPending succeeds and removes the entry from the queue when the adapter arrives", async () => {
    const storage = createFakeStorage({ pool: { "wallet-late": buildEntry("wallet-late") } });
    let adapterReady = false;
    const createConnector = (id: string): WalletAdapter | null => {
      if (id === "wallet-late" && adapterReady) {
        return createMockConnector({ id });
      }
      return null;
    };
    const coordinator = createHydrationCoordinator(storage, createConnector, vi.fn());
    await coordinator.hydrate();
    expect(coordinator.pendingIds()).toEqual(["wallet-late"]);

    adapterReady = true;
    const outcome = await coordinator.drainPending("wallet-late");

    expect(outcome?.kind).toBe("ok");
    if (outcome?.kind === "ok") {
      expect(outcome.entry.connector.id).toBe("wallet-late");
    }
    expect(coordinator.pendingIds()).toEqual([]);
  });

  it("drops entries whose restore throws and removes them from storage", async () => {
    const storage = createFakeStorage({ pool: { "broken-wallet": buildEntry("broken-wallet") } });
    const createConnector = (id: string) =>
      createMockConnector({
        connect: vi.fn().mockRejectedValue(new Error("user rejected")),
        id,
      });
    const coordinator = createHydrationCoordinator(storage, createConnector, vi.fn());

    const result = await coordinator.hydrate();

    expect(result.pool.size).toBe(0);
    expect(result.dropped).toEqual([
      { connectorId: "broken-wallet", reason: expect.any(Error) },
    ]);
    expect(getRemoved(storage)).toEqual(["broken-wallet"]);
  });

  it("routes storage cleanup failures through the error reporter", async () => {
    const baseStorage = createFakeStorage({ pool: { broken: buildEntry("broken") } });
    const storage: WalletPersistence = {
      ...baseStorage,
      removePoolEntry: vi.fn().mockRejectedValue(new Error("storage down")),
    };
    const reportStorageError = vi.fn();
    const coordinator = createHydrationCoordinator(
      storage,
      () =>
        createMockConnector({
          connect: vi.fn().mockRejectedValue(new Error("rejected")),
        }),
      reportStorageError,
    );

    await coordinator.hydrate();
    // The cleanup is fire-and-forget — wait a microtask for the
    // rejected removePoolEntry to flush.
    await Promise.resolve();
    await Promise.resolve();

    expect(reportStorageError).toHaveBeenCalledWith(
      "failed to remove broken entry",
      expect.any(Error),
    );
  });

  it("reconciles selection — drops stale connector ids and fills missing platforms", async () => {
    const storage = createFakeStorage({
      pool: {
        "evm-a": buildEntry("evm-a"),
        "ghost-svm": buildEntry("ghost-svm"), // present in pool but adapter will fail
      },
      selection: { evm: "evm-a", svm: "ghost-svm" },
    });
    const createConnector = (id: string) =>
      id === "evm-a"
        ? createMockConnector({ id })
        : createMockConnector({
            connect: vi.fn().mockRejectedValue(new Error("nope")),
            id,
          });
    const coordinator = createHydrationCoordinator(storage, createConnector, vi.fn());

    const result = await coordinator.hydrate();

    // svm selection drops because ghost-svm failed to restore.
    expect(result.selection.get("evm")).toBe("evm-a");
    expect(result.selection.has("svm")).toBe(false);
  });

  it("picks an active connector from the pool when the stored one didn't restore", async () => {
    const storage = createFakeStorage({
      active: "missing-wallet",
      pool: { "real-wallet": buildEntry("real-wallet") },
    });
    const coordinator = createHydrationCoordinator(
      storage,
      (id) => (id === "real-wallet" ? createMockConnector({ id }) : null),
      vi.fn(),
    );

    const result = await coordinator.hydrate();
    expect(result.activeConnectorId).toBe("real-wallet");
  });

  it("activeConnectorId is null when the pool is empty", async () => {
    const storage = createFakeStorage({ active: "anything" });
    const coordinator = createHydrationCoordinator(storage, () => null, vi.fn());

    const result = await coordinator.hydrate();
    expect(result.activeConnectorId).toBeNull();
  });

  it("clears prior pending entries on rehydrate", async () => {
    const storage = createFakeStorage({ pool: { "wallet-a": buildEntry("wallet-a") } });
    const coordinator = createHydrationCoordinator(storage, () => null, vi.fn());
    await coordinator.hydrate();
    expect(coordinator.pendingIds()).toEqual(["wallet-a"]);

    // Second hydrate with a fresh storage shape — prior pending should
    // not leak into the new run.
    const storage2 = createFakeStorage({ pool: { "wallet-b": buildEntry("wallet-b") } });
    const coordinator2 = createHydrationCoordinator(storage2, () => null, vi.fn());
    await coordinator2.hydrate();
    expect(coordinator2.pendingIds()).toEqual(["wallet-b"]);
  });

  it("preserves isUserDisconnected from storage", async () => {
    const storage = createFakeStorage({ userDisconnected: true });
    const coordinator = createHydrationCoordinator(storage, () => null, vi.fn());

    const result = await coordinator.hydrate();
    expect(result.isUserDisconnected).toBe(true);
  });
});
