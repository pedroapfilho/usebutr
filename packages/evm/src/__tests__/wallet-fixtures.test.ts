import { describe, expect, it } from "vitest";

import type { Eip1193Provider, Eip1193Value } from "../eip1193";
import type { EvmIdentity } from "../eip6963-adapter";
import { buildEvmAdapter } from "../eip6963-adapter";

const baseInfo = (id: string, name: string): EvmIdentity => ({
  icon: "data:image/svg+xml;base64,Zm9v",
  id,
  name,
  walletKey: name.toLowerCase(),
});

type MockResponse = () => Eip1193Value | Promise<never> | undefined;

type MockProvider = Eip1193Provider & { requests: Array<{ method: string }> };

const createMockProvider = (responses: Record<string, MockResponse>): MockProvider => {
  const requests: Array<{ method: string }> = [];

  return {
    on() {},
    removeListener() {},
    request({ method }) {
      requests.push({ method });
      const handler = responses[method];

      if (handler === undefined) {
        return Promise.reject(new Error(`[test] unmocked: ${method}`));
      }

      return Promise.resolve(handler());
    },
    requests,
  };
};

describe("EVM wallet fixtures — known quirks (Strategy A)", () => {
  describe("MetaMask (io.metamask)", () => {
    const info = baseInfo("io.metamask", "MetaMask");

    it("wallet_requestPermissions resolves — no fallback fires", async () => {
      const provider = createMockProvider({
        wallet_requestPermissions: () => [{ parentCapability: "eth_accounts" }],
      });

      const adapter = buildEvmAdapter(info, provider);
      await adapter.requestAccounts?.();
      expect(provider.requests.map((r) => r.method)).toEqual(["wallet_requestPermissions"]);
    });
  });

  describe("Coinbase Wallet (com.coinbase.wallet)", () => {
    const info = baseInfo("com.coinbase.wallet", "Coinbase Wallet");

    it("rejection (-32603 wrapping -32604) falls back to eth_requestAccounts", async () => {
      const provider = createMockProvider({
        eth_requestAccounts: () => ["0x53d120cf09b21c2fcc67814cdf10c8ca9bcc7670"],
        wallet_requestPermissions: () =>
          Promise.reject(
            Object.assign(new Error("this request method is not supported"), {
              code: -32_603,
              data: { originalError: { code: -32_604, message: "not supported" } },
            }),
          ),
      });

      const adapter = buildEvmAdapter(info, provider);
      await adapter.requestAccounts?.();
      expect(provider.requests.map((r) => r.method)).toEqual([
        "wallet_requestPermissions",
        "eth_requestAccounts",
      ]);
    });
  });

  describe("Phantom EVM (app.phantom)", () => {
    const info = baseInfo("app.phantom", "Phantom");

    it("rejection (-32601) falls back to eth_requestAccounts", async () => {
      const provider = createMockProvider({
        eth_requestAccounts: () => ["0xabc"],
        wallet_requestPermissions: () =>
          Promise.reject(Object.assign(new Error("method not found"), { code: -32_601 })),
      });

      const adapter = buildEvmAdapter(info, provider);
      await adapter.requestAccounts?.();
      expect(provider.requests.map((r) => r.method)).toEqual([
        "wallet_requestPermissions",
        "eth_requestAccounts",
      ]);
    });

    it("rejection (4200) also falls back", async () => {
      const provider = createMockProvider({
        eth_requestAccounts: () => ["0xabc"],
        wallet_requestPermissions: () =>
          Promise.reject(Object.assign(new Error("method not supported"), { code: 4200 })),
      });

      const adapter = buildEvmAdapter(info, provider);
      await adapter.requestAccounts?.();
      expect(provider.requests.map((r) => r.method)).toEqual([
        "wallet_requestPermissions",
        "eth_requestAccounts",
      ]);
    });
  });

  describe("Rabby (io.rabby)", () => {
    const info = baseInfo("io.rabby", "Rabby");

    it("wallet_requestPermissions resolves but no picker UI surfaces (simulated)", async () => {
      const provider = createMockProvider({
        wallet_requestPermissions: () => [{ parentCapability: "eth_accounts" }],
      });

      const adapter = buildEvmAdapter(info, provider);
      await adapter.requestAccounts?.();
      expect(provider.requests.map((r) => r.method)).toEqual(["wallet_requestPermissions"]);
    });
  });

  describe("Defence-in-depth: unknown wallets", () => {
    it("falls back to eth_requestAccounts when an unknown wallet rejects with -32601", async () => {
      const provider = createMockProvider({
        eth_requestAccounts: () => ["0xabc"],
        wallet_requestPermissions: () =>
          Promise.reject(Object.assign(new Error("method not found"), { code: -32_601 })),
      });

      const adapter = buildEvmAdapter(baseInfo("xyz.unknown", "Unknown"), provider);
      await adapter.requestAccounts?.();
      expect(provider.requests.map((r) => r.method)).toEqual([
        "wallet_requestPermissions",
        "eth_requestAccounts",
      ]);
    });

    it("re-throws on user rejection (code 4001) without trying the fallback", async () => {
      const provider = createMockProvider({
        wallet_requestPermissions: () =>
          Promise.reject(Object.assign(new Error("User rejected the request"), { code: 4001 })),
      });

      const adapter = buildEvmAdapter(baseInfo("io.metamask", "MetaMask"), provider);
      await expect(adapter.requestAccounts?.()).rejects.toMatchObject({ code: 4001 });
      expect(provider.requests.map((r) => r.method)).toEqual(["wallet_requestPermissions"]);
    });

    it("re-throws unknown error shapes (no code) without trying the fallback", async () => {
      const provider = createMockProvider({
        wallet_requestPermissions: () => Promise.reject(new Error("generic failure")),
      });

      const adapter = buildEvmAdapter(baseInfo("io.metamask", "MetaMask"), provider);
      await expect(adapter.requestAccounts?.()).rejects.toThrow(/generic failure/v);
      expect(provider.requests.map((r) => r.method)).toEqual(["wallet_requestPermissions"]);
    });
  });
});

describe("EVM surface", () => {
  it("exposes requestAccounts and the EIP-1193 methods", () => {
    const adapter = buildEvmAdapter(baseInfo("io.metamask", "MetaMask"), createMockProvider({}));
    expect(adapter).toMatchObject({
      getBalance: expect.any(Function),
      getTransactionReceipt: expect.any(Function),
      requestAccounts: expect.any(Function),
      sendTx: expect.any(Function),
      signMessage: expect.any(Function),
      subscribe: expect.any(Function),
      switchChain: expect.any(Function),
    });
  });
});
