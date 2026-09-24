import type { ChainPlatform, PlatformDiscoverer, WalletAdapter } from "@usebutr/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runDiscoverers } from "../discovery-bus";

import { createAdapter } from "./helpers";

type Fallback = NonNullable<PlatformDiscoverer["fallback"]>;

/** A discoverer that announces `ids` synchronously, with a spied fallback. */
const fakeDiscoverer = (platform: ChainPlatform, ...ids: ReadonlyArray<string>) => {
  const unsubscribe = vi.fn<() => void>();
  const fallback = vi.fn<Fallback["subscribe"]>(() => () => {});
  const discoverer: PlatformDiscoverer = {
    fallback: { subscribe: fallback },
    subscribe: (emit) => {
      for (const id of ids) {
        emit(createAdapter(id, platform));
      }
      return unsubscribe;
    },
  };
  return { discoverer, fallback, unsubscribe };
};

const announced = (onAdapter: ReturnType<typeof vi.fn<(adapter: WalletAdapter) => void>>) =>
  onAdapter.mock.calls.map(([adapter]) => adapter.id);

describe("runDiscoverers", () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it("dedupes adapters by id within and across discoverers", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const evm = fakeDiscoverer("evm", "a", "a", "b");
    const other = fakeDiscoverer("evm", "b", "c");

    runDiscoverers(
      [
        ["evm", evm.discoverer],
        ["evm", other.discoverer],
      ],
      onAdapter,
    );

    expect(announced(onAdapter)).toEqual(["a", "b", "c"]);
  });

  it("runs fallbacks unless disabled", () => {
    const evm = fakeDiscoverer("evm");
    runDiscoverers([["evm", evm.discoverer]], () => {});
    expect(evm.fallback).toHaveBeenCalledOnce();

    const quiet = fakeDiscoverer("evm");
    runDiscoverers([["evm", quiet.discoverer]], () => {}, { fallbacks: false });
    expect(quiet.fallback).not.toHaveBeenCalled();
  });

  it("tells a fallback whether its own platform has spoken, not any platform", () => {
    const svm = fakeDiscoverer("svm", "phantom-svm");
    const evm = fakeDiscoverer("evm");

    runDiscoverers(
      [
        ["svm", svm.discoverer],
        ["evm", evm.discoverer],
      ],
      () => {},
    );

    const [[, options] = []] = evm.fallback.mock.calls;
    expect(options?.hasAnyPrimaryAdapter()).toBe(false);
  });

  it("tells a fallback when its own platform has spoken", () => {
    const evm = fakeDiscoverer("evm", "io.metamask");

    runDiscoverers([["evm", evm.discoverer]], () => {});

    const [[, options] = []] = evm.fallback.mock.calls;
    expect(options?.hasAnyPrimaryAdapter()).toBe(true);
  });

  it("unsubscribes every channel once, even when one throws", () => {
    const throwing = fakeDiscoverer("svm");
    throwing.unsubscribe.mockImplementation(() => {
      throw new Error("boom");
    });
    const healthy = fakeDiscoverer("sui");
    const stop = runDiscoverers(
      [
        ["svm", throwing.discoverer],
        ["sui", healthy.discoverer],
      ],
      () => {},
    );

    stop();
    stop();

    expect(throwing.unsubscribe).toHaveBeenCalledOnce();
    expect(healthy.unsubscribe).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledOnce();
  });
});
