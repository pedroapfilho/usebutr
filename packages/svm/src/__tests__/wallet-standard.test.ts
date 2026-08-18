import type { WalletAdapter } from "@usebutr/core";
import type {
  StandardConnectFeature,
  WalletsApp,
  WalletStandardAppModule,
  WalletStandardWallet,
} from "@usebutr/wallet-standard-shared";
import { describe, expect, it, vi } from "vitest";

import { discoverSvmAdapters } from "../wallet-standard-adapter";

const loadMissingModule = (): Promise<WalletStandardAppModule> =>
  Promise.reject(new Error("module not installed"));

describe("discoverSvmAdapters", () => {
  it("returns a synchronous unsubscribe even before the import resolves", () => {
    const unsubscribe = discoverSvmAdapters(() => {});
    expect(typeof unsubscribe).toBe("function");
    expect(() => {
      unsubscribe();
    }).not.toThrow();
  });

  it("emits adapters announced via the Wallet Standard `register` event", async () => {
    const listeners = new Set<(...wallets: ReadonlyArray<WalletStandardWallet>) => void>();
    const fakeApp: WalletsApp = {
      get: () => [],
      on: (event, handler) => {
        if (event !== "register") {
          return () => {};
        }
        listeners.add(handler);
        return () => {
          listeners.delete(handler);
        };
      },
    };
    const loadModule = (): Promise<WalletStandardAppModule> =>
      Promise.resolve({ getWallets: () => fakeApp });
    const seen: Array<string> = [];
    const unsubscribe = discoverSvmAdapters((adapter) => {
      seen.push(adapter.id);
    }, loadModule);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
    const connectFeature: StandardConnectFeature = {
      connect: () => Promise.resolve({ accounts: [] }),
      version: "1.0.0",
    };
    const fakeWallet: WalletStandardWallet = {
      accounts: [
        {
          address: "BDybu9hsWSLuZyNjZ2kz8c7ce6WzGd1ymXuUr3czVu9Z",
          chains: ["solana:mainnet"],
          features: [],
        },
      ],
      chains: ["solana:mainnet"],
      features: {
        "standard:connect": connectFeature,
      },
      icon: "",
      name: "TestSolanaWallet",
      version: "1.0.0",
    };
    for (const listener of listeners) {
      listener(fakeWallet);
    }
    expect(seen).toContain("wallet-standard:svm-testsolanawallet");
    unsubscribe();
  });

  it("silently exits when @wallet-standard/app is unavailable (catch path)", async () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const unsubscribe = discoverSvmAdapters(onAdapter, loadMissingModule);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
    expect(onAdapter).not.toHaveBeenCalled();
    unsubscribe();
  });
});
