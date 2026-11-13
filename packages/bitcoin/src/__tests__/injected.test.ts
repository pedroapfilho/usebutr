import type { WalletAdapter } from "@usebutr/core";
import { afterEach, assert, describe, expect, it, vi } from "vitest";

import { discoverInjectedBitcoinAdapter, discoverLegacyBitcoinAdapter } from "../injected";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("discoverInjectedBitcoinAdapter", () => {
  it("skips emission when no provider is present", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();

    vi.stubGlobal("window", {});
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter);

    unsubscribe();
    expect(onAdapter).not.toHaveBeenCalled();
  });

  it("emits a unisat adapter when window.unisat is present", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();

    const unisat = {
      getAccounts: vi.fn().mockResolvedValue(["bc1qaddr"]),
      pushPsbt: vi.fn(),
      requestAccounts: vi.fn().mockResolvedValue(["bc1qaddr"]),
      signMessage: vi.fn(),
      signPsbt: vi.fn(),
    };

    vi.stubGlobal("window", { unisat });
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter);

    unsubscribe();
    expect(onAdapter).toHaveBeenCalledTimes(1);
    const adapter = onAdapter.mock.calls[0]?.[0];
    assert(adapter, "expected the unisat adapter to be emitted");
    expect(adapter.id).toBe("injected:bitcoin:unisat");
    expect(adapter.chainPlatform).toBe("bitcoin");
  });

  it("emits multiple adapters when multiple injected providers are present", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();

    const unisat = {
      getAccounts: vi.fn().mockResolvedValue([]),
      requestAccounts: vi.fn(),
      signMessage: vi.fn(),
      signPsbt: vi.fn(),
    };

    const xverse = { request: vi.fn() };

    vi.stubGlobal("window", { unisat, XverseProviders: { BitcoinProvider: xverse } });
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter);

    unsubscribe();
    expect(onAdapter).toHaveBeenCalledTimes(2);
    const ids = onAdapter.mock.calls.map((call) => call[0].id);
    expect(ids).toContain("injected:bitcoin:unisat");
    expect(ids).toContain("injected:bitcoin:xverse");
  });

  it("emits an OKX adapter from window.okxwallet.bitcoin", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();

    const bitcoin = {
      getAccounts: vi.fn(),
      requestAccounts: vi.fn(),
      signMessage: vi.fn(),
      signPsbt: vi.fn(),
    };

    vi.stubGlobal("window", { okxwallet: { bitcoin } });
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter);

    unsubscribe();
    expect(onAdapter.mock.calls.map((call) => call[0].id)).toEqual(["injected:bitcoin:okx"]);
    expect(onAdapter.mock.calls[0]?.[0]).toMatchObject({ name: "OKX Wallet", walletKey: "okx" });
  });

  it("emits one adapter when a wallet aliases itself across several globals", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();

    const shared = {
      getAccounts: vi.fn(),
      requestAccounts: vi.fn(),
      signMessage: vi.fn(),
      signPsbt: vi.fn(),
    };

    vi.stubGlobal("window", { okxwallet: { bitcoin: shared }, unisat: shared });
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter);

    unsubscribe();
    expect(onAdapter.mock.calls.map((call) => call[0].id)).toEqual(["injected:bitcoin:unisat"]);
  });

  it("skips emission outside a browser", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();

    vi.stubGlobal("window", undefined);
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter);

    unsubscribe();
    expect(onAdapter).not.toHaveBeenCalled();
  });
});

const provider = () => ({
  getAccounts: vi.fn(),
  requestAccounts: vi.fn(),
  signMessage: vi.fn(),
  signPsbt: vi.fn(),
});

describe("discoverLegacyBitcoinAdapter", () => {
  it("emits a legacy adapter from window.btc", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    vi.stubGlobal("window", { btc: provider() });
    const unsubscribe = discoverLegacyBitcoinAdapter(onAdapter);
    unsubscribe();
    expect(onAdapter.mock.calls.map((call) => call[0].id)).toEqual(["injected:bitcoin:legacy"]);
    expect(onAdapter.mock.calls[0]?.[0].name).toBe("Browser Bitcoin wallet");
  });

  it("skips window.btc when it aliases a named wallet", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const shared = provider();
    vi.stubGlobal("window", { btc: shared, unisat: shared });
    discoverLegacyBitcoinAdapter(onAdapter);
    vi.stubGlobal("window", { btc: shared, okxwallet: { bitcoin: shared } });
    discoverLegacyBitcoinAdapter(onAdapter);
    expect(onAdapter).not.toHaveBeenCalled();
  });

  it("skips emission outside a browser", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    vi.stubGlobal("window", undefined);
    discoverLegacyBitcoinAdapter(onAdapter);
    expect(onAdapter).not.toHaveBeenCalled();
  });
});
