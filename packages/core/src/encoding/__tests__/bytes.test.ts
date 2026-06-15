import { describe, expect, it } from "vitest";

import { base64ToBytes, bytesToBase64, bytesToHex, bytesToHexPrefixed, hexToBytes } from "../bytes";

describe("bytesToHex / bytesToHexPrefixed", () => {
  it("encodes bare lowercase hex with zero-padding", () => {
    expect(bytesToHex(new Uint8Array([0, 15, 255]))).toBe("000fff");
  });

  it("encodes prefixed hex", () => {
    expect(bytesToHexPrefixed(new Uint8Array([0, 15, 255]))).toBe("0x000fff");
  });

  it("encodes the EVM canary vector", () => {
    const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    expect(bytesToHex(bytes)).toBe("deadbeef");
    expect(bytesToHexPrefixed(bytes)).toBe("0xdeadbeef");
  });

  it("returns empty string for empty input", () => {
    expect(bytesToHex(new Uint8Array([]))).toBe("");
    expect(bytesToHexPrefixed(new Uint8Array([]))).toBe("0x");
  });
});

describe("hexToBytes", () => {
  it("decodes bare hex", () => {
    expect(hexToBytes("deadbeef")).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
  });

  it("decodes prefixed hex (strips 0x)", () => {
    expect(hexToBytes("0xdeadbeef")).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
  });

  it("decodes empty input", () => {
    expect(hexToBytes("")).toEqual(new Uint8Array([]));
    expect(hexToBytes("0x")).toEqual(new Uint8Array([]));
  });

  it("round-trips both hex variants", () => {
    const bytes = new Uint8Array([0, 1, 127, 200, 255]);
    expect(hexToBytes(bytesToHex(bytes))).toEqual(bytes);
    expect(hexToBytes(bytesToHexPrefixed(bytes))).toEqual(bytes);
  });

  it("throws on odd-length input", () => {
    expect(() => hexToBytes("abc")).toThrow(TypeError);
  });

  it("throws on non-hex characters", () => {
    expect(() => hexToBytes("zz")).toThrow(TypeError);
  });
});

describe("base64ToBytes / bytesToBase64", () => {
  it("round-trips arbitrary bytes", () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 252, 253, 254, 255]);
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
  });

  it("encodes a known vector", () => {
    expect(bytesToBase64(new Uint8Array([104, 105]))).toBe("aGk=");
    expect(base64ToBytes("aGk=")).toEqual(new Uint8Array([104, 105]));
  });

  it("handles empty input", () => {
    expect(bytesToBase64(new Uint8Array([]))).toBe("");
    expect(base64ToBytes("")).toEqual(new Uint8Array([]));
  });
});
