import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createAsyncDriver,
  createGate,
  createSyncDriver,
  EMPTY_PERSISTED,
  evmAdapter,
  flush,
  rejectionOf,
  walletOf,
} from "../../__tests__/helpers";
import { toStoredEntry } from "../../store/reducer";
import type { PersistedWalletState, StorageDriver } from "../persistence";
import { createWalletStorage } from "../wallet-storage";

const metamask = toStoredEntry("metamask", walletOf(evmAdapter("metamask")));

const connectedState: PersistedWalletState = {
  activeConnectorId: "metamask",
  isUserDisconnected: false,
  pool: { metamask },
  selection: { evm: "metamask" },
};

const setup = (
  drivers: { persistent?: StorageDriver; session?: StorageDriver } = {},
  keyPrefix = "test",
) => {
  const persistent = createSyncDriver();
  const session = createSyncDriver();
  const storage = createWalletStorage({
    keyPrefix,
    persistent: drivers.persistent ?? persistent,
    session: drivers.session ?? session,
  });
  return { persistent, session, storage };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createWalletStorage", () => {
  it("loads an empty state from empty drivers", async () => {
    const { storage } = setup();
    expect(await storage.load()).toEqual(EMPTY_PERSISTED);
  });

  it("round-trips a saved state, the intent in the session driver", async () => {
    const { persistent, session, storage } = setup();
    const state = { ...connectedState, isUserDisconnected: true };

    await storage.save(state);

    expect([...persistent.entries.keys()].toSorted()).toEqual([
      "test-active",
      "test-pool",
      "test-selection",
    ]);
    expect(session.entries.get("test-user-disconnected")).toBe("true");
    expect(await storage.load()).toEqual(state);
  });

  it("reads what another instance under the same prefix wrote", async () => {
    const { persistent, session, storage } = setup();
    await storage.save(connectedState);

    const reader = createWalletStorage({ keyPrefix: "test", persistent, session });
    expect(await reader.load()).toEqual(connectedState);
    expect(await createWalletStorage({ keyPrefix: "other", persistent, session }).load()).toEqual(
      EMPTY_PERSISTED,
    );
  });

  it("does not rewrite a key whose value is unchanged", async () => {
    const { persistent, storage } = setup();
    await storage.save(connectedState);
    await storage.save({ ...connectedState, activeConnectorId: null });

    expect(persistent.setItem).toHaveBeenCalledTimes(3);
    expect(persistent.removeItem).toHaveBeenCalledExactlyOnceWith("test-active");
  });

  it("does not rewrite what it has just loaded", async () => {
    const { persistent, session, storage } = setup();
    await storage.save(connectedState);
    const reader = createWalletStorage({ keyPrefix: "test", persistent, session });
    vi.mocked(persistent.setItem).mockClear();
    vi.mocked(persistent.removeItem).mockClear();

    await reader.save(await reader.load());

    expect(persistent.setItem).not.toHaveBeenCalled();
    expect(persistent.removeItem).not.toHaveBeenCalled();
  });

  it("removes keys whose value is empty", async () => {
    const { persistent, session, storage } = setup();
    await storage.save({ ...connectedState, isUserDisconnected: true });

    await storage.save(EMPTY_PERSISTED);

    expect(persistent.entries.size).toBe(0);
    expect(session.entries.size).toBe(0);
  });

  it("decodes a corrupt payload as empty and overwrites it on the next save", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { persistent, storage } = setup();
    persistent.entries.set("test-pool", "{not json");
    persistent.entries.set("test-selection", JSON.stringify({ evm: 7, martian: "x" }));
    persistent.entries.set("test-active", "");

    expect(await storage.load()).toEqual(EMPTY_PERSISTED);

    await storage.save(EMPTY_PERSISTED);
    expect(persistent.entries.size).toBe(0);
  });

  it("drops only the invalid pool entries and rewrites the survivors", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { persistent, storage } = setup();
    persistent.entries.set(
      "test-pool",
      JSON.stringify({ metamask, rogue: { connectorId: "rogue" }, wrong: metamask }),
    );

    const loaded = await storage.load();
    expect(loaded.pool).toEqual({ metamask });

    await storage.save(loaded);
    expect(JSON.parse(persistent.entries.get("test-pool") ?? "")).toEqual({ metamask });
  });

  it("treats a driver that throws on read as empty", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const persistent = createSyncDriver();
    persistent.getItem = () => {
      throw new Error("denied");
    };
    const { storage } = setup({ persistent });

    expect(await storage.load()).toEqual(EMPTY_PERSISTED);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("failed to read"), expect.any(Error));
  });

  it("rejects a failed write and retries it on the next save", async () => {
    const persistent = createSyncDriver();
    const setItem = vi.mocked(persistent.setItem);
    setItem.mockImplementationOnce(() => {
      throw new Error("quota");
    });
    const { storage } = setup({ persistent });

    await expect(storage.save(connectedState)).rejects.toThrow("quota");
    await storage.save(connectedState);

    expect(await storage.load()).toEqual(connectedState);
  });

  it("works over async drivers", async () => {
    const persistent = createAsyncDriver();
    const session = createAsyncDriver();
    const { storage } = setup({ persistent, session });

    await storage.save({ ...connectedState, isUserDisconnected: true });
    expect(await storage.load()).toEqual({ ...connectedState, isUserDisconnected: true });
  });

  it("finishes pending writes before rejecting, so a later disconnect stays saved", async () => {
    const persistent = createSyncDriver();
    const gate = createGate();
    const failure = new Error("active write failed");
    persistent.setItem = async (key, value) => {
      if (key === "test-active") {
        throw failure;
      }
      if (key === "test-pool") {
        await gate.promise;
      }
      persistent.entries.set(key, value);
    };
    const { storage } = setup({ persistent });
    await storage.load();
    let settled = false;
    const save = (async () => {
      const error = await rejectionOf(storage.save(connectedState));
      settled = true;
      return error;
    })();
    await flush();
    expect(settled).toBe(false);

    gate.open();
    expect(await save).toBe(failure);
    await storage.save({ ...EMPTY_PERSISTED, isUserDisconnected: true });

    expect(persistent.entries.size).toBe(0);
    expect(await storage.load()).toEqual({ ...EMPTY_PERSISTED, isUserDisconnected: true });
  });

  it("defaults the prefix to butr and the drivers to web storage", async () => {
    const storage = createWalletStorage();
    await storage.save({ ...connectedState, isUserDisconnected: true });

    expect(localStorage.getItem("butr-active")).toBe("metamask");
    expect(sessionStorage.getItem("butr-user-disconnected")).toBe("true");
    await storage.save(EMPTY_PERSISTED);
    expect(localStorage.getItem("butr-active")).toBeNull();
    expect(sessionStorage.getItem("butr-user-disconnected")).toBeNull();
  });
});
