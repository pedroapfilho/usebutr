import type { Eip1193Provider, Eip6963ProviderInfo } from "@usebutr/evm";
import { buildEvmAdapter } from "@usebutr/evm";
import { describe, expect, it } from "vitest";

const baseInfo = (rdns: string, name: string): Eip6963ProviderInfo => ({
  icon: "data:image/svg+xml;base64,Zm9v",
  name,
  rdns,
  uuid: `${rdns}-uuid`,
});

type MockResponse = () => unknown;
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

    it("capabilities.requestAccounts is true (allow-listed)", () => {
      const adapter = buildEvmAdapter(info, createMockProvider({}));
      expect(adapter.capabilities.requestAccounts).toBe(true);
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

    it("capabilities.requestAccounts is false (no fresh picker possible)", () => {
      const adapter = buildEvmAdapter(info, createMockProvider({}));
      expect(adapter.capabilities.requestAccounts).toBe(false);
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

    it("capabilities.requestAccounts is false (fallback is a no-op for user)", () => {
      const adapter = buildEvmAdapter(info, createMockProvider({}));
      expect(adapter.capabilities.requestAccounts).toBe(false);
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

    it("capabilities.requestAccounts is false (silent return wouldn't surface a picker)", () => {
      const adapter = buildEvmAdapter(info, createMockProvider({}));
      expect(adapter.capabilities.requestAccounts).toBe(false);
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

describe("EVM capability allow-list (Strategy B)", () => {
  it.each([
    ["io.metamask", "MetaMask", true],
    ["io.rabby", "Rabby", false],
    ["com.coinbase.wallet", "Coinbase Wallet", false],
    ["app.phantom", "Phantom", false],
    ["com.brave.wallet", "Brave Wallet", false],
    ["com.okex.wallet", "OKX Wallet", false],
    ["com.binance.wallet", "Binance Wallet", false],
    ["com.bitkeep.wallet", "Bitget Wallet", false],
    ["com.trustwallet.app", "Trust Wallet", false],
    ["com.backpack", "Backpack", false],
    ["sh.frame.wallet", "Frame", false],
    ["xyz.unknown.wallet", "Unknown Wallet", false],
  ])("rdns=%s → capabilities.requestAccounts=%s", (rdns, name, expected) => {
    const adapter = buildEvmAdapter(baseInfo(rdns, name), createMockProvider({}));
    expect(adapter.capabilities.requestAccounts).toBe(expected);
  });
});

describe("EVM universal capabilities (every wallet)", () => {
  it.each([
    "io.metamask",
    "io.rabby",
    "com.coinbase.wallet",
    "app.phantom",
    "com.binance.wallet",
    "com.okex.wallet",
  ])("rdns=%s has the expected universal EVM capabilities", (rdns) => {
    const adapter = buildEvmAdapter(baseInfo(rdns, "test"), createMockProvider({}));
    expect(adapter.capabilities).toMatchObject({
      getBalance: true,
      getTransactionReceipt: true,
      sendTransaction: true,
      signMessage: true,
      subscribe: true,
      switchAccount: false,
      switchChain: true,
    });
  });
});

describe("Unverified wallets (todo — promote to fixtures once verified)", () => {
  it.todo("Brave Wallet: verify wallet_requestPermissions actually opens a picker");
  it.todo("Bitget Wallet: verify EIP-6963 announcement format");
  it.todo("Trust Wallet (extension): verify connect/sign/disconnect flow");
  it.todo("Frame: verify hardware-wallet pass-through");
});
