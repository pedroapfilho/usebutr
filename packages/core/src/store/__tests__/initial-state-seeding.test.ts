import { describe, expect, it } from "vitest";

import { createMockConfig, createMockConnector } from "../../__tests__/helpers";
import { createMemoryStorageDriver, WalletStorage } from "../../storage";
import type { StoredPoolEntry } from "../../storage/persistence";
import type { WalletSnapshot } from "../../storage/snapshot";
import { isShadowAdapter, ShadowConnectorError } from "../shadow-adapter";
import { createWalletStore } from "../wallet-store";

const evmEntry = (overrides: Partial<StoredPoolEntry> = {}): StoredPoolEntry => ({
  account: {
    chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" },
    id: "acc-1",
    walletAddress: "0xabc",
  },
  accounts: [
    {
      chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" },
      id: "acc-1",
      walletAddress: "0xabc",
    },
  ],
  chainPlatform: "evm",
  connectorId: "metamask",
  icon: "data:image/png;base64,XX",
  name: "MetaMask",
  ...overrides,
});

const baseSnapshot: WalletSnapshot = {
  activeConnectorId: "metamask",
  pool: { metamask: evmEntry() },
  selection: { evm: "metamask" },
};

describe("createWalletStore — initialState seeding", () => {
  it("synchronously populates pool, selection, and active from the snapshot", () => {
    const store = createWalletStore(createMockConfig({ initialState: baseSnapshot }));
    const state = store.getState();
    expect(state.pool.size).toBe(1);
    expect(state.activeConnectorId).toBe("metamask");
    expect(state.selection.get("evm")).toBe("metamask");
    const wallet = state.pool.get("metamask");
    expect(wallet?.account.walletAddress).toBe("0xabc");
    expect(wallet?.connector.id).toBe("metamask");
    expect(wallet?.connector.name).toBe("MetaMask");
  });

  it("flips isHydrated true at construction (no async wait)", () => {
    const store = createWalletStore(createMockConfig({ initialState: baseSnapshot }));
    expect(store.getState().isHydrated).toBe(true);
  });

  it("populates reconnectingIds with every seeded connector id", () => {
    const snapshot: WalletSnapshot = {
      activeConnectorId: "metamask",
      pool: {
        metamask: evmEntry(),
        phantom: evmEntry({
          chainPlatform: "svm",
          connectorId: "phantom",
          name: "Phantom",
        }),
      },
      selection: { evm: "metamask", svm: "phantom" },
    };
    const store = createWalletStore(createMockConfig({ initialState: snapshot }));
    const ids = [...store.getState().reconnectingIds].toSorted();
    expect(ids).toEqual(["metamask", "phantom"]);
  });

  it("seeded pool entries carry shadow connectors (capabilities all false)", () => {
    const store = createWalletStore(createMockConfig({ initialState: baseSnapshot }));
    const wallet = store.getState().pool.get("metamask");
    if (!wallet) {
      throw new Error("expected seeded pool entry");
    }
    expect(isShadowAdapter(wallet.connector)).toBe(true);
    expect(wallet.connector.capabilities.signMessage).toBe(false);
    expect(wallet.connector.capabilities.switchChain).toBe(false);
  });

  it("shadow connector methods reject with ShadowConnectorError when called", async () => {
    const store = createWalletStore(createMockConfig({ initialState: baseSnapshot }));
    const wallet = store.getState().pool.get("metamask");
    if (!wallet) {
      throw new Error("expected seeded pool entry");
    }
    await expect(wallet.connector.signMessage(new Uint8Array())).rejects.toBeInstanceOf(
      ShadowConnectorError,
    );
  });

  it("starts with empty pool and isHydrated=false when initialState is omitted", () => {
    const store = createWalletStore(createMockConfig());
    const state = store.getState();
    expect(state.pool.size).toBe(0);
    expect(state.isHydrated).toBe(false);
    expect(state.reconnectingIds.size).toBe(0);
  });

  it("drops selection entries pointing at connectors not in the seeded pool", () => {
    const snapshot: WalletSnapshot = {
      activeConnectorId: "metamask",
      pool: { metamask: evmEntry() },
      selection: { evm: "metamask", svm: "phantom" },
    };
    const store = createWalletStore(createMockConfig({ initialState: snapshot }));
    expect(store.getState().selection.get("svm")).toBeUndefined();
    expect(store.getState().selection.get("evm")).toBe("metamask");
  });

  it("falls back to first pool member when active id isn't present", () => {
    const snapshot: WalletSnapshot = {
      activeConnectorId: "phantom",
      pool: { metamask: evmEntry() },
      selection: { evm: "metamask" },
    };
    const store = createWalletStore(createMockConfig({ initialState: snapshot }));
    expect(store.getState().activeConnectorId).toBe("metamask");
  });
});

describe("reducer — reconnectingIds lifecycle", () => {
  it("clears reconnectingIds when the late-restore path fires", () => {
    const store = createWalletStore(createMockConfig({ initialState: baseSnapshot }));
    expect(store.getState().reconnectingIds.has("metamask")).toBe(true);

    store.setState((prev) => ({
      ...prev,
      reconnectingIds: new Set(),
    }));
    expect(store.getState().reconnectingIds.has("metamask")).toBe(false);
  });

  // A seeded entry whose reconnect fails is shadow-backed: every method
  // rejects. Left in the pool it would strand there, since nothing else clears
  // it, so consumers would read a permanently erroring wallet stuck in
  // "reconnecting" for the page's life. A locked wallet is the most common
  // cause of a dropped restore.
  it("evicts a seeded entry whose silent reconnect failed", async () => {
    const driver = createMemoryStorageDriver();
    const storage = new WalletStorage({ persistent: driver, session: driver });
    await driver.setItem("butr-pool", JSON.stringify(baseSnapshot.pool));
    await driver.setItem("butr-selection", JSON.stringify(baseSnapshot.selection));
    await driver.setItem("butr-active", "metamask");

    // The wallet is installed but locked, so the silent reconnect rejects.
    const locked = createMockConnector({ chainPlatform: "evm", id: "metamask" });
    locked.connect = () => Promise.reject(new Error("wallet is locked"));

    const store = createWalletStore(
      createMockConfig({
        createConnector: () => locked,
        initialState: baseSnapshot,
        storage,
      }),
    );
    expect(store.getState().pool.has("metamask")).toBe(true);
    expect(store.getState().reconnectingIds.has("metamask")).toBe(true);

    await store.getState().hydrateWallets();

    const state = store.getState();
    expect(state.pool.has("metamask")).toBe(false);
    expect(state.reconnectingIds.has("metamask")).toBe(false);
    expect(state.selection.get("evm")).toBeUndefined();
    expect(state.activeConnectorId).toBeNull();
  });
});
