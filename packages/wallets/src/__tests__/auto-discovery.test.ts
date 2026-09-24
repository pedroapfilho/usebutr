import { describe, expect, it, vi } from "vitest";

import { autoDiscovery } from "../auto-discovery";

describe("autoDiscovery", () => {
  it("is a source whose unsubscribe is callable", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onAdapter = vi.fn<Parameters<ReturnType<typeof autoDiscovery>>[0]>();

    const unsubscribe = autoDiscovery([])(onAdapter);

    expect(() => {
      unsubscribe();
    }).not.toThrow();
    expect(onAdapter).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
