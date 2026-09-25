import { describe, expect, it } from "vitest";

import { ETHEREUM, evmAdapter, SOLANA, svmAdapter, walletOf } from "../../__tests__/helpers";
import { buildAccount, ConnectionError } from "../../types";
import type { WalletState } from "../reducer";
import { initialState, reconcile, reducer, stateFromSnapshot, toStoredEntry } from "../reducer";
import { createShadowAdapter } from "../shadow-adapter";

const metamask = walletOf(evmAdapter("metamask"));
const rabby = walletOf(evmAdapter("rabby"));
const phantom = walletOf(svmAdapter("phantom"));

const stateWith = (overrides: Partial<WalletState>): WalletState => ({
  ...initialState,
  ...overrides,
});

/** A consistent state holding `wallets`, first one active and selected. */
const connected = (...wallets: ReadonlyArray<typeof metamask>): WalletState => {
  const pool = new Map(wallets.map((wallet) => [wallet.connector.id, wallet]));
  return reconcile(stateWith({ isHydrated: true, pool }));
};

describe("reconcile", () => {
  it("returns the state itself when every invariant already holds", () => {
    const state = connected(metamask, phantom);
    expect(reconcile(state)).toBe(state);
    expect(reconcile(initialState)).toBe(initialState);
  });

  it("prunes reconnecting ids that are not in the pool", () => {
    const state = reconcile(stateWith({ reconnectingIds: new Set(["gone"]) }));
    expect(state.reconnectingIds.size).toBe(0);
  });

  it("drops dormant entries that are live, keeps those still reconnecting or absent", () => {
    const shadowEntry = toStoredEntry("rabby", rabby);
    const shadow = walletOf(createShadowAdapter(shadowEntry));
    const dormant = new Map([
      ["metamask", toStoredEntry("metamask", metamask)],
      ["rabby", shadowEntry],
      ["phantom", toStoredEntry("phantom", phantom)],
    ]);
    const state = reconcile(
      stateWith({
        dormant,
        pool: new Map([
          ["metamask", metamask],
          ["rabby", shadow],
        ]),
        reconnectingIds: new Set(["rabby"]),
      }),
    );
    expect([...state.dormant.keys()]).toEqual(["rabby", "phantom"]);
  });

  it("fills each pooled platform's selection with its first entry", () => {
    const state = connected(metamask, rabby, phantom);
    expect(state.selection).toEqual(
      new Map([
        ["evm", "metamask"],
        ["svm", "phantom"],
      ]),
    );
  });

  it("keeps a valid selection and drops one pointing outside the pool or platform", () => {
    const state = reconcile(
      stateWith({
        pool: new Map([
          ["metamask", metamask],
          ["rabby", rabby],
        ]),
        selection: new Map([
          ["evm", "rabby"],
          ["svm", "metamask"],
          ["sui", "gone"],
        ]),
      }),
    );
    expect(state.selection).toEqual(new Map([["evm", "rabby"]]));
  });

  it("falls back to the first pool entry for the active wallet, or null", () => {
    expect(reconcile(stateWith({ activeConnectorId: "gone" })).activeConnectorId).toBeNull();
    const state = reconcile(
      stateWith({ activeConnectorId: "gone", pool: new Map([["rabby", rabby]]) }),
    );
    expect(state.activeConnectorId).toBe("rabby");
  });

  it("keeps untouched collections by reference", () => {
    const state = connected(metamask, phantom);
    const next = reconcile({ ...state, activeConnectorId: "gone" });
    expect(next.activeConnectorId).toBe("metamask");
    expect(next.selection).toBe(state.selection);
    expect(next.dormant).toBe(state.dormant);
    expect(next.reconnectingIds).toBe(state.reconnectingIds);
  });
});

