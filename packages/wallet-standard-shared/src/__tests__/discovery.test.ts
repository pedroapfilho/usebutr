import { afterEach, describe, expect, it, vi } from "vitest";

import { discoverWalletStandard } from "../discovery";

// Simulate the optional peer dep being absent: the dynamic import rejects.
vi.mock("@wallet-standard/app", () => {
  throw new Error("Cannot find module '@wallet-standard/app'");
});

describe("discoverWalletStandard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("warns once when @wallet-standard/app is not installed", async () => {
    const warn = vi.spyOn(console, "warn").mockReturnValue(undefined);
    const onAdapter = vi.fn();

    // Two calls stand in for two platforms (e.g. SVM + Sui) both discovering.
    const unsubscribeA = discoverWalletStandard(onAdapter, () => null);
    const unsubscribeB = discoverWalletStandard(onAdapter, () => null);

    await vi.waitFor(() => expect(warn).toHaveBeenCalled());

    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain("@wallet-standard/app");
    expect(onAdapter).not.toHaveBeenCalled();

    unsubscribeA();
    unsubscribeB();
  });
});
