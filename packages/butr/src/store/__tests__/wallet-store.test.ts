import { describe, expect, it, vi } from "vitest";
import { createWalletStore } from "../wallet-store";
import { WalletStorage } from "../../storage/wallet-storage";
import {
  createMockAccount,
  createMockChain,
  createMockConfig,
  createMockConnector,
  createMockStorageDriver,
} from "../../__tests__/helpers";
import type { WalletManagerConfig } from "../../types";

const createTestStore = (overrides?: Partial<WalletManagerConfig>) => {
  const persistent = createMockStorageDriver();
  const session = createMockStorageDriver();
  const storage = new WalletStorage({
    keyPrefix: "test",
    persistent,
    session,
  });
  const config = createMockConfig({ storage, ...overrides });
  const store = createWalletStore(config);
  return { config, persistent, session, storage, store };
};

const hydrateStore = async (store: ReturnType<typeof createWalletStore>) => {
  await store.getState()._hydrateWallets();
};

describe("createWalletStore", () => {
  describe("initial state", () => {
    it("starts empty", () => {
      const { store } = createTestStore();
      const state = store.getState();
      expect(state.pool.size).toBe(0);
      expect(state.selection.size).toBe(0);
      expect(state.activeConnectorId).toBeNull();
      expect(state.connectingConnectorId).toBeNull();
      expect(state.isHydrated).toBe(false);
      expect(state.isUserDisconnected).toBe(false);
    });

    it("starts with idle connection status", () => {
      const { store } = createTestStore();
      const state = store.getState();
      expect(state.connectionStatus).toBe("idle");
      expect(state.connectionError).toBeNull();
    });
  });

  describe("connectWallet", () => {
    it("populates pool, selection, and active on success", async () => {
      const account = createMockAccount();
      const connector = createMockConnector({
        chainPlatform: "evm",
        getAccount: vi.fn().mockResolvedValue(account),
        id: "metamask",
      });
      const { store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });

      await store.getState().connectWallet("metamask");

      const state = store.getState();
      expect(state.pool.size).toBe(1);
      expect(state.pool.get("metamask")?.connector.id).toBe("metamask");
      expect(state.pool.get("metamask")?.account).toEqual(account);
      expect(state.selection.get("evm")).toBe("metamask");
      expect(state.activeConnectorId).toBe("metamask");
      expect(state.connectionStatus).toBe("success");
    });

    it("connects two wallets on different platforms simultaneously", async () => {
      const evmConnector = createMockConnector({ chainPlatform: "evm", id: "metamask" });
      const svmConnector = createMockConnector({ chainPlatform: "svm", id: "phantom" });
      const { store } = createTestStore({
        createConnector: vi.fn((id) => (id === "metamask" ? evmConnector : svmConnector)),
      });

      await store.getState().connectWallet("metamask");
      await store.getState().connectWallet("phantom");

      const state = store.getState();
      expect(state.pool.size).toBe(2);
      expect(state.selection.get("evm")).toBe("metamask");
      expect(state.selection.get("svm")).toBe("phantom");
      expect(state.activeConnectorId).toBe("phantom");
    });

    it("clears the disconnect-intent flag when connecting", async () => {
      const { storage, store } = createTestStore();
      await storage.markUserDisconnected(true);
      await hydrateStore(store);
      expect(store.getState().isUserDisconnected).toBe(true);

      await store.getState().connectWallet("test");
      expect(store.getState().isUserDisconnected).toBe(false);
      expect(await storage.isUserDisconnected()).toBe(false);
    });

    it("skips pool churn when connecting same address on same connector", async () => {
      const account = createMockAccount({ walletAddress: "0xSAME" });
      const connector = createMockConnector({
        getAccount: vi.fn().mockResolvedValue(account),
      });
      const { store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });

      await store.getState().connectWallet("test");
      const poolAfterFirst = store.getState().pool;

      await store.getState().connectWallet("test");
      const poolAfterSecond = store.getState().pool;

      expect(poolAfterFirst).toBe(poolAfterSecond);
    });

    it("calls onConnect and onSuccess", async () => {
      const onConnect = vi.fn();
      const onSuccess = vi.fn();
      const { store } = createTestStore({ onConnect });
      await store.getState().connectWallet("test", onSuccess);
      expect(onConnect).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("sets error and calls onError on failure", async () => {
      const connector = createMockConnector({
        connect: vi.fn().mockRejectedValue(new Error("User rejected")),
      });
      const { store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });
      const onError = vi.fn();

      await expect(store.getState().connectWallet("test", undefined, onError)).rejects.toThrow(
        "User rejected",
      );

      expect(store.getState().connectionStatus).toBe("error");
      expect(store.getState().connectionError).toBe("User rejected");
      expect(store.getState().connectingConnectorId).toBeNull();
      expect(onError).toHaveBeenCalledTimes(1);
      expect(connector.disconnect).toHaveBeenCalled();
    });

    it("throws when connector cannot be created", async () => {
      const { store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(null),
      });
      await expect(store.getState().connectWallet("bad")).rejects.toThrow(
        "Failed to create connector",
      );
    });

    it("rejects on connection timeout", async () => {
      vi.useFakeTimers();
      const connector = createMockConnector({
        connect: vi.fn().mockReturnValue(new Promise(() => {})),
      });
      const { store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });

      const promise = store.getState().connectWallet("slow");
      vi.advanceTimersByTime(90_001);

      await expect(promise).rejects.toThrow("Connection timeout");
      vi.useRealTimers();
    });

    it("transitions connectingConnectorId during the in-flight connect", async () => {
      let resolveConnect: () => void;
      const connector = createMockConnector({
        connect: vi.fn().mockReturnValue(
          new Promise<void>((resolve) => {
            resolveConnect = resolve;
          }),
        ),
      });
      const { store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });

      const connectPromise = store.getState().connectWallet("test");
      await Promise.resolve();
      expect(store.getState().connectionStatus).toBe("connecting");
      expect(store.getState().connectingConnectorId).toBe("test");

      resolveConnect!();
      await connectPromise;
      expect(store.getState().connectionStatus).toBe("success");
      expect(store.getState().connectingConnectorId).toBeNull();
      expect(store.getState().activeConnectorId).toBe("test");
    });
  });

  describe("disconnectWallet", () => {
    it("removes a wallet by connectorId", async () => {
      const connector = createMockConnector({ id: "metamask" });
      const { store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });

      await store.getState().connectWallet("metamask");
      await hydrateStore(store);

      store.getState().disconnectWallet("metamask");

      expect(store.getState().pool.size).toBe(0);
      expect(store.getState().selection.has("evm")).toBe(false);
      expect(store.getState().activeConnectorId).toBeNull();
      expect(connector.disconnect).toHaveBeenCalled();
    });

    it("falls selection to another wallet on same platform when one is dropped", async () => {
      const meta = createMockConnector({ chainPlatform: "evm", id: "metamask" });
      const rabby = createMockConnector({ chainPlatform: "evm", id: "rabby" });
      const { store } = createTestStore({
        createConnector: vi.fn((id) => (id === "metamask" ? meta : rabby)),
      });

      await store.getState().connectWallet("metamask");
      await store.getState().connectWallet("rabby");
      await hydrateStore(store);
      // After connecting rabby second, selection.evm = rabby (overwrites)
      expect(store.getState().selection.get("evm")).toBe("rabby");

      store.getState().disconnectWallet("rabby");
      // Selection falls back to metamask (the remaining EVM wallet)
      expect(store.getState().selection.get("evm")).toBe("metamask");
    });

    it("sets disconnect-intent flag", async () => {
      const connector = createMockConnector({ id: "metamask" });
      const { storage, store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });

      await store.getState().connectWallet("metamask");
      await hydrateStore(store);
      store.getState().disconnectWallet("metamask");

      expect(store.getState().isUserDisconnected).toBe(true);
      expect(await storage.isUserDisconnected()).toBe(true);
    });

    it("is a no-op for unknown connectorId", async () => {
      const connector = createMockConnector({ id: "metamask" });
      const { store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });

      await store.getState().connectWallet("metamask");
      await hydrateStore(store);

      store.getState().disconnectWallet("nonexistent");
      expect(store.getState().pool.size).toBe(1);
    });

    it("is a no-op before hydration", async () => {
      const connector = createMockConnector();
      const { store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });

      await store.getState().connectWallet("test");
      // intentionally NOT hydrating
      store.getState().disconnectWallet("test");
      expect(store.getState().pool.size).toBe(1);
    });

    it("calls onDisconnect with the chainPlatform of the removed wallet", async () => {
      const onDisconnect = vi.fn();
      const connector = createMockConnector({ chainPlatform: "evm", id: "metamask" });
      const { store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
        onDisconnect,
      });

      await store.getState().connectWallet("metamask");
      await hydrateStore(store);
      store.getState().disconnectWallet("metamask");

      expect(onDisconnect).toHaveBeenCalledWith("evm");
    });

    it("clears storage when last wallet is disconnected", async () => {
      const connector = createMockConnector();
      const { storage, store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });
      const clearAllSpy = vi.spyOn(storage, "clearAll");

      await store.getState().connectWallet("test");
      await hydrateStore(store);
      store.getState().disconnectWallet("test");

      expect(clearAllSpy).toHaveBeenCalled();
    });
  });

  describe("setActiveConnector", () => {
    it("changes the active connector without touching selection or pool", async () => {
      const meta = createMockConnector({ chainPlatform: "evm", id: "metamask" });
      const phantom = createMockConnector({ chainPlatform: "svm", id: "phantom" });
      const { store } = createTestStore({
        createConnector: vi.fn((id) => (id === "metamask" ? meta : phantom)),
      });

      await store.getState().connectWallet("metamask");
      await store.getState().connectWallet("phantom");

      const selectionBefore = store.getState().selection;
      const poolBefore = store.getState().pool;

      store.getState().setActiveConnector("metamask");

      expect(store.getState().activeConnectorId).toBe("metamask");
      expect(store.getState().selection).toBe(selectionBefore);
      expect(store.getState().pool).toBe(poolBefore);
    });
  });

  describe("setSelection", () => {
    it("updates the selection for a platform", async () => {
      const meta = createMockConnector({ chainPlatform: "evm", id: "metamask" });
      const rabby = createMockConnector({ chainPlatform: "evm", id: "rabby" });
      const { store } = createTestStore({
        createConnector: vi.fn((id) => (id === "metamask" ? meta : rabby)),
      });

      await store.getState().connectWallet("metamask");
      await store.getState().connectWallet("rabby");
      // Default: most-recently-connected wins
      expect(store.getState().selection.get("evm")).toBe("rabby");

      store.getState().setSelection("evm", "metamask");
      expect(store.getState().selection.get("evm")).toBe("metamask");
    });

    it("clears selection when given null", async () => {
      const connector = createMockConnector();
      const { store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });
      await store.getState().connectWallet("test");
      expect(store.getState().selection.has("evm")).toBe(true);

      store.getState().setSelection("evm", null);
      expect(store.getState().selection.has("evm")).toBe(false);
    });
  });

  describe("updateWalletAccount", () => {
    it("updates the account for a connector in the pool", async () => {
      const connector = createMockConnector({ id: "metamask" });
      const { store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });

      await store.getState().connectWallet("metamask");

      const newAccount = createMockAccount({
        chain: createMockChain({ id: "eip155:42161" }),
        walletAddress: "0xNEW",
      });
      store.getState().updateWalletAccount("metamask", newAccount);

      expect(store.getState().pool.get("metamask")?.account.walletAddress).toBe("0xNEW");
    });

    it("skips update when address and chain unchanged", async () => {
      const account = createMockAccount();
      const connector = createMockConnector({
        getAccount: vi.fn().mockResolvedValue(account),
      });
      const { store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });

      await store.getState().connectWallet("test");
      const poolBefore = store.getState().pool;

      store.getState().updateWalletAccount("test", { ...account });
      expect(store.getState().pool).toBe(poolBefore);
    });

    it("is a no-op for unknown connectorId", () => {
      const { store } = createTestStore();
      store.getState().updateWalletAccount("nope", createMockAccount());
      expect(store.getState().pool.size).toBe(0);
    });
  });

  describe("refreshWallet", () => {
    it("creates a new wallet object reference", async () => {
      const connector = createMockConnector();
      const { store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });

      await store.getState().connectWallet("test");
      const before = store.getState().pool.get("test");

      store.getState().refreshWallet("test");
      const after = store.getState().pool.get("test");

      expect(before).not.toBe(after);
      expect(before?.account).toEqual(after?.account);
    });

    it("is a no-op for unknown connectorId", () => {
      const { store } = createTestStore();
      const poolBefore = store.getState().pool;
      store.getState().refreshWallet("nope");
      expect(store.getState().pool).toBe(poolBefore);
    });
  });

  describe("reset", () => {
    it("clears pool, selection, active, and storage", async () => {
      const connector = createMockConnector();
      const { storage, store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });
      const clearAllSpy = vi.spyOn(storage, "clearAll");

      await store.getState().connectWallet("test");
      await hydrateStore(store);
      store.getState().reset();

      const state = store.getState();
      expect(state.pool.size).toBe(0);
      expect(state.selection.size).toBe(0);
      expect(state.activeConnectorId).toBeNull();
      expect(state.connectionStatus).toBe("idle");
      expect(clearAllSpy).toHaveBeenCalled();
      expect(connector.disconnect).toHaveBeenCalled();
    });

    it("calls onReset", async () => {
      const onReset = vi.fn();
      const connector = createMockConnector();
      const { store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
        onReset,
      });
      await store.getState().connectWallet("test");
      await hydrateStore(store);
      store.getState().reset();
      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it("sets disconnect-intent flag", async () => {
      const connector = createMockConnector();
      const { storage, store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });
      await store.getState().connectWallet("test");
      await hydrateStore(store);
      store.getState().reset();

      expect(store.getState().isUserDisconnected).toBe(true);
      expect(await storage.isUserDisconnected()).toBe(true);
    });

    it("is a no-op before hydration", async () => {
      const connector = createMockConnector();
      const { store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });
      await store.getState().connectWallet("test");
      store.getState().reset();
      expect(store.getState().pool.size).toBe(1);
    });
  });

  describe("_hydrateWallets", () => {
    it("restores pool, selection, and active from storage", async () => {
      const account = createMockAccount();
      const connector = createMockConnector({
        getAccount: vi.fn().mockResolvedValue(account),
        id: "metamask",
      });
      const { storage, store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });

      const wallets = new Map([["metamask", { account, connector }]]);
      await storage.setPool(wallets);
      await storage.setSelection(new Map([["evm", "metamask"]]));
      await storage.setActiveConnectorId("metamask");

      await hydrateStore(store);

      const state = store.getState();
      expect(state.isHydrated).toBe(true);
      expect(state.pool.size).toBe(1);
      expect(state.pool.get("metamask")?.connector.id).toBe("metamask");
      expect(state.selection.get("evm")).toBe("metamask");
      expect(state.activeConnectorId).toBe("metamask");
    });

    it("syncs isUserDisconnected from storage", async () => {
      const { storage, store } = createTestStore();
      await storage.markUserDisconnected(true);
      await hydrateStore(store);
      expect(store.getState().isUserDisconnected).toBe(true);
    });

    it("drops connectors that fail to connect during hydration", async () => {
      const connector = createMockConnector({
        connect: vi.fn().mockRejectedValue(new Error("connection failed")),
        id: "broken",
      });
      const { storage, store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });
      await storage.setPool(new Map([["broken", { account: createMockAccount(), connector }]]));
      const removeSpy = vi.spyOn(storage, "removePoolEntry");

      await hydrateStore(store);

      expect(store.getState().pool.size).toBe(0);
      expect(store.getState().isHydrated).toBe(true);
      expect(removeSpy).toHaveBeenCalledWith("broken");
    });

    it("drops stale selection entries pointing at missing connectors", async () => {
      const connector = createMockConnector({ id: "metamask" });
      const { storage, store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });
      // Store has a selection pointing at an id that's not in the pool.
      await storage.setSelection(new Map([["evm", "deleted-connector"]]));

      await hydrateStore(store);

      expect(store.getState().selection.has("evm")).toBe(false);
    });

    it("falls back to first wallet for active when stored active is missing", async () => {
      const connector = createMockConnector({ id: "metamask" });
      const { storage, store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });
      await storage.setPool(new Map([["metamask", { account: createMockAccount(), connector }]]));
      await storage.setActiveConnectorId("ghost");

      await hydrateStore(store);

      expect(store.getState().activeConnectorId).toBe("metamask");
    });

    it("uses stored account as fallback when getAccount returns null", async () => {
      const storedAccount = createMockAccount({ walletAddress: "0xSTORED" });
      const connector = createMockConnector({
        getAccount: vi.fn().mockResolvedValue(null),
        id: "metamask",
      });
      const { storage, store } = createTestStore({
        createConnector: vi.fn().mockReturnValue(connector),
      });
      await storage.setPool(new Map([["metamask", { account: storedAccount, connector }]]));

      await hydrateStore(store);
      expect(store.getState().pool.get("metamask")?.account.walletAddress).toBe("0xSTORED");
    });
  });

  describe("connection status", () => {
    it("setConnectionError sets error status", () => {
      const { store } = createTestStore();
      store.getState().setConnectionError("something broke");
      expect(store.getState().connectionStatus).toBe("error");
      expect(store.getState().connectionError).toBe("something broke");
    });

    it("setConnectionError with null returns to idle", () => {
      const { store } = createTestStore();
      store.getState().setConnectionError("error");
      store.getState().setConnectionError(null);
      expect(store.getState().connectionStatus).toBe("idle");
      expect(store.getState().connectionError).toBeNull();
    });

    it("resetConnectionStatus clears connecting + error", () => {
      const { store } = createTestStore();
      store.getState().setConnectionStatus("connecting", "metamask");
      store.getState().resetConnectionStatus();
      expect(store.getState().connectionStatus).toBe("idle");
      expect(store.getState().connectingConnectorId).toBeNull();
      expect(store.getState().connectionError).toBeNull();
    });
  });
});
