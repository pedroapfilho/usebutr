import { createWalletManager, fromAdapters } from "@usebutr/core";
import { describe, expect, it } from "vitest";

import { createFakeAdapter } from "../fake-adapter";
import { createFakeConnectedWallet } from "../fake-connected-wallet";
import { createFakePersistence } from "../fake-persistence";

const flush = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

describe("createFakePersistence", () => {
  it("loads an empty state by default", async () => {
    expect(await createFakePersistence().load()).toEqual({
      activeConnectorId: null,
      isUserDisconnected: false,
      pool: {},
      selection: {},
    });
  });

  it("loads the seeded wallets as a previous session saved them", async () => {
    const metamask = createFakeConnectedWallet({ id: "metamask", name: "MetaMask" });
    const rabby = createFakeConnectedWallet({ id: "rabby" });
    const persistence = createFakePersistence({
      active: rabby,
      isUserDisconnected: true,
      wallets: [metamask, rabby],
    });

    const loaded = await persistence.load();
    expect(Object.keys(loaded.pool)).toEqual(["metamask", "rabby"]);
    expect(loaded.pool.metamask).toMatchObject({
      account: metamask.account,
      chainPlatform: "evm",
      connectorId: "metamask",
      name: "MetaMask",
    });
    expect(loaded.activeConnectorId).toBe("rabby");
    expect(loaded.isUserDisconnected).toBe(true);
  });

  it("records every save and loads the latest one", async () => {
    const persistence = createFakePersistence();
    const state = {
      activeConnectorId: null,
      isUserDisconnected: true,
      pool: {},
      selection: {},
    };

    await persistence.save(state);

    expect(persistence.saves).toEqual([state]);
    expect(await persistence.load()).toEqual(state);
  });

  it("restores a seeded connection through a manager and records what it saves", async () => {
    const wallet = createFakeConnectedWallet({ id: "metamask" });
    const persistence = createFakePersistence({ wallets: [wallet] });
    const manager = createWalletManager({
      sources: [fromAdapters([wallet.connector, createFakeAdapter({ id: "rabby" })])],
      storage: persistence,
    });

    manager.start();
    await flush();
    expect(manager.getState().activeConnectorId).toBe("metamask");
    await manager.connect("rabby");
    await flush();

    expect(manager.getState().pool.get("metamask")?.connector).toBe(wallet.connector);
    expect(Object.keys(persistence.saves.at(-1)?.pool ?? {})).toEqual(["metamask", "rabby"]);
    expect(persistence.saves.at(-1)?.activeConnectorId).toBe("rabby");
  });
});
