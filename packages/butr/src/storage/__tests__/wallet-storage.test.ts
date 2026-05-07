import { describe, expect, it } from "vitest";
import { WalletStorage } from "../wallet-storage";
import type { StorageDriver } from "../persistence";
import {
  createAsyncMockStorageDriver,
  createMockAccount,
  createMockConnector,
  createMockStorageDriver,
  createMockStoragePair,
} from "../../__tests__/helpers";
import type { ChainPlatform, ConnectedWallet } from "../../types";

const createStorage = (overrides?: { persistent?: StorageDriver; session?: StorageDriver }) => {
  const persistent = overrides?.persistent ?? createMockStorageDriver();
  const session = overrides?.session ?? createMockStorageDriver();
  return {
    storage: new WalletStorage({ keyPrefix: "test", persistent, session }),
    persistent,
    session,
  };
};

describe("WalletStorage", () => {
  describe("getConnectedWallets", () => {
    it("returns empty object when nothing stored", async () => {
      const { storage } = createStorage();
      expect(await storage.getConnectedWallets()).toEqual({});
    });

    it("returns valid wallet data", async () => {
      const persistent = createMockStorageDriver();
      const data = {
        evm: {
          connectorId: "metamask",
          account: {
            walletAddress: "0x123",
            id: "acc-1",
            chain: {
              id: "eip155:1",
              namespace: "eip155",
              reference: "1",
              name: "Ethereum",
            },
          },
        },
      };
      await persistent.setItem("test-connected-wallets", JSON.stringify(data));
      const { storage } = createStorage({ persistent });

      expect(await storage.getConnectedWallets()).toEqual(data);
    });

    it("returns empty and clears when stored JSON is not an object", async () => {
      const persistent = createMockStorageDriver();
      await persistent.setItem("test-connected-wallets", JSON.stringify("s"));
      const { storage } = createStorage({ persistent });

      expect(await storage.getConnectedWallets()).toEqual({});
      expect(persistent.removeItem).toHaveBeenCalledWith("test-connected-wallets");
    });

    it("returns empty and clears when platform key is invalid", async () => {
      const persistent = createMockStorageDriver();
      const data = {
        cosmos: {
          connectorId: "keplr",
          account: {
            walletAddress: "cosmos1abc",
            id: "acc-1",
            chain: {
              id: "cosmos:1",
              namespace: "cosmos",
              reference: "1",
              name: "Cosmos",
            },
          },
        },
      };
      await persistent.setItem("test-connected-wallets", JSON.stringify(data));
      const { storage } = createStorage({ persistent });

      expect(await storage.getConnectedWallets()).toEqual({});
    });

    it("returns empty when wallet data missing connectorId", async () => {
      const persistent = createMockStorageDriver();
      const data = {
        evm: {
          account: {
            walletAddress: "0x123",
            id: "acc-1",
            chain: {
              id: "eip155:1",
              namespace: "eip155",
              reference: "1",
              name: "Ethereum",
            },
          },
        },
      };
      await persistent.setItem("test-connected-wallets", JSON.stringify(data));
      const { storage } = createStorage({ persistent });

      expect(await storage.getConnectedWallets()).toEqual({});
    });

    it("returns empty when account missing walletAddress", async () => {
      const persistent = createMockStorageDriver();
      const data = {
        evm: {
          connectorId: "metamask",
          account: {
            id: "acc-1",
            chain: {
              id: "eip155:1",
              namespace: "eip155",
              reference: "1",
              name: "Ethereum",
            },
          },
        },
      };
      await persistent.setItem("test-connected-wallets", JSON.stringify(data));
      const { storage } = createStorage({ persistent });

      expect(await storage.getConnectedWallets()).toEqual({});
    });

    it("returns empty when account missing chain", async () => {
      const persistent = createMockStorageDriver();
      const data = {
        evm: {
          connectorId: "metamask",
          account: { walletAddress: "0x123", id: "acc-1" },
        },
      };
      await persistent.setItem("test-connected-wallets", JSON.stringify(data));
      const { storage } = createStorage({ persistent });

      expect(await storage.getConnectedWallets()).toEqual({});
    });

    it("returns empty and clears on malformed JSON", async () => {
      const persistent = createMockStorageDriver();
      await persistent.setItem("test-connected-wallets", "{invalid json");
      const { storage } = createStorage({ persistent });

      expect(await storage.getConnectedWallets()).toEqual({});
      expect(persistent.removeItem).toHaveBeenCalledWith("test-connected-wallets");
    });
  });

  describe("setConnectedWallets", () => {
    it("serializes a Map of ConnectedWallet to JSON", async () => {
      const { storage, persistent } = createStorage();
      const account = createMockAccount();
      const connector = createMockConnector({ id: "metamask" });
      const wallets = new Map<ChainPlatform, ConnectedWallet>([["evm", { connector, account }]]);

      await storage.setConnectedWallets(wallets);

      const stored = JSON.parse((await persistent.getItem("test-connected-wallets")) as string);
      expect(stored.evm.connectorId).toBe("metamask");
      expect(stored.evm.account.walletAddress).toBe(account.walletAddress);
    });

    it("handles empty map", async () => {
      const { storage, persistent } = createStorage();
      await storage.setConnectedWallets(new Map());

      const stored = JSON.parse((await persistent.getItem("test-connected-wallets")) as string);
      expect(stored).toEqual({});
    });
  });

  describe("removeConnectedWallet", () => {
    it("removes specific platform from stored record", async () => {
      const persistent = createMockStorageDriver();
      const data = {
        evm: {
          connectorId: "metamask",
          account: {
            walletAddress: "0x123",
            id: "acc-1",
            chain: {
              id: "eip155:1",
              namespace: "eip155",
              reference: "1",
              name: "Ethereum",
            },
          },
        },
        svm: {
          connectorId: "phantom",
          account: {
            walletAddress: "So1ana",
            id: "acc-2",
            chain: {
              id: "solana:mainnet",
              namespace: "solana",
              reference: "mainnet",
              name: "Solana",
            },
          },
        },
      };
      await persistent.setItem("test-connected-wallets", JSON.stringify(data));
      const { storage } = createStorage({ persistent });

      await storage.removeConnectedWallet("evm");

      const stored = JSON.parse((await persistent.getItem("test-connected-wallets")) as string);
      expect(stored.evm).toBeUndefined();
      expect(stored.svm).toBeDefined();
    });

    it("is a no-op when platform not present", async () => {
      const persistent = createMockStorageDriver();
      await persistent.setItem("test-connected-wallets", JSON.stringify({}));
      const { storage } = createStorage({ persistent });

      await storage.removeConnectedWallet("move");

      const stored = JSON.parse((await persistent.getItem("test-connected-wallets")) as string);
      expect(stored).toEqual({});
    });
  });

  describe("clearAll", () => {
    it("removes both connected-wallets and wallet-mode keys", async () => {
      const { storage, persistent } = createStorage();
      await storage.setWalletMode("smart-wallet");
      await storage.setConnectedWallets(new Map());

      await storage.clearAll();

      expect(await persistent.getItem("test-connected-wallets")).toBeNull();
      expect(await persistent.getItem("test-wallet-mode")).toBeNull();
    });
  });

  describe("getWalletMode / setWalletMode", () => {
    it("returns 'none' when nothing stored", async () => {
      const { storage } = createStorage();
      expect(await storage.getWalletMode()).toBe("none");
    });

    it("returns the stored valid mode", async () => {
      const { storage } = createStorage();
      await storage.setWalletMode("smart-wallet");
      expect(await storage.getWalletMode()).toBe("smart-wallet");
    });

    it("returns 'none' and clears for invalid stored mode", async () => {
      const persistent = createMockStorageDriver();
      await persistent.setItem("test-wallet-mode", "invalid-mode");
      const { storage } = createStorage({ persistent });

      expect(await storage.getWalletMode()).toBe("none");
      expect(persistent.removeItem).toHaveBeenCalledWith("test-wallet-mode");
    });
  });

  describe("isUserDisconnected / markUserDisconnected", () => {
    it("returns false when nothing set", async () => {
      const { storage } = createStorage();
      expect(await storage.isUserDisconnected()).toBe(false);
    });

    it("sets and retrieves disconnect intent via session driver", async () => {
      const { storage, session } = createStorage();
      await storage.markUserDisconnected(true);

      expect(await storage.isUserDisconnected()).toBe(true);
      expect(session.setItem).toHaveBeenCalledWith("test-user-disconnected", "true");
    });

    it("clears disconnect intent", async () => {
      const { storage, session } = createStorage();
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

      await storage.setWalletMode("external-wallet");
      await storage.markUserDisconnected(true);

      expect(await storage.getWalletMode()).toBe("external-wallet");
      expect(await storage.isUserDisconnected()).toBe(true);

      const account = createMockAccount();
      const connector = createMockConnector({ id: "metamask" });
      const wallets = new Map<ChainPlatform, ConnectedWallet>([["evm", { connector, account }]]);
      await storage.setConnectedWallets(wallets);

      const restored = await storage.getConnectedWallets();
      expect(restored.evm?.connectorId).toBe("metamask");
    });
  });
});
