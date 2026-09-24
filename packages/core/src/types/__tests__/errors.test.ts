import { describe, expect, it } from "vitest";

import { ConnectionError, toConnectionError } from "../errors";

const withCode = (message: string, code: number | string) =>
  Object.assign(new Error(message), { code });

describe("ConnectionError", () => {
  it("is an Error carrying its kind and cause", () => {
    const cause = new Error("raw");
    const error = new ConnectionError("Timeout", "too slow", { cause });
    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      cause,
      kind: "Timeout",
      message: "too slow",
      name: "ConnectionError",
    });
  });
});

describe("toConnectionError", () => {
  it("returns a ConnectionError unchanged", () => {
    const error = new ConnectionError("WalletNotFound", "nope");
    expect(toConnectionError(error)).toBe(error);
  });

  it.each([
    [4001, "UserRejected"],
    [-32_002, "RequestPending"],
    [4100, "NotConnected"],
    [4900, "NotConnected"],
    [4901, "NotConnected"],
    ["4001", "Unknown"],
  ] as const)("classifies EIP-1193 code %j as %s", (code, kind) => {
    expect(toConnectionError(withCode("something", code)).kind).toBe(kind);
  });

  it.each([
    ["User Rejected the request", "UserRejected"],
    ["user denied transaction signature", "UserRejected"],
    ["Wallet not connected", "NotConnected"],
    ["wallet is locked", "WalletLocked"],
    ["chain mismatch detected", "ChainMismatch"],
    ["unsupported chain id", "ChainMismatch"],
    ["something exploded", "Unknown"],
  ] as const)("classifies the message %j as %s", (message, kind) => {
    expect(toConnectionError(new Error(message)).kind).toBe(kind);
  });

  it("keeps the original error as the cause and its message", () => {
    const raw = new Error("something exploded");
    expect(toConnectionError(raw)).toMatchObject({ cause: raw, message: "something exploded" });
  });

  it("wraps a thrown non-Error as Unknown", () => {
    expect(toConnectionError("just a string")).toMatchObject({
      cause: "just a string",
      kind: "Unknown",
      message: "just a string",
    });
    expect(toConnectionError({ code: 4001 })).toMatchObject({
      kind: "Unknown",
      message: "Connection failed",
    });
    expect(toConnectionError("").message).toBe("Connection failed");
  });
});
