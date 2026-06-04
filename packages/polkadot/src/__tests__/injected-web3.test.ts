import { describe, expect, it } from "vitest";

import { hexToBytes, wrapBytes } from "../injected/injected-web3";

describe("hexToBytes", () => {
  it("decodes 0x-prefixed hex", () => {
    expect([...hexToBytes("0x00ff10")]).toEqual([0, 255, 16]);
  });
  it("decodes bare hex", () => {
    expect([...hexToBytes("00ff10")]).toEqual([0, 255, 16]);
  });
});

describe("wrapBytes", () => {
  it("wraps a message in <Bytes>…</Bytes> the way polkadot-js extensions sign it", () => {
    const wrapped = wrapBytes(new TextEncoder().encode("hi"));
    expect(new TextDecoder().decode(wrapped)).toBe("<Bytes>hi</Bytes>");
  });
});
