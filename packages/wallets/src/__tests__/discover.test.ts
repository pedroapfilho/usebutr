import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { KNOWN_DISCOVERERS, discoverWalletAdapters, resolveDiscoverOptions } from "../discover";

describe("resolveDiscoverOptions", () => {
  it("active=false when input is undefined", () => {
    expect(resolveDiscoverOptions(undefined)).toEqual({
      active: false,
      bitcoin: false,
      evm: false,
      injected: false,
      injectedBitcoin: false,
      polkadot: false,
      polkadotWalletStandard: false,
      sui: false,
      svm: false,
    });
  });

  it("active=false when input is false", () => {
    expect(resolveDiscoverOptions(false)).toEqual({
      active: false,
      bitcoin: false,
      evm: false,
      injected: false,
      injectedBitcoin: false,
      polkadot: false,
      polkadotWalletStandard: false,
      sui: false,
      svm: false,
    });
  });

  it("enables every flag when input is true", () => {
    expect(resolveDiscoverOptions(true)).toEqual({
      active: true,
      bitcoin: true,
      evm: true,
      injected: true,
      injectedBitcoin: true,
      polkadot: true,
      polkadotWalletStandard: true,
      sui: true,
      svm: true,
    });
  });

  it("treats object form as opt-in (other platforms default off when not set)", () => {
    expect(resolveDiscoverOptions({ evm: true })).toEqual({
      active: true,
      bitcoin: false,
      evm: true,
      injected: true,
      injectedBitcoin: false,
      polkadot: false,
      polkadotWalletStandard: false,
      sui: false,
      svm: false,
    });
  });

  it("injected defaults to true alongside evm, but to false when evm is off", () => {
    expect(resolveDiscoverOptions({ evm: false, svm: true })).toEqual({
      active: true,
      bitcoin: false,
      evm: false,
      injected: false,
      injectedBitcoin: false,
      polkadot: false,
      polkadotWalletStandard: false,
      sui: false,
      svm: true,
    });
  });

  it("injected: false explicitly disables the fallback even with evm on", () => {
    expect(resolveDiscoverOptions({ evm: true, injected: false })).toEqual({
      active: true,
      bitcoin: false,
      evm: true,
      injected: false,
      injectedBitcoin: false,
      polkadot: false,
      polkadotWalletStandard: false,
      sui: false,
      svm: false,
    });
  });

  it("injectedBitcoin defaults to true alongside bitcoin, off when bitcoin is off", () => {
    expect(resolveDiscoverOptions({ bitcoin: true })).toEqual({
      active: true,
      bitcoin: true,
      evm: false,
      injected: false,
      injectedBitcoin: true,
      polkadot: false,
      polkadotWalletStandard: false,
      sui: false,
      svm: false,
    });
  });

  it("injectedBitcoin: false explicitly disables the Bitcoin fallback", () => {
    expect(resolveDiscoverOptions({ bitcoin: true, injectedBitcoin: false })).toEqual({
      active: true,
      bitcoin: true,
      evm: false,
      injected: false,
      injectedBitcoin: false,
      polkadot: false,
      polkadotWalletStandard: false,
      sui: false,
      svm: false,
    });
  });

  it("sui can be enabled standalone", () => {
    expect(resolveDiscoverOptions({ sui: true })).toEqual({
      active: true,
      bitcoin: false,
      evm: false,
      injected: false,
      injectedBitcoin: false,
      polkadot: false,
      polkadotWalletStandard: false,
      sui: true,
      svm: false,
    });
  });
});

describe("discoverWalletAdapters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns an unsubscribe function with default options", () => {
    const unsubscribe = discoverWalletAdapters(() => {});
    expect(typeof unsubscribe).toBe("function");
    expect(() => {
      unsubscribe();
    }).not.toThrow();
  });

  it("doesn't throw when only the svm path is enabled (no EVM dispatch)", () => {
    const unsubscribe = discoverWalletAdapters(() => {}, { svm: true });
    expect(() => {
      unsubscribe();
    }).not.toThrow();
  });

  it("doesn't throw when only sui is enabled", () => {
    const unsubscribe = discoverWalletAdapters(() => {}, { sui: true });
    expect(() => {
      unsubscribe();
    }).not.toThrow();
  });

  it("doesn't throw when only bitcoin is enabled (without injected fallback)", () => {
    const unsubscribe = discoverWalletAdapters(() => {}, {
      bitcoin: true,
      injectedBitcoin: false,
    });
    expect(() => {
      unsubscribe();
    }).not.toThrow();
  });

  it("disabling every platform returns a no-op unsubscribe", () => {
    const unsubscribe = discoverWalletAdapters(() => {}, {
      bitcoin: false,
      evm: false,
      sui: false,
      svm: false,
    });
    expect(typeof unsubscribe).toBe("function");
    expect(() => {
      unsubscribe();
    }).not.toThrow();
  });
});

describe("polkadot wiring", () => {
  it("registers a polkadot discoverer", () => {
    expect(KNOWN_DISCOVERERS.polkadot.platform).toBe("polkadot");
  });

  it("enables polkadot + its WS fallback under auto=true", () => {
    const resolved = resolveDiscoverOptions(true);
    expect(resolved.polkadot).toBe(true);
    expect(resolved.polkadotWalletStandard).toBe(true);
  });

  it("opt-in: { polkadot: true } enables polkadot with WS fallback by default", () => {
    const resolved = resolveDiscoverOptions({ polkadot: true });
    expect(resolved.polkadot).toBe(true);
    expect(resolved.polkadotWalletStandard).toBe(true);
    expect(resolved.evm).toBe(false);
  });

  it("opt-in: WS fallback can be disabled explicitly", () => {
    const resolved = resolveDiscoverOptions({ polkadot: true, polkadotWalletStandard: false });
    expect(resolved.polkadot).toBe(true);
    expect(resolved.polkadotWalletStandard).toBe(false);
  });
});
