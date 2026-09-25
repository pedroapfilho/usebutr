import { afterEach, describe, expect, it, vi } from "vitest";

import { evmAdapter, walletOf } from "../../__tests__/helpers";
import { toStoredEntry } from "../../store/reducer";
import { decodePool, decodeSelection, storageKeys } from "../validation";

const metamask = toStoredEntry("metamask", walletOf(evmAdapter("metamask")));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("storageKeys", () => {
  it("prefixes every key, defaulting to butr", () => {
    expect(storageKeys()).toEqual({
      active: "butr-active",
      pool: "butr-pool",
      selection: "butr-selection",
      userDisconnected: "butr-user-disconnected",
    });
    expect(storageKeys("").pool).toBe("butr-pool");
    expect(storageKeys("app").pool).toBe("app-pool");
  });
});

describe("decodePool", () => {
  it("decodes valid entries and keeps unknown fields", () => {
    const withExtra = { ...metamask, extra: 1 };
    expect(decodePool(JSON.stringify({ metamask: withExtra }))).toEqual({ metamask: withExtra });
  });

  it.each([null, undefined, ""])("decodes %j as empty", (raw) => {
    expect(decodePool(raw)).toEqual({});
  });

  it("decodes invalid JSON or a non-record as empty, logging the parse failure", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(decodePool("{nope", "[label]")).toEqual({});
    expect(warn).toHaveBeenCalledWith(
      "[label] failed to parse pool from storage:",
      expect.any(SyntaxError),
    );
    expect(decodePool(JSON.stringify([metamask]))).toEqual({});
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
  ])("drops an entry with %s", (_label, payload) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(decodePool(JSON.stringify(payload))).toEqual({});
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("dropping invalid pool entry"));
  });
});

describe("decodeSelection", () => {
  it("keeps known platforms pointing at a non-empty id", () => {
    expect(
      decodeSelection(JSON.stringify({ evm: "metamask", martian: "x", sui: "", svm: 3 })),
    ).toEqual({ evm: "metamask" });
  });

  it("decodes invalid JSON as empty", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(decodeSelection("{nope")).toEqual({});
  });
});
