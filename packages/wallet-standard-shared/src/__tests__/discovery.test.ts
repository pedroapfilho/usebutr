import { afterEach, describe, expect, it, vi } from "vitest";

import { discoverWalletStandard } from "../discovery";

const loadMissingModule = () =>
  Promise.reject(new Error("Cannot find module '@wallet-standard/app'"));

describe("discoverWalletStandard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("warns once when @wallet-standard/app is not installed", async () => {
    const warn = vi.spyOn(console, "warn").mockReturnValue(undefined);
    const onAdapter = vi.fn<() => void>();
    const unsubscribeA = discoverWalletStandard(onAdapter, () => null, loadMissingModule);
    const unsubscribeB = discoverWalletStandard(onAdapter, () => null, loadMissingModule);

    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalled();
    });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain("@wallet-standard/app");
    expect(warn.mock.calls[0]?.[1]).toBeInstanceOf(Error);
    expect(onAdapter).not.toHaveBeenCalled();

    unsubscribeA();
    unsubscribeB();
  });
});
