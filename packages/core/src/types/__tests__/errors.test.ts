import { describe, expect, it } from "vitest";

import { mapConnectionError } from "../errors";

describe("mapConnectionError", () => {
  it("maps butr's Connection timeout error to Timeout", () => {
    expect(mapConnectionError(new Error("Connection timeout"))).toMatchObject({
      kind: "Timeout",
      message: "Connection timeout",
    });
  });

  it("maps butr's Failed to get account to NotConnected", () => {
    expect(mapConnectionError(new Error("Failed to get account"))).toMatchObject({
      kind: "NotConnected",
    });
  });

  it("maps EIP-1193 code 4001 to UserRejected", () => {
    const err = Object.assign(new Error("user denied"), { code: 4001 });
    expect(mapConnectionError(err)).toMatchObject({ kind: "UserRejected" });
  });

  it("maps EIP-1193 code -32002 to RequestPending", () => {
    const err = Object.assign(new Error("already pending"), { code: -32_002 });
    expect(mapConnectionError(err)).toMatchObject({ kind: "RequestPending" });
  });

  it("maps user-rejected message text to UserRejected", () => {
    expect(mapConnectionError(new Error("User Rejected the request"))).toMatchObject({
      kind: "UserRejected",
    });
    expect(mapConnectionError(new Error("user denied transaction"))).toMatchObject({
      kind: "UserRejected",
    });
  });

  it("maps locked-wallet message to WalletLocked", () => {
    expect(mapConnectionError(new Error("wallet is locked"))).toMatchObject({
      kind: "WalletLocked",
    });
  });

  it("maps chain-mismatch heuristic to ChainMismatch", () => {
    expect(mapConnectionError(new Error("chain mismatch detected"))).toMatchObject({
      kind: "ChainMismatch",
    });
    expect(mapConnectionError(new Error("unsupported chain id"))).toMatchObject({
      kind: "ChainMismatch",
    });
  });

  it("falls back to Unknown for arbitrary Error", () => {
    const raw = new Error("something exploded");
    const result = mapConnectionError(raw);
    expect(result.kind).toBe("Unknown");
    expect(result.message).toBe("something exploded");
    if (result.kind === "Unknown") {
      expect(result.cause).toBe(raw);
    }
  });

  it("falls back to Unknown for raw strings", () => {
    expect(mapConnectionError("just a string")).toMatchObject({
      kind: "Unknown",
      message: "just a string",
    });
  });

  it("falls back to Unknown for non-Error, non-string values", () => {
    const result = mapConnectionError({ weird: "object" });
    expect(result.kind).toBe("Unknown");
    expect(result.message).toBe("Connection failed");
  });
});