describe("reducer", () => {
  it("returns the same state for an event that changes nothing", () => {
    const state = connected(metamask, phantom);
    expect(reducer(state, { connectorId: "metamask", type: "ACTIVE_CHANGED" })).toBe(state);
    expect(
      reducer(state, { chainPlatform: "evm", connectorId: "metamask", type: "SELECTION_CHANGED" }),
    ).toBe(state);
    expect(reducer(state, { type: "STATUS_RESET" })).toBe(state);
    expect(reducer(state, { connectorId: "gone", type: "RESTORE_FAILED" })).toBe(state);
  });

  describe("ADAPTER_REGISTERED", () => {
    it("appends in announcement order and ignores a repeated id", () => {
      const first = evmAdapter("metamask");
      let state = reducer(initialState, { adapter: first, type: "ADAPTER_REGISTERED" });
      state = reducer(state, { adapter: svmAdapter("phantom"), type: "ADAPTER_REGISTERED" });
      const repeat = reducer(state, {
        adapter: evmAdapter("metamask"),
        type: "ADAPTER_REGISTERED",
      });
      expect(repeat).toBe(state);
      expect(state.adapters.map((adapter) => adapter.id)).toEqual(["metamask", "phantom"]);
      expect(state.adapters[0]).toBe(first);
    });
  });

  describe("STORAGE_LOADED", () => {
    it("parks stored entries as dormant and takes the stored disconnect intent", () => {
      const entry = toStoredEntry("rabby", rabby);
      const state = reducer(initialState, {
        entries: { missing: undefined, rabby: entry },
        isUserDisconnected: true,
        type: "STORAGE_LOADED",
      });
      expect(state.dormant).toEqual(new Map([["rabby", entry]]));
      expect(state.isUserDisconnected).toBe(true);
    });

    it("does not park an entry that is already live", () => {
      const state = reducer(connected(metamask), {
        entries: { metamask: toStoredEntry("metamask", metamask) },
        isUserDisconnected: false,
        type: "STORAGE_LOADED",
      });
      expect(state.dormant.size).toBe(0);
    });
  });

  describe("ENTRY_RESTORED", () => {
    it("moves a dormant entry into the pool", () => {
      const dormant = stateWith({ dormant: new Map([["rabby", toStoredEntry("rabby", rabby)]]) });
      const state = reducer(dormant, {
        connectorId: "rabby",
        entry: rabby,
        type: "ENTRY_RESTORED",
      });
      expect(state.pool.get("rabby")).toBe(rabby);
      expect(state.dormant.size).toBe(0);
      expect(state.activeConnectorId).toBe("rabby");
      expect(state.selection.get("evm")).toBe("rabby");
    });

    it("replaces a seeded shadow and clears its reconnecting flag", () => {
      const seeded = stateFromSnapshot({
        activeConnectorId: "rabby",
        pool: { rabby: toStoredEntry("rabby", rabby) },
        selection: {},
      });
      const state = reducer(seeded, { connectorId: "rabby", entry: rabby, type: "ENTRY_RESTORED" });
      expect(state.pool.get("rabby")).toBe(rabby);
      expect(state.reconnectingIds.size).toBe(0);
      expect(state.dormant.size).toBe(0);
    });

    it("yields to the user when the entry stopped being dormant", () => {
      const state = connected(metamask);
      expect(reducer(state, { connectorId: "rabby", entry: rabby, type: "ENTRY_RESTORED" })).toBe(
        state,
      );
    });
  });

  describe("RESTORE_FAILED", () => {
    it("evicts a seeded shadow from the pool but keeps it dormant", () => {
      const seeded = stateFromSnapshot({
        activeConnectorId: "rabby",
        pool: { rabby: toStoredEntry("rabby", rabby) },
        selection: {},
      });
      const state = reducer(seeded, { connectorId: "rabby", type: "RESTORE_FAILED" });
      expect(state.pool.size).toBe(0);
      expect(state.reconnectingIds.size).toBe(0);
      expect(state.dormant.has("rabby")).toBe(true);
      expect(state.activeConnectorId).toBeNull();
    });

    it("leaves an ordinary dormant entry untouched", () => {
      const state = stateWith({ dormant: new Map([["rabby", toStoredEntry("rabby", rabby)]]) });
      expect(reducer(state, { connectorId: "rabby", type: "RESTORE_FAILED" })).toBe(state);
    });
  });

  describe("HYDRATED", () => {
    it("applies the stored active wallet and selection when they are live", () => {
      const state = reducer(connected(metamask, rabby, phantom), {
        activeConnectorId: "phantom",
        selection: { evm: "rabby" },
        type: "HYDRATED",
      });
      expect(state.activeConnectorId).toBe("phantom");
      expect(state.selection.get("evm")).toBe("rabby");
      expect(state.isHydrated).toBe(true);
    });

    it("ignores stored ids that are not live or not on that platform", () => {
      const state = reducer(connected(metamask, phantom), {
        activeConnectorId: "gone",
        selection: { evm: "phantom", svm: "gone" },
        type: "HYDRATED",
      });
      expect(state.activeConnectorId).toBe("metamask");
      expect(state.selection).toEqual(
        new Map([
          ["evm", "metamask"],
          ["svm", "phantom"],
        ]),
      );
    });
  });

  describe("connect attempts", () => {
    it("CONNECT_STARTED marks the attempt and clears the previous error and intent", () => {
      const failed = stateWith({
        connectionError: new ConnectionError("Unknown", "boom"),
        connectionStatus: "error",
        isUserDisconnected: true,
      });
      const state = reducer(failed, { connectorId: "rabby", type: "CONNECT_STARTED" });
      expect(state).toMatchObject({
        connectingConnectorId: "rabby",
        connectionError: null,
        connectionStatus: "connecting",
        isUserDisconnected: false,
      });
    });

    it("CONNECT_SUCCEEDED pools the wallet, activates and selects it", () => {
      const started = reducer(connected(metamask), {
        connectorId: "rabby",
        type: "CONNECT_STARTED",
      });
      const state = reducer(started, {
        connectorId: "rabby",
        entry: rabby,
        type: "CONNECT_SUCCEEDED",
      });
      expect(state.pool.get("rabby")).toBe(rabby);
      expect(state.activeConnectorId).toBe("rabby");
      expect(state.selection.get("evm")).toBe("rabby");
      expect(state.connectionStatus).toBe("success");
      expect(state.connectingConnectorId).toBeNull();
    });

    it("CONNECT_SUCCEEDED of a pooled wallet keeps the platform's selection", () => {
      const state = reducer(
        reducer(connected(metamask, rabby), {
          chainPlatform: "evm",
          connectorId: "metamask",
          type: "SELECTION_CHANGED",
        }),
        { connectorId: "rabby", entry: walletOf(rabby.connector), type: "CONNECT_SUCCEEDED" },
      );
      expect(state.selection.get("evm")).toBe("metamask");
      expect(state.activeConnectorId).toBe("rabby");
    });

    it("a superseded attempt pools its wallet without touching the current status", () => {
      const started = reducer(initialState, { connectorId: "phantom", type: "CONNECT_STARTED" });
      const state = reducer(started, {
        connectorId: "rabby",
        entry: rabby,
        type: "CONNECT_SUCCEEDED",
      });
      expect(state.pool.has("rabby")).toBe(true);
      expect(state.connectionStatus).toBe("connecting");
      expect(state.connectingConnectorId).toBe("phantom");
    });

    it("CONNECT_FAILED records the error of the current attempt only", () => {
      const error = new ConnectionError("UserRejected", "no");
      const started = reducer(initialState, { connectorId: "rabby", type: "CONNECT_STARTED" });
      expect(reducer(started, { connectorId: "phantom", error, type: "CONNECT_FAILED" })).toBe(
        started,
      );
      const state = reducer(started, { connectorId: "rabby", error, type: "CONNECT_FAILED" });
      expect(state).toMatchObject({
        connectingConnectorId: null,
        connectionError: error,
        connectionStatus: "error",
      });
    });

    it("STATUS_RESET returns to idle", () => {
      const started = reducer(initialState, { connectorId: "rabby", type: "CONNECT_STARTED" });
      const state = reducer(started, { type: "STATUS_RESET" });
      expect(state).toMatchObject({
        connectingConnectorId: null,
        connectionError: null,
        connectionStatus: "idle",
      });
    });
  });

  describe("ACCOUNTS_CHANGED", () => {
    const second = buildAccount("0xsecond", ETHEREUM);
    const [first] = metamask.accounts;

    it("keeps the active account while it is still exposed", () => {
      const state = reducer(connected(metamask), {
        accounts: [second, metamask.account],
        connectorId: "metamask",
        type: "ACCOUNTS_CHANGED",
      });
      expect(state.pool.get("metamask")?.account).toBe(metamask.account);
      expect(state.pool.get("metamask")?.accounts).toEqual([second, metamask.account]);
    });

    it("falls back to the first account, or takes an explicit active one", () => {
      const fallback = reducer(connected(metamask), {
        accounts: [second],
        connectorId: "metamask",
        type: "ACCOUNTS_CHANGED",
      });
      expect(fallback.pool.get("metamask")?.account).toBe(second);

      const explicit = reducer(connected(metamask), {
        accounts: [metamask.account, second],
        active: second,
        connectorId: "metamask",
        type: "ACCOUNTS_CHANGED",
      });
      expect(explicit.pool.get("metamask")?.account).toBe(second);
    });

    it("ignores an empty list, an unknown wallet and an unchanged list", () => {
      const state = connected(metamask);
      expect(
        reducer(state, { accounts: [], connectorId: "metamask", type: "ACCOUNTS_CHANGED" }),
      ).toBe(state);
      expect(
        reducer(state, { accounts: [second], connectorId: "gone", type: "ACCOUNTS_CHANGED" }),
      ).toBe(state);
      expect(
        reducer(state, {
          accounts: first === undefined ? [] : [buildAccount(first.walletAddress, ETHEREUM)],
          connectorId: "metamask",
          type: "ACCOUNTS_CHANGED",
        }),
      ).toBe(state);
    });
  });

  describe("DISCONNECTED", () => {
    it("by the user drops the wallet everywhere and records the intent", () => {
      const state = reducer(
        reducer(connected(metamask, rabby), {
          entries: { phantom: toStoredEntry("phantom", phantom) },
          isUserDisconnected: false,
          type: "STORAGE_LOADED",
        }),
        { byUser: true, connectorId: "metamask", type: "DISCONNECTED" },
      );
      expect([...state.pool.keys()]).toEqual(["rabby"]);
      expect(state.activeConnectorId).toBe("rabby");
      expect(state.selection.get("evm")).toBe("rabby");
      expect(state.dormant.has("phantom")).toBe(true);
      expect(state.isUserDisconnected).toBe(true);
    });

    it("by the user, of the last live wallet, forgets dormant connections too", () => {
      const state = reducer(
        reducer(connected(metamask), {
          entries: { phantom: toStoredEntry("phantom", phantom) },
          isUserDisconnected: false,
          type: "STORAGE_LOADED",
        }),
        { byUser: true, connectorId: "metamask", type: "DISCONNECTED" },
      );
      expect(state.pool.size).toBe(0);
      expect(state.dormant.size).toBe(0);
      expect(state.activeConnectorId).toBeNull();
      expect(state.selection.size).toBe(0);
    });

    it("by the user, repeated, changes nothing", () => {
      const state = reducer(connected(metamask), {
        byUser: true,
        connectorId: "metamask",
        type: "DISCONNECTED",
      });
      expect(reducer(state, { byUser: true, connectorId: "metamask", type: "DISCONNECTED" })).toBe(
        state,
      );
    });

    it("by the wallet keeps the connection dormant for the next load", () => {
      const state = reducer(connected(metamask, phantom), {
        byUser: false,
        connectorId: "phantom",
        type: "DISCONNECTED",
      });
      expect(state.pool.has("phantom")).toBe(false);
      expect(state.dormant.get("phantom")).toEqual(toStoredEntry("phantom", phantom));
      expect(state.selection.has("svm")).toBe(false);
      expect(state.isUserDisconnected).toBe(false);
    });

    it("by the wallet, of a wallet not in the pool, changes nothing", () => {
      const state = connected(metamask);
      expect(reducer(state, { byUser: false, connectorId: "gone", type: "DISCONNECTED" })).toBe(
        state,
      );
    });
  });

  it("RESET forgets every connection but keeps adapters and hydration", () => {
    const adapter = evmAdapter("metamask");
    const state = reducer(
      { ...connected(metamask, phantom), adapters: [adapter] },
      { type: "RESET" },
    );
    expect(state).toMatchObject({
      activeConnectorId: null,
      adapters: [adapter],
      isHydrated: true,
      isUserDisconnected: true,
    });
    expect(state.pool.size).toBe(0);
    expect(state.dormant.size).toBe(0);
    expect(state.selection.size).toBe(0);
  });

  it("ACTIVE_CHANGED switches to a pooled wallet and ignores anything else", () => {
    const state = connected(metamask, phantom);
    expect(
      reducer(state, { connectorId: "phantom", type: "ACTIVE_CHANGED" }).activeConnectorId,
    ).toBe("phantom");
    expect(reducer(state, { connectorId: "gone", type: "ACTIVE_CHANGED" })).toBe(state);
  });

  it("SELECTION_CHANGED only accepts a pooled wallet of that platform", () => {
    const state = connected(metamask, rabby, phantom);
    const next = reducer(state, {
      chainPlatform: "evm",
      connectorId: "rabby",
      type: "SELECTION_CHANGED",
    });
    expect(next.selection.get("evm")).toBe("rabby");
    expect(
      reducer(state, { chainPlatform: "svm", connectorId: "rabby", type: "SELECTION_CHANGED" }),
    ).toBe(state);
    expect(
      reducer(state, { chainPlatform: "evm", connectorId: "gone", type: "SELECTION_CHANGED" }),
    ).toBe(state);
  });
});

