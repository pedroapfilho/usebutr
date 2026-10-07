import type { WalletAdapter } from "@usebutr/core";
import { assert, describe, expect, it, vi } from "vitest";

import { discoverInjectedBitcoinAdapter, discoverLegacyBitcoinAdapter } from "../injected";

describe("discoverInjectedBitcoinAdapter", () => {
  it("skips emission when no provider is present", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter, {
      target: {},
    });
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
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter, {
      target: { unisat },
    });
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
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter, {
      target: { unisat, XverseProviders: { BitcoinProvider: xverse } },
    });
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
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter, {
      target: { okxwallet: { bitcoin } },
    });
    unsubscribe();
    expect(onAdapter.mock.calls.map((call) => call[0].id)).toEqual(["injected:bitcoin:okx"]);
    expect(onAdapter.mock.calls[0]?.[0].name).toBe("OKX Wallet (Bitcoin)");
  });

  it("emits one adapter when a wallet aliases itself across several globals", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const shared = {
      getAccounts: vi.fn(),
      requestAccounts: vi.fn(),
      signMessage: vi.fn(),
      signPsbt: vi.fn(),
    };
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter, {
      target: { okxwallet: { bitcoin: shared }, unisat: shared },
    });
    unsubscribe();
    expect(onAdapter.mock.calls.map((call) => call[0].id)).toEqual(["injected:bitcoin:unisat"]);
  });

  it("skips emission when the host is explicitly absent", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter, {
      target: null,
    });
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
    const unsubscribe = discoverLegacyBitcoinAdapter(onAdapter, { target: { btc: provider() } });
    unsubscribe();
    expect(onAdapter.mock.calls.map((call) => call[0].id)).toEqual(["injected:bitcoin:legacy"]);
    expect(onAdapter.mock.calls[0]?.[0].name).toBe("Browser Bitcoin wallet");
  });

  it("skips window.btc when it aliases a named wallet", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const shared = provider();
    discoverLegacyBitcoinAdapter(onAdapter, { target: { btc: shared, unisat: shared } });
    discoverLegacyBitcoinAdapter(onAdapter, {
      target: { btc: shared, okxwallet: { bitcoin: shared } },
    });
    expect(onAdapter).not.toHaveBeenCalled();
  });

  it("skips emission when the host is explicitly absent", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    discoverLegacyBitcoinAdapter(onAdapter, { target: null });
    expect(onAdapter).not.toHaveBeenCalled();
  });
});
