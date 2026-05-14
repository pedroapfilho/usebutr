import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { discoverWalletAdapters, resolveDiscoverOptions } from "../discover";

describe("resolveDiscoverOptions", () => {
  it("active=false when input is undefined", () => {
    expect(resolveDiscoverOptions(undefined)).toEqual({
      active: false,
      evm: false,
      injected: false,
      svm: false,
    });
  });

  it("active=false when input is false", () => {
    expect(resolveDiscoverOptions(false)).toEqual({
      active: false,
      evm: false,
      injected: false,
      svm: false,
    });
  });

  it("enables every flag when input is true", () => {
    expect(resolveDiscoverOptions(true)).toEqual({
      active: true,
      evm: true,
      injected: true,
      svm: true,
    });
  });

  it("treats object form as opt-in (svm default off when not set)", () => {
    expect(resolveDiscoverOptions({ evm: true })).toEqual({
      active: true,
      evm: true,
      injected: true,
      svm: false,
    });
  });

  it("injected defaults to true alongside evm, but to false when evm is off", () => {
    expect(resolveDiscoverOptions({ evm: false, svm: true })).toEqual({
      active: true,
      evm: false,
      injected: false,
      svm: true,
    });
  });

  it("injected: false explicitly disables the fallback even with evm on", () => {
    expect(resolveDiscoverOptions({ evm: true, injected: false })).toEqual({
      active: true,
      evm: true,
      injected: false,
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
    expect(() => unsubscribe()).not.toThrow();
  });

  it("doesn't throw when only the svm path is enabled (no EVM dispatch)", () => {
    const unsubscribe = discoverWalletAdapters(() => {}, { svm: true });
    expect(() => unsubscribe()).not.toThrow();
  });

  it("disabling both platforms returns a no-op unsubscribe", () => {
    const unsubscribe = discoverWalletAdapters(() => {}, { evm: false, svm: false });
    expect(typeof unsubscribe).toBe("function");
    expect(() => unsubscribe()).not.toThrow();
  });
});
