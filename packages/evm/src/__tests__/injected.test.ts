import type { EvmAdapter, WalletSource } from "@usebutr/core";
import { describe, expect, it, vi } from "vitest";

import type { Eip1193Provider } from "../eip1193";
import { discoverInjectedAdapter } from "../injected";

const fakeProvider: Eip1193Provider = {
  on() {},
  removeListener() {},
  request() {
    return Promise.resolve(undefined);
  },
};

describe("discoverInjectedAdapter", () => {
  it("is a wallet source as-is", () => {
    const source: WalletSource = discoverInjectedAdapter;
    expect(source).toBe(discoverInjectedAdapter);
  });

  it("emits a generic adapter on subscribe when window.ethereum exists", () => {
    const callback = vi.fn<(adapter: EvmAdapter) => void>();
    const unsubscribe = discoverInjectedAdapter(callback, { target: { ethereum: fakeProvider } });

    expect(callback).toHaveBeenCalledOnce();
    const [adapter] = callback.mock.calls[0] ?? [];
    expect(adapter?.id).toBe("injected:legacy");
    expect(adapter?.name).toBe("Browser wallet");
    expect(adapter?.chainPlatform).toBe("evm");
    expect(() => {
      unsubscribe();
    }).not.toThrow();
  });

  it("skips emission when window.ethereum is undefined", () => {
    const callback = vi.fn<(adapter: EvmAdapter) => void>();
    discoverInjectedAdapter(callback, { target: {} });
    expect(callback).not.toHaveBeenCalled();
  });

  it("skips emission when ethereum lacks a request method (sanity check)", () => {
    const callback = vi.fn<(adapter: EvmAdapter) => void>();
    discoverInjectedAdapter(callback, { target: { ethereum: { on() {}, removeListener() {} } } });
    expect(callback).not.toHaveBeenCalled();
  });

  it("skips emission when the host is explicitly absent", () => {
    const callback = vi.fn<(adapter: EvmAdapter) => void>();
    discoverInjectedAdapter(callback, { target: null });
    expect(callback).not.toHaveBeenCalled();
  });
});
