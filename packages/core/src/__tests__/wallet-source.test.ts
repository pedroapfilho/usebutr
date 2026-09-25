import { afterEach, describe, expect, it, vi } from "vitest";

import type { WalletAdapter } from "../types";
import { fromAdapters } from "../wallet-source";

import { evmAdapter, flush, svmAdapter } from "./helpers";

const collect = (source: ReturnType<typeof fromAdapters>) => {
  const announced: Array<WalletAdapter> = [];
  const unsubscribe = source((adapter) => {
    announced.push(adapter);
  });
  return { announced, unsubscribe };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fromAdapters", () => {
  it("announces every adapter of an array, in order", async () => {
    const adapters = [evmAdapter("walletconnect"), svmAdapter("ledger")];
    const { announced } = collect(fromAdapters(adapters));
    await flush();
    expect(announced).toEqual(adapters);
  });

  it("announces the adapters of a promise once it resolves", async () => {
    const pending = Promise.withResolvers<ReadonlyArray<WalletAdapter>>();
    const { announced } = collect(fromAdapters(pending.promise));
    await flush();
    expect(announced).toEqual([]);

    const adapter = evmAdapter("walletconnect");
    pending.resolve([adapter]);
    await flush();
    expect(announced).toEqual([adapter]);
  });

  it("announces nothing after unsubscribe", async () => {
    const pending = Promise.withResolvers<ReadonlyArray<WalletAdapter>>();
    const { announced, unsubscribe } = collect(fromAdapters(pending.promise));
    unsubscribe();
    pending.resolve([evmAdapter("walletconnect")]);
    await flush();
    expect(announced).toEqual([]);
  });

  it("can be subscribed again, as a StrictMode remount does", async () => {
    const adapter = evmAdapter("walletconnect");
    const source = fromAdapters([adapter]);
    collect(source).unsubscribe();
    const { announced } = collect(source);
    await flush();
    expect(announced).toEqual([adapter]);
  });

  it("logs a rejected promise and contributes nothing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const failed = Promise.reject(new Error("no project id"));
    const { announced } = collect(fromAdapters(failed));
    await flush();
    expect(announced).toEqual([]);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("fromAdapters: adapters failed to load"),
      expect.any(Error),
    );
  });
});