describe("stateFromSnapshot", () => {
  it("seeds shadows that are reconnecting, dormant and already hydrated", () => {
    const state = stateFromSnapshot({
      activeConnectorId: "phantom",
      pool: {
        phantom: toStoredEntry("phantom", phantom),
        rabby: { ...toStoredEntry("rabby", rabby), icon: "data:image/svg+xml,rabby" },
      },
      selection: { evm: "rabby" },
    });
    expect(state.isHydrated).toBe(true);
    expect(state.activeConnectorId).toBe("phantom");
    expect([...state.reconnectingIds]).toEqual(["phantom", "rabby"]);
    expect([...state.dormant.keys()]).toEqual(["phantom", "rabby"]);
    expect(state.selection.get("evm")).toBe("rabby");
    expect(state.selection.get("svm")).toBe("phantom");
    const seeded = state.pool.get("rabby");
    expect(seeded?.account).toEqual(rabby.account);
    expect(seeded?.connector).toMatchObject({
      chainPlatform: "evm",
      icon: "data:image/svg+xml,rabby",
      id: "rabby",
      name: "rabby wallet",
    });
  });

  it("falls back to the first entry when the stored active id is not in the pool", () => {
    const state = stateFromSnapshot({
      activeConnectorId: "gone",
      pool: { phantom: toStoredEntry("phantom", phantom) },
      selection: {},
    });
    expect(state.activeConnectorId).toBe("phantom");
    expect(state.pool.get("phantom")?.account.chain).toEqual(SOLANA);
  });
});

describe("toStoredEntry", () => {
  it("keeps the identity a shadow needs and nothing live", () => {
    expect(toStoredEntry("metamask", metamask)).toEqual({
      account: metamask.account,
      accounts: metamask.accounts,
      chainPlatform: "evm",
      connectorId: "metamask",
      icon: undefined,
      name: "metamask wallet",
    });
  });
});
