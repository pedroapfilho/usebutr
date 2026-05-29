import { describe, expect, it } from "vitest";

import {
  createAsyncMockStorageDriver,
  createMockAccount,
  createMockConnector,
  createMockStorageDriver,
  createMockStoragePair,
} from "../../__tests__/helpers";
import type { ChainPlatform, ConnectedWallet } from "../../types";
import type { StorageDriver } from "../persistence";
import { WalletStorage } from "../wallet-storage";

const createStorage = (overrides?: { persistent?: StorageDriver; session?: StorageDriver }) => {
  const persistent = overrides?.persistent ?? createMockStorageDriver();
  const session = overrides?.session ?? createMockStorageDriver();
  return {
    persistent,
    session,
    storage: new WalletStorage({ keyPrefix: "test", persistent, session }),
  };
};

describe("WalletStorage", () => {
  describe("getPool", () => {
    it("returns empty when nothing stored", async () => {
      const { storage } = createStorage();
      expect(await storage.getPool()).toEqual({});
    });

    it("returns valid pool entries with accounts list", async () => {
      const persistent = createMockStorageDriver();
      const account = {
        chain: {
          id: "eip155:1",
          name: "Ethereum",
          namespace: "eip155",
          reference: "1",
        },
        id: "acc-1",
        walletAddress: "0x123",
      };
      const data = {
        metamask: {
          account,
          accounts: [account],
          chainPlatform: "evm",
          connectorId: "metamask",
          name: "MetaMask",
        },
      };
      await persistent.setItem("test-pool", JSON.stringify(data));
      const { storage } = createStorage({ persistent });

      expect(await storage.getPool()).toEqual(data);
    });

    it("drops entries missing the `accounts` field", async () => {
      const persistent = createMockStorageDriver();
      const account = {
        chain: {
          id: "eip155:1",
          name: "Ethereum",
          namespace: "eip155",
          reference: "1",
        },
        id: "acc-1",
        walletAddress: "0x123",
      };
      // Entry without `accounts` is invalid by the current schema and
      // gets warned + dropped on read.
      const invalid = {
        metamask: {
          account,
          chainPlatform: "evm",
          connectorId: "metamask",
          name: "MetaMask",
        },
      };
      await persistent.setItem("test-pool", JSON.stringify(invalid));
      const { storage } = createStorage({ persistent });

      const result = await storage.getPool();
      expect(result.metamask).toBeUndefined();
    });

    it("drops entries whose connectorId does not match the key", async () => {
      const persistent = createMockStorageDriver();
      const data = {
        metamask: {
          account: {
            chain: {
              id: "eip155:1",
              name: "Ethereum",
              namespace: "eip155",
              reference: "1",
            },
            id: "acc-1",
            walletAddress: "0x123",
          },
          chainPlatform: "evm",
          connectorId: "different-id",
          name: "MetaMask",
        },
      };
      await persistent.setItem("test-pool", JSON.stringify(data));
      const { storage } = createStorage({ persistent });

      expect(await storage.getPool()).toEqual({});
    });

    it("drops entries with invalid chainPlatform", async () => {
      const persistent = createMockStorageDriver();
      const data = {
        keplr: {
          account: {
            chain: {
              id: "cosmos:1",
              name: "Cosmos",
              namespace: "cosmos",
              reference: "1",
            },
            id: "acc-1",
            walletAddress: "cosmos1abc",
          },
          chainPlatform: "cosmos",
          connectorId: "keplr",
          name: "Keplr",
        },
      };
      await persistent.setItem("test-pool", JSON.stringify(data));
      const { storage } = createStorage({ persistent });

      expect(await storage.getPool()).toEqual({});
    });

    it("returns empty and clears on malformed JSON", async () => {
      const persistent = createMockStorageDriver();
      await persistent.setItem("test-pool", "{invalid json");
      const { storage } = createStorage({ persistent });

      expect(await storage.getPool()).toEqual({});
      expect(persistent.removeItem).toHaveBeenCalledWith("test-pool");
    });
  });

  describe("setPool", () => {
    it("serializes a pool keyed by connectorId", async () => {
      const { persistent, storage } = createStorage();
      const account = createMockAccount();
      const connector = createMockConnector({ chainPlatform: "evm", id: "metamask" });
      const pool = new Map<string, ConnectedWallet>([
        ["metamask", { account, accounts: [account], connector }],
      ]);

      await storage.setPool(pool);

      const stored = JSON.parse((await persistent.getItem("test-pool")) as string);
      expect(stored.metamask.connectorId).toBe("metamask");
      expect(stored.metamask.chainPlatform).toBe("evm");
      expect(stored.metamask.account.walletAddress).toBe(account.walletAddress);
    });

    it("handles empty pool", async () => {
      const { persistent, storage } = createStorage();
      await storage.setPool(new Map());

      const stored = JSON.parse((await persistent.getItem("test-pool")) as string);
      expect(stored).toEqual({});
    });

    it("refuses to persist a structurally invalid entry (write-side validation)", async () => {
      const { persistent, storage } = createStorage();
      const account = createMockAccount();
      const connector = createMockConnector({ chainPlatform: "evm", id: "metamask" });
      // Force an invalid entry by mutating the connector's chainPlatform
      // out of band — simulates a programming bug inside butr's reducer
      // that produces a corrupted ConnectedWallet.
      const brokenConnector = {
        ...connector,
        chainPlatform: "cosmos" as unknown as "evm",
      };
      const pool = new Map<string, ConnectedWallet>([
        ["metamask", { account, accounts: [account], connector: brokenConnector }],
      ]);

      await storage.setPool(pool);

      // Validator catches the invalid platform; nothing is persisted.
      expect(await persistent.getItem("test-pool")).toBeNull();
    });
  });

  describe("removePoolEntry", () => {
    it("removes a single connectorId from the pool", async () => {
      const persistent = createMockStorageDriver();
      const evmAccount = {
        chain: {
          id: "eip155:1",
          name: "Ethereum",
          namespace: "eip155",
          reference: "1",
        },
        id: "acc-1",
        walletAddress: "0x123",
      };
      const svmAccount = {
        chain: {
          id: "solana:mainnet",
          name: "Solana",
          namespace: "solana",
          reference: "mainnet",
        },
        id: "acc-2",
        walletAddress: "So1ana",
      };
      const data = {
        metamask: {
          account: evmAccount,
          accounts: [evmAccount],
          chainPlatform: "evm",
          connectorId: "metamask",
          name: "MetaMask",
        },
        phantom: {
          account: svmAccount,
          accounts: [svmAccount],
          chainPlatform: "svm",
          connectorId: "phantom",
          name: "Phantom",
        },
      };
      await persistent.setItem("test-pool", JSON.stringify(data));
      const { storage } = createStorage({ persistent });

      await storage.removePoolEntry("metamask");

      const stored = JSON.parse((await persistent.getItem("test-pool")) as string);
      expect(stored.metamask).toBeUndefined();
      expect(stored.phantom).toBeDefined();
    });
  });

  describe("getSelection / setSelection", () => {
    it("returns empty when nothing stored", async () => {
      const { storage } = createStorage();
      expect(await storage.getSelection()).toEqual({});
    });

    it("round-trips a selection map", async () => {
      const { storage } = createStorage();
      await storage.setSelection(
        new Map<ChainPlatform, string>([
          ["evm", "metamask"],
          ["svm", "phantom"],
        ]),
      );
      const result = await storage.getSelection();
      expect(result.evm).toBe("metamask");
      expect(result.svm).toBe("phantom");
    });

    it("drops invalid platform keys", async () => {
      const persistent = createMockStorageDriver();
      await persistent.setItem(
        "test-selection",
        JSON.stringify({ cosmos: "keplr", evm: "metamask" }),
      );
      const { storage } = createStorage({ persistent });

      const result = await storage.getSelection();
      expect(result.evm).toBe("metamask");
      expect((result as Record<string, unknown>).cosmos).toBeUndefined();
    });
  });

  describe("getActiveConnectorId / setActiveConnectorId", () => {
    it("returns null when nothing stored", async () => {
      const { storage } = createStorage();
      expect(await storage.getActiveConnectorId()).toBeNull();
    });

    it("round-trips an active connector id", async () => {
      const { storage } = createStorage();
      await storage.setActiveConnectorId("metamask");
      expect(await storage.getActiveConnectorId()).toBe("metamask");
    });

    it("clears stored value on null", async () => {
      const { persistent, storage } = createStorage();
      await storage.setActiveConnectorId("metamask");
      await storage.setActiveConnectorId(null);
      expect(await storage.getActiveConnectorId()).toBeNull();
      expect(persistent.removeItem).toHaveBeenCalledWith("test-active");
    });
  });

  describe("clearAll", () => {
    it("removes pool, selection, and active keys", async () => {
      const { persistent, storage } = createStorage();
      await storage.setPool(new Map());
      await storage.setSelection(new Map([["evm", "metamask"]]));
      await storage.setActiveConnectorId("metamask");

      await storage.clearAll();

      expect(await persistent.getItem("test-pool")).toBeNull();
      expect(await persistent.getItem("test-selection")).toBeNull();
      expect(await persistent.getItem("test-active")).toBeNull();
    });
  });

  describe("isUserDisconnected / markUserDisconnected", () => {
    it("returns false when nothing set", async () => {
      const { storage } = createStorage();
      expect(await storage.isUserDisconnected()).toBe(false);
    });

    it("sets and retrieves disconnect intent via session driver", async () => {
      const { session, storage } = createStorage();
      await storage.markUserDisconnected(true);

      expect(await storage.isUserDisconnected()).toBe(true);
      expect(session.setItem).toHaveBeenCalledWith("test-user-disconnected", "true");
    });

    it("clears disconnect intent", async () => {
      const { session, storage } = createStorage();
      await storage.markUserDisconnected(true);
      await storage.markUserDisconnected(false);

      expect(await storage.isUserDisconnected()).toBe(false);
      expect(session.removeItem).toHaveBeenCalledWith("test-user-disconnected");
    });

    it("writes disconnect intent only to session, never to persistent", async () => {
      const pair = createMockStoragePair();
      const storage = new WalletStorage({ keyPrefix: "test", ...pair });

      await storage.markUserDisconnected(true);

      expect(pair.session.setItem).toHaveBeenCalledWith("test-user-disconnected", "true");
      expect(pair.persistent.setItem).not.toHaveBeenCalledWith("test-user-disconnected", "true");
    });
  });

  describe("async driver compatibility", () => {
    it("works end-to-end with an async-returning driver", async () => {
      const persistent = createAsyncMockStorageDriver();
      const session = createAsyncMockStorageDriver();
      const storage = new WalletStorage({
        keyPrefix: "async",
        persistent,
        session,
      });

      await storage.markUserDisconnected(true);
      expect(await storage.isUserDisconnected()).toBe(true);

      const account = createMockAccount();
      const connector = createMockConnector({ id: "metamask" });
      const pool = new Map<string, ConnectedWallet>([
        ["metamask", { account, accounts: [account], connector }],
      ]);
      await storage.setPool(pool);
      await storage.setSelection(new Map([["evm", "metamask"]]));
      await storage.setActiveConnectorId("metamask");

      const restored = await storage.getPool();
      expect(restored.metamask?.connectorId).toBe("metamask");
      const restoredSelection = await storage.getSelection();
      expect(restoredSelection.evm).toBe("metamask");
      expect(await storage.getActiveConnectorId()).toBe("metamask");
    });
  });
});
