import type { WalletAdapter } from "@usebutr/core";
import type {
  StandardConnectFeature,
  WalletStandardModuleLoader,
  WalletStandardWallet,
} from "@usebutr/wallet-standard-shared";
import { describe, expect, it, vi } from "vitest";

import { suiDiscoverer } from "../discoverer";
import { discoverSuiAdapters } from "../wallet-standard-adapter";

const connectFeature: StandardConnectFeature = {
  connect: () => Promise.resolve({ accounts: [] }),
  version: "1.0.0",
};

const wallet = (name: string, chains: ReadonlyArray<string>): WalletStandardWallet => ({
  accounts: [],
  chains,
  features: { "standard:connect": connectFeature },
  icon: "",
  name,
  version: "1.0.0",
});

const loaderFor =
  (wallets: ReadonlyArray<WalletStandardWallet>): WalletStandardModuleLoader =>
  () =>
    Promise.resolve({ getWallets: () => ({ get: () => wallets, on: () => () => {} }) });

describe("suiDiscoverer", () => {
  it("exposes Wallet Standard discovery with no legacy fallback", () => {
    expect(suiDiscoverer.subscribe).toBe(discoverSuiAdapters);
    expect(suiDiscoverer.fallback).toBeUndefined();
  });
});

describe("discoverSuiAdapters", () => {
  it("announces only wallets that speak Sui", async () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const unsubscribe = discoverSuiAdapters(
      onAdapter,
      loaderFor([wallet("Suiet", ["sui:mainnet"]), wallet("Solflare", ["solana:mainnet"])]),
    );

    await vi.waitFor(() => {
      expect(onAdapter).toHaveBeenCalledTimes(1);
    });
    expect(onAdapter.mock.calls[0]?.[0].id).toBe("wallet-standard:sui-suiet");
    unsubscribe();
  });

  it("returns an unsubscribe that is safe before the module loads", () => {
    const unsubscribe = discoverSuiAdapters(() => {}, loaderFor([]));
    expect(() => {
      unsubscribe();
    }).not.toThrow();
  });
});
