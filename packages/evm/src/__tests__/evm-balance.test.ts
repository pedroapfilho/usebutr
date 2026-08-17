import { describe, expect, it } from "vitest";

import type { Eip1193Provider } from "../eip1193";
import { readEvmBalance } from "../evm-balance";

const ADDRESS = "0x1234567890aBCDEF1234567890ABCDef12345678";
const TOKEN = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

const DECIMALS = "0x313ce567";
const SYMBOL = "0x95d89b41";

const createProvider = (
  handlers: Record<string, (params: unknown) => unknown>,
): Eip1193Provider => ({
  on() {},
  removeListener() {},
  request({ method, params }) {
    const handler = handlers[method];
    return Promise.resolve(handler === undefined ? undefined : handler(params));
  },
});

const selectorOf = (params: unknown): string => {
  const call = (params as Array<{ data: string }>)[0];
  if (call === undefined) {
    throw new Error("missing call");
  }
  return call.data.slice(0, 10);
};

describe("readEvmBalance", () => {
  it("reads the native balance", async () => {
    const provider = createProvider({ eth_getBalance: () => "0x0de0b6b3a7640000" });
    const balance = await readEvmBalance(provider, ADDRESS);

    expect(balance.value).toBe(1_000_000_000_000_000_000n);
    expect(balance.formatted).toBe("1");
  });

  it("throws instead of reporting 0 when eth_getBalance returns a non-string", async () => {
    const provider = createProvider({ eth_getBalance: () => null });
    await expect(readEvmBalance(provider, ADDRESS)).rejects.toThrow("malformed eth_getBalance");
  });

  it("throws when the token's decimals() call returns a non-string", async () => {
    const provider = createProvider({
      eth_call: (params) =>
        selectorOf(params) === DECIMALS
          ? undefined
          : "0x0000000000000000000000000000000000000000000000000000000000000001",
    });

    await expect(readEvmBalance(provider, ADDRESS, TOKEN)).rejects.toThrow("malformed decimals()");
  });

  it("falls back to an empty symbol when the token's symbol() returns a non-string", async () => {
    const provider = createProvider({
      eth_call: (params) => {
        const selector = selectorOf(params);
        if (selector === SYMBOL) {
          return undefined;
        }
        return selector === DECIMALS
          ? "0x0000000000000000000000000000000000000000000000000000000000000006"
          : "0x00000000000000000000000000000000000000000000000000000000002625a0";
      },
    });

    const balance = await readEvmBalance(provider, ADDRESS, TOKEN);
    expect(balance.symbol).toBe("");
    expect(balance.formatted).toBe("2.5");
  });
});
