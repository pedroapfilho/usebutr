import { describe, expect, it } from "vitest";

import { evmAdapter, svmAdapter, walletOf } from "../../__tests__/helpers";
import type { StoredPoolEntry } from "../../storage/persistence";
import type { ConnectedWallet } from "../../types";
import type { StoreState } from "../reducer";
import { initialState, reconcile } from "../reducer";
import { createShadowAdapter } from "../shadow-adapter";

const entryOf = (wallet: ConnectedWallet): StoredPoolEntry => ({
  account: wallet.account,
  accounts: wallet.accounts,
  chainPlatform: wallet.connector.chainPlatform,
  connectorId: wallet.connector.id,
  name: wallet.connector.name,
});

const shadowOf = (wallet: ConnectedWallet): ConnectedWallet =>
  walletOf(createShadowAdapter(entryOf(wallet)), wallet.accounts);

const metamask = walletOf(evmAdapter("metamask"));
const rabby = walletOf(evmAdapter("rabby"));
const phantom = walletOf(svmAdapter("phantom"));
const rabbyShadow = shadowOf(rabby);
const phantomShadow = shadowOf(phantom);
const dormantEntries = new Map([
  ["metamask", entryOf(metamask)],
  ["rabby", entryOf(rabby)],
  ["phantom", entryOf(phantom)],
]);

const poolOf = (...wallets: ReadonlyArray<ConnectedWallet>) =>
  new Map(wallets.map((wallet) => [wallet.connector.id, wallet]));

const stateWith = (overrides: Partial<StoreState>): StoreState => ({
  ...initialState,
  ...overrides,
});

/** A consistent state holding `wallets`, first one active and selected. */
const connected = (...wallets: ReadonlyArray<ConnectedWallet>): StoreState =>
  reconcile(stateWith({ isHydrated: true, pool: poolOf(...wallets) }));

describe("reconcile", () => {
  it("returns the state itself when every invariant already holds", () => {
    const state = connected(metamask, phantom);
    expect(reconcile(state)).toBe(state);
    expect(reconcile(initialState)).toBe(initialState);
  });

  it("derives reconnecting ids from the shadows in the pool", () => {
    const state = reconcile(
      stateWith({
        pool: poolOf(metamask, rabbyShadow, phantomShadow),
        reconnectingIds: new Set(["metamask", "gone"]),
      }),
    );
    expect([...state.reconnectingIds]).toEqual(["rabby", "phantom"]);
    expect(reconcile({ ...state, activeConnectorId: null }).reconnectingIds).toBe(
      state.reconnectingIds,
    );
  });

  it("drops dormant entries that are live, keeps those still reconnecting or absent", () => {
    const state = reconcile(
      stateWith({ dormant: dormantEntries, pool: poolOf(metamask, rabbyShadow) }),
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
        pool: poolOf(metamask, rabby),
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
    const state = reconcile(stateWith({ activeConnectorId: "gone", pool: poolOf(rabby) }));
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
