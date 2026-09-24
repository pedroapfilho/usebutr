import type { StoredPoolEntry } from "@usebutr/core";
import { createWalletManager, fromAdapters } from "@usebutr/core";
import { describe, expect, it } from "vitest";

import { createFakeAdapter } from "../fake-adapter";
import { createFakeConnectedWallet } from "../fake-connected-wallet";
import { createFakePersistence } from "../fake-persistence";

const flush = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

const storedEntryOf = (wallet: ReturnType<typeof createFakeConnectedWallet>): StoredPoolEntry => ({
  account: wallet.account,
  accounts: wallet.accounts,
  chainPlatform: wallet.connector.chainPlatform,
  connectorId: wallet.connector.id,
  name: wallet.connector.name,
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

  it("loads the seed, validated as browser storage would", async () => {
    const entry = storedEntryOf(createFakeConnectedWallet({ id: "metamask" }));
    const persistence = createFakePersistence({
      activeConnectorId: "metamask",
      pool: { metamask: entry, rogue: { ...entry, connectorId: "not-rogue" } },
    });

    const loaded = await persistence.load();
    expect(loaded.pool).toEqual({ metamask: entry });
    expect(loaded.activeConnectorId).toBe("metamask");
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
    const persistence = createFakePersistence({ pool: { metamask: storedEntryOf(wallet) } });
    const manager = createWalletManager({
      sources: [fromAdapters([wallet.connector, createFakeAdapter({ id: "rabby" })])],
      storage: persistence,
    });

    manager.start();
    await flush();
    await manager.connect("rabby");
    await flush();

    expect(manager.getState().pool.get("metamask")?.connector).toBe(wallet.connector);
    expect(Object.keys(persistence.saves.at(-1)?.pool ?? {})).toEqual(["metamask", "rabby"]);
    expect(persistence.saves.at(-1)?.activeConnectorId).toBe("rabby");
  });
});
