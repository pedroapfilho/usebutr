import { afterEach, describe, expect, it, vi } from "vitest";
import { discoverSvmAdapters } from "../wallet-standard";

describe("discoverSvmAdapters", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("returns a synchronous unsubscribe even before the import resolves", () => {
    const unsubscribe = discoverSvmAdapters(() => {});
    expect(typeof unsubscribe).toBe("function");
    expect(() => unsubscribe()).not.toThrow();
  });

  it("emits adapters announced via the Wallet Standard `register` event", async () => {
    const listeners = new Set<(...wallets: ReadonlyArray<unknown>) => void>();
    const fakeApp = {
      get: () => [],
      on: (event: string, handler: (...wallets: ReadonlyArray<unknown>) => void) => {
        if (event !== "register") {
          return () => {};
        }
        listeners.add(handler);
        return () => listeners.delete(handler);
      },
    };
    vi.doMock("@wallet-standard/app", () => ({
      getWallets: () => fakeApp,
    }));

    // Re-import after mocking so the module picks up our mock.
    const { discoverSvmAdapters: subject } = await import("../wallet-standard");
    const seen: Array<string> = [];
    const unsubscribe = subject((adapter) => seen.push(adapter.id));
    // Yield for the dynamic import inside the IIFE.
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
    // Simulate a wallet announcing itself.
    const fakeWallet = {
      accounts: [
        {
          address: "BDybu9hsWSLuZyNjZ2kz8c7ce6WzGd1ymXuUr3czVu9Z",
          chains: ["solana:mainnet"],
          features: [],
        },
      ],
      chains: ["solana:mainnet"],
      features: {
        "standard:connect": { connect: () => Promise.resolve({ accounts: [] }), version: "1.0.0" },
      },
      name: "TestSolanaWallet",
      version: "1.0.0",
    };
    for (const listener of listeners) {
      listener(fakeWallet);
    }
    expect(seen).toContain("wallet-standard:testsolanawallet");
    unsubscribe();
  });

  it("silently exits when @wallet-standard/app is unavailable (catch path)", async () => {
    vi.doMock("@wallet-standard/app", () => {
      throw new Error("module not installed");
    });
    const { discoverSvmAdapters: subject } = await import("../wallet-standard");
    const onAdapter = vi.fn();
    const unsubscribe = subject(onAdapter);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
    expect(onAdapter).not.toHaveBeenCalled();
    unsubscribe();
  });
});
