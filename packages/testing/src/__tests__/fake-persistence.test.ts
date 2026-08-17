import type { ConnectedWallet } from "@usebutr/core";
import { describe, expect, it } from "vitest";

import { createFakeAdapter } from "../fake-adapter";
import { createFakePersistence } from "../fake-persistence";

const buildAccount = (address: string) => ({
  chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155" as const, reference: "1" },
  id: `eip155:1:${address}`,
  walletAddress: address,
});

const buildWallet = (id: string, overrides: { name?: string } = {}): ConnectedWallet => {
  const account = buildAccount("0xfeed");
  return {
    account,
    accounts: [account],
    connector: { ...createFakeAdapter({ id }), ...overrides },
  };
};

describe("createFakePersistence", () => {
  it("starts empty when no seed is provided", async () => {
    const p = createFakePersistence();
    await expect(p.getPool()).resolves.toEqual({});
    await expect(p.getSelection()).resolves.toEqual({});
    await expect(p.getActiveConnectorId()).resolves.toBeNull();
    await expect(p.isUserDisconnected()).resolves.toBe(false);
  });

  it("honours the seed for pool, selection, activeConnectorId, and userDisconnected", async () => {
    const seedAccount = buildAccount("0x123");
    const p = createFakePersistence({
      activeConnectorId: "fake",
      pool: {
        fake: {
          account: seedAccount,
          accounts: [seedAccount],
          chainPlatform: "evm",
          connectorId: "fake",
          name: "Fake",
        },
      },
      selection: { evm: "fake" },
      userDisconnected: true,
    });
    await expect(p.getPool()).resolves.toHaveProperty("fake");
    await expect(p.getSelection()).resolves.toEqual({ evm: "fake" });
    await expect(p.getActiveConnectorId()).resolves.toBe("fake");
    await expect(p.isUserDisconnected()).resolves.toBe(true);
  });

  it("setPool serialises a Map<connectorId, ConnectedWallet> into the storage shape", async () => {
    const p = createFakePersistence();
    const pool = new Map<string, ConnectedWallet>([
      ["a", buildWallet("a")],
      ["b", buildWallet("b")],
    ]);
    await p.setPool(pool);
    const stored = await p.getPool();
    expect(Object.keys(stored).toSorted()).toEqual(["a", "b"]);
    expect(stored.a?.connectorId).toBe("a");
    expect(stored.b?.chainPlatform).toBe("evm");
  });

  it("setSelection serialises a Map<platform, connectorId> into the storage shape", async () => {
    const p = createFakePersistence();
    await p.setSelection(new Map([["evm", "fake"]]));
    await expect(p.getSelection()).resolves.toEqual({ evm: "fake" });
  });

  it("setActiveConnectorId round-trips through getActiveConnectorId", async () => {
    const p = createFakePersistence();
    await p.setActiveConnectorId("hello");
    await expect(p.getActiveConnectorId()).resolves.toBe("hello");
    await p.setActiveConnectorId(null);
    await expect(p.getActiveConnectorId()).resolves.toBeNull();
  });

  it("markUserDisconnected flips the bit observable via isUserDisconnected", async () => {
    const p = createFakePersistence();
    await p.markUserDisconnected(true);
    await expect(p.isUserDisconnected()).resolves.toBe(true);
    await p.markUserDisconnected(false);
    await expect(p.isUserDisconnected()).resolves.toBe(false);
  });

  it("removePoolEntry removes the named entry while leaving others intact", async () => {
    const p = createFakePersistence();
    await p.setPool(
      new Map<string, ConnectedWallet>([
        ["a", buildWallet("a")],
        ["b", buildWallet("b")],
      ]),
    );
    await p.removePoolEntry("a");
    const stored = await p.getPool();
    expect(stored.a).toBeUndefined();
    expect(stored.b).toBeDefined();
  });

  it("clearPool removes all entries from the pool", async () => {
    const p = createFakePersistence();
    await p.setPool(new Map([["a", buildWallet("a")]]));
    await p.clearPool();
    await expect(p.getPool()).resolves.toEqual({});
  });

  // `clearAll` deliberately leaves the disconnect flag alone: it lives in the
  // session driver so a reset keeps auto-connect suppressed for the rest of
  // the session. `reset()` writes the flag and calls `clearAll` as two
  // unawaited operations, so a fake that cleared it here made the outcome
  // order-dependent and let a remount silently auto-reconnect.
  it("clearAll resets pool, selection and activeConnectorId but keeps userDisconnected", async () => {
    const p = createFakePersistence({
      activeConnectorId: "a",
      pool: {
        a: {
          account: buildAccount("0xaa"),
          accounts: [buildAccount("0xaa")],
          chainPlatform: "evm",
          connectorId: "a",
          name: "Wallet A",
        },
      },
      selection: { evm: "a" },
      userDisconnected: true,
    });
    await p.clearAll();
    await expect(p.getPool()).resolves.toEqual({});
    await expect(p.getSelection()).resolves.toEqual({});
    await expect(p.getActiveConnectorId()).resolves.toBeNull();
    await expect(p.isUserDisconnected()).resolves.toBe(true);
  });

  it("setPool upserts rather than replacing, matching WalletStorage", async () => {
    const p = createFakePersistence({
      pool: {
        a: {
          account: buildAccount("0xaa"),
          accounts: [buildAccount("0xaa")],
          chainPlatform: "evm",
          connectorId: "a",
          name: "Wallet A",
        },
      },
    });

    await p.setPool(new Map([["b", buildWallet("b")]]));

    const ids = Object.keys(await p.getPool());
    expect(ids.toSorted()).toEqual(["a", "b"]);
  });

  it("drops an entry that fails validation instead of round-tripping it", async () => {
    const p = createFakePersistence();

    await p.setPool(new Map([["c", buildWallet("c", { name: "" })]]));

    expect(await p.getPool()).toEqual({});
  });
});
