import { afterEach, describe, expect, it, vi } from "vitest";

import { evmAdapter, walletOf } from "../../__tests__/helpers";
import { createCookieWalletStorage } from "../cookie-wallet-storage";
import { toStoredPoolEntry } from "../wallet-state-codec";

const metamask = toStoredPoolEntry(walletOf(evmAdapter("metamask")));

const poolCookie = JSON.stringify({ metamask });
const selectionCookie = JSON.stringify({ evm: "metamask" });

const snapshot = {
  activeConnectorId: "metamask",
  pool: { metamask },
  selection: { evm: "metamask" },
};

/** A cookie jar that honours `Max-Age=0` and keeps one value per name. */
const stubDocument = () => {
  const jar = new Map<string, string>();
  vi.stubGlobal("document", {
    get cookie() {
      return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
    },
    set cookie(value: string) {
      const [head = ""] = value.split(";");
      const eq = head.indexOf("=");
      const name = head.slice(0, eq);
      if (value.includes("Max-Age=0")) {
        jar.delete(name);
      } else {
        jar.set(name, head.slice(eq + 1));
      }
    },
  });
  return jar;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("createCookieWalletStorage", () => {
  it("reads on the server what the client saved", async () => {
    const jar = stubDocument();
    const storage = createCookieWalletStorage({ keyPrefix: "app" });

    await storage.save({ ...snapshot, isUserDisconnected: true });

    const cookies = [...jar].map(([name, value]) => ({ name, value: decodeURIComponent(value) }));
    expect(cookies.map(({ name }) => name).toSorted()).toEqual([
      "app-active",
      "app-pool",
      "app-selection",
    ]);
    expect(storage.readInitialState(cookies)).toEqual(snapshot);
    expect(await storage.load()).toEqual({ ...snapshot, isUserDisconnected: true });
  });

  it("touches no browser global when created", () => {
    vi.stubGlobal("document", undefined);
    const storage = createCookieWalletStorage();
    expect(storage.readInitialState({})).toEqual({
      activeConnectorId: null,
      pool: {},
      selection: {},
    });
  });

  it.each([
    [
      "a name → value record",
      { "butr-active": "metamask", "butr-pool": poolCookie, "butr-selection": selectionCookie },
    ],
    [
      "{ name, value } pairs",
      [
        { name: "butr-active", value: "metamask" },
        { name: "butr-pool", value: poolCookie },
        { name: "butr-selection", value: selectionCookie },
      ],
    ],
    [
      "[name, value] tuples",
      new Map([
        ["butr-active", "metamask"],
        ["butr-pool", poolCookie],
        ["butr-selection", selectionCookie],
      ]),
    ],
  ])("reads the initial state from %s", (_label, cookies) => {
    expect(createCookieWalletStorage().readInitialState(cookies)).toEqual(snapshot);
  });

  it("reads only cookies under its own prefix", () => {
    const storage = createCookieWalletStorage({ keyPrefix: "app" });
    expect(storage.readInitialState({ "butr-pool": poolCookie }).pool).toEqual({});
    expect(storage.readInitialState({ "app-pool": poolCookie }).pool).toEqual({ metamask });
  });

  it("drops a corrupt cookie instead of throwing", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(createCookieWalletStorage().readInitialState({ "butr-pool": "not json" }).pool).toEqual(
      {},
    );
  });
});
