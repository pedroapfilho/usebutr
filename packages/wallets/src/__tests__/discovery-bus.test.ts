import type { ChainPlatform, WalletAdapter } from "@usebutr/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SETTLE_MS, createDiscoveryBus } from "../discovery-bus";

import { createAdapter } from "./helpers";

const named = (id: string, name: string, platform: ChainPlatform = "bitcoin"): WalletAdapter => ({
  ...createAdapter(id, platform),
  name,
});

const setup = () => {
  const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
  const bus = createDiscoveryBus(onAdapter);
  const listed = () => onAdapter.mock.calls.map(([adapter]) => adapter.id);
  return { bus, listed };
};

describe("createDiscoveryBus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("lists primary adapters as announced, once per id", () => {
    const { bus, listed } = setup();

    bus.primary(createAdapter("a"));
    bus.primary(createAdapter("a"));
    bus.primary(createAdapter("b"));

    expect(listed()).toEqual(["a", "b"]);
  });

  it("holds fallbacks until the settle window after ready closes", () => {
    const { bus, listed } = setup();

    bus.fallback(named("injected:unisat", "Unisat"));
    vi.advanceTimersByTime(SETTLE_MS * 10);
    expect(listed()).toEqual([]);

    bus.ready();
    vi.advanceTimersByTime(SETTLE_MS - 1);
    expect(listed()).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(listed()).toEqual(["injected:unisat"]);

    bus.fallback(named("injected:okx", "OKX Wallet (Bitcoin)"));
    expect(listed()).toEqual(["injected:unisat", "injected:okx"]);
  });

  it("drops a fallback for a wallet a primary channel listed, and keeps unrelated ones", () => {
    const { bus, listed } = setup();

    bus.primary(named("ws:okx", "OKX Wallet"));
    bus.fallback(named("injected:okx", "OKX Wallet (Bitcoin)"));
    bus.fallback(named("injected:unisat", "Unisat"));
    bus.ready();
    vi.advanceTimersByTime(SETTLE_MS);

    expect(listed()).toEqual(["ws:okx", "injected:unisat"]);
  });

  it("drops a primary adapter for a wallet a fallback already listed", () => {
    const { bus, listed } = setup();

    bus.ready();
    vi.advanceTimersByTime(SETTLE_MS);
    bus.fallback(named("injected:xverse", "Xverse"));
    bus.primary(named("ws:xverse", "Xverse"));

    expect(listed()).toEqual(["injected:xverse"]);
  });

  it("matches wallets within one platform only", () => {
    const { bus, listed } = setup();

    bus.primary(named("svm:phantom", "Phantom", "svm"));
    bus.fallback(named("btc:phantom", "Phantom", "bitcoin"));
    bus.ready();
    vi.advanceTimersByTime(SETTLE_MS);

    expect(listed()).toEqual(["svm:phantom", "btc:phantom"]);
  });

  it("lists an anonymous fallback only when its platform listed nothing", () => {
    const { bus, listed } = setup();

    bus.primary(createAdapter("io.metamask", "evm"));
    bus.anonymousFallback(createAdapter("injected:legacy", "evm"));
    bus.anonymousFallback(named("injected:bitcoin:legacy", "Browser Bitcoin wallet"));
    bus.ready();
    vi.advanceTimersByTime(SETTLE_MS);

    expect(listed()).toEqual(["io.metamask", "injected:bitcoin:legacy"]);
  });

  it("drops held fallbacks on stop", () => {
    const { bus, listed } = setup();

    bus.fallback(named("injected:unisat", "Unisat"));
    bus.ready();
    bus.stop();
    vi.advanceTimersByTime(SETTLE_MS);

    expect(listed()).toEqual([]);
  });
});
