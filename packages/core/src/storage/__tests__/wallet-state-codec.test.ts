import { afterEach, describe, expect, it, vi } from "vitest";

import { evmAdapter, walletOf } from "../../__tests__/helpers";
import type { PersistedWalletState } from "../persistence";
import { createWalletStateCodec, EMPTY_PERSISTED, toStoredPoolEntry } from "../wallet-state-codec";

const metamask = toStoredPoolEntry(walletOf(evmAdapter("metamask")));

const codec = createWalletStateCodec();

const decodeFrom = (entries: Record<string, string>) => codec.decode((key) => entries[key] ?? null);

const state: PersistedWalletState = {
  activeConnectorId: "metamask",
  isUserDisconnected: true,
  pool: { metamask },
  selection: { evm: "metamask" },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("toStoredPoolEntry", () => {
  it("keeps what a shadow adapter renders", () => {
    const wallet = walletOf(evmAdapter("metamask", { icon: "data:image/svg+xml,x" }));
    expect(toStoredPoolEntry(wallet)).toEqual({
      account: wallet.account,
      accounts: wallet.accounts,
      chainPlatform: "evm",
      connectorId: "metamask",
      icon: "data:image/svg+xml,x",
      name: wallet.connector.name,
    });
  });
});

describe("createWalletStateCodec", () => {
  it("lays the state out under the prefix, the intent in the session slot", () => {
    expect(createWalletStateCodec("app").layout).toEqual([
      { key: "app-pool", slot: "persistent" },
      { key: "app-selection", slot: "persistent" },
      { key: "app-active", slot: "persistent" },
      { key: "app-user-disconnected", slot: "session" },
    ]);
    expect(createWalletStateCodec("").layout).toEqual(codec.layout);
    expect(codec.layout[0]?.key).toBe("butr-pool");
  });

  it("round-trips a state", () => {
    const entries = Object.fromEntries(
      codec.encode(state).map(({ key, value }) => [key, value ?? ""]),
    );

    expect(decodeFrom(entries)).toEqual(state);
  });

  it("encodes an empty state as removals", () => {
    expect(codec.encode(EMPTY_PERSISTED).map(({ value }) => value)).toEqual([
      null,
      null,
      null,
      null,
    ]);
  });

  it("decodes absent keys as the empty state", () => {
    expect(codec.decode(() => undefined)).toEqual(EMPTY_PERSISTED);
  });

  it("decodes the snapshot from the persistent slot alone", () => {
    const read = vi.fn((key: string) =>
      key === "butr-pool" ? JSON.stringify({ metamask }) : null,
    );

    expect(codec.decodeSnapshot(read)).toEqual({
      activeConnectorId: null,
      pool: { metamask },
      selection: {},
    });
    expect(read).not.toHaveBeenCalledWith("butr-user-disconnected");
  });

  it("keeps an active id the pool does not hold, for reconcile to resolve", () => {
    expect(decodeFrom({ "butr-active": "phantom" }).activeConnectorId).toBe("phantom");
    expect(decodeFrom({ "butr-active": "" }).activeConnectorId).toBeNull();
  });

  it("keeps unknown fields of a valid pool entry", () => {
    const withExtra = { ...metamask, extra: 1 };
    expect(decodeFrom({ "butr-pool": JSON.stringify({ metamask: withExtra }) }).pool).toEqual({
      metamask: withExtra,
    });
  });

  it("decodes invalid JSON or a non-record as empty, logging the parse failure", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(decodeFrom({ "butr-pool": "{nope" }).pool).toEqual({});
    expect(warn).toHaveBeenCalledWith(
      "[butr] failed to parse pool from storage:",
      expect.any(SyntaxError),
    );
    expect(decodeFrom({ "butr-pool": JSON.stringify([metamask]) }).pool).toEqual({});
  });

  it.each([
    ["a key that disagrees with connectorId", { other: metamask }],
    ["an unknown platform", { metamask: { ...metamask, chainPlatform: "martian" } }],
    ["an empty name", { metamask: { ...metamask, name: "" } }],
    [
      "a chain missing fields",
      { metamask: { ...metamask, account: { id: "x", walletAddress: "0x" } } },
    ],
    ["no accounts list", { metamask: { ...metamask, accounts: undefined } }],
  ])("drops a pool entry with %s", (_label, payload) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(decodeFrom({ "butr-pool": JSON.stringify(payload) }).pool).toEqual({});
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("dropping invalid pool entry"));
  });

  it("keeps selections of known platforms pointing at a non-empty id", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const selection = JSON.stringify({ evm: "metamask", martian: "x", sui: "", svm: 3 });
    expect(decodeFrom({ "butr-selection": selection }).selection).toEqual({ evm: "metamask" });
    expect(decodeFrom({ "butr-selection": "{nope" }).selection).toEqual({});
  });
});
