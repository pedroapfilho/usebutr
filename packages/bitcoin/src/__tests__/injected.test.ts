import type { WalletAdapter } from "@usebutr/core";
import { describe, expect, it, vi } from "vitest";

import { discoverInjectedBitcoinAdapter } from "../injected";

const flushSettle = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 60);
  });

describe("discoverInjectedBitcoinAdapter", () => {
  it("skips emission when no provider is present", async () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter, {
      settleMs: 10,
      target: {},
    });
    await flushSettle();
    unsubscribe();
    expect(onAdapter).not.toHaveBeenCalled();
  });

  it("emits a unisat adapter when window.unisat is present", async () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const unisat = {
      getAccounts: vi.fn().mockResolvedValue(["bc1qaddr"]),
      pushPsbt: vi.fn(),
      requestAccounts: vi.fn().mockResolvedValue(["bc1qaddr"]),
      signMessage: vi.fn(),
      signPsbt: vi.fn(),
    };
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter, {
      settleMs: 10,
      target: { unisat },
    });
    await flushSettle();
    unsubscribe();
    expect(onAdapter).toHaveBeenCalledTimes(1);
    const adapter = onAdapter.mock.calls[0]?.[0];
    expect(adapter.id).toBe("injected:bitcoin:unisat");
    expect(adapter.chainPlatform).toBe("bitcoin");
  });

  it("emits multiple adapters when multiple injected providers are present", async () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const unisat = {
      getAccounts: vi.fn().mockResolvedValue([]),
      requestAccounts: vi.fn(),
      signMessage: vi.fn(),
      signPsbt: vi.fn(),
    };
    const xverse = { request: vi.fn() };
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter, {
      settleMs: 10,
      target: { unisat, XverseProviders: { BitcoinProvider: xverse } },
    });
    await flushSettle();
    unsubscribe();
    expect(onAdapter).toHaveBeenCalledTimes(2);
    const ids = onAdapter.mock.calls.map((call) => call[0].id);
    expect(ids).toContain("injected:bitcoin:unisat");
    expect(ids).toContain("injected:bitcoin:xverse");
  });

  it("respects hasAnyWalletStandardAdapter — skips emission when a WS adapter exists", async () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const unisat = {
      getAccounts: vi.fn(),
      requestAccounts: vi.fn(),
      signMessage: vi.fn(),
      signPsbt: vi.fn(),
    };
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter, {
      hasAnyWalletStandardAdapter: () => true,
      settleMs: 10,
      target: { unisat },
    });
    await flushSettle();
    unsubscribe();
    expect(onAdapter).not.toHaveBeenCalled();
  });

  it("emits an OKX adapter from window.okxwallet.bitcoin", async () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const bitcoin = {
      getAccounts: vi.fn(),
      requestAccounts: vi.fn(),
      signMessage: vi.fn(),
      signPsbt: vi.fn(),
    };
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter, {
      settleMs: 10,
      target: { okxwallet: { bitcoin } },
    });
    await flushSettle();
    unsubscribe();
    expect(onAdapter.mock.calls.map((call) => call[0].id)).toEqual(["injected:bitcoin:okx"]);
    expect(onAdapter.mock.calls[0]?.[0].name).toBe("OKX Wallet (Bitcoin)");
  });

  it("emits a legacy adapter from window.btc", async () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const btc = {
      getAccounts: vi.fn(),
      requestAccounts: vi.fn(),
      signMessage: vi.fn(),
      signPsbt: vi.fn(),
    };
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter, {
      settleMs: 10,
      target: { btc },
    });
    await flushSettle();
    unsubscribe();
    expect(onAdapter.mock.calls.map((call) => call[0].id)).toEqual(["injected:bitcoin:legacy"]);
    expect(onAdapter.mock.calls[0]?.[0].name).toBe("Browser Bitcoin wallet");
  });

  it("emits one adapter when a wallet aliases itself across several globals", async () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const shared = {
      getAccounts: vi.fn(),
      requestAccounts: vi.fn(),
      signMessage: vi.fn(),
      signPsbt: vi.fn(),
    };
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter, {
      settleMs: 10,
      target: { btc: shared, okxwallet: { bitcoin: shared }, unisat: shared },
    });
    await flushSettle();
    unsubscribe();
    expect(onAdapter.mock.calls.map((call) => call[0].id)).toEqual(["injected:bitcoin:unisat"]);
  });

  it("skips emission when the host is explicitly absent", async () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter, {
      settleMs: 10,
      target: null,
    });
    await flushSettle();
    unsubscribe();
    expect(onAdapter).not.toHaveBeenCalled();
  });

  it("a synchronous unsubscribe before settle cancels emission", async () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const unisat = {
      getAccounts: vi.fn(),
      requestAccounts: vi.fn(),
      signMessage: vi.fn(),
      signPsbt: vi.fn(),
    };
    const unsubscribe = discoverInjectedBitcoinAdapter(onAdapter, {
      settleMs: 50,
      target: { unisat },
    });
    unsubscribe();
    await flushSettle();
    expect(onAdapter).not.toHaveBeenCalled();
  });
});
