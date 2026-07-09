import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useIsConnecting, useWalletStore } from "../../hooks/selectors";
import { renderHookWithProvider } from "../render-with-provider";

describe("useIsConnecting", () => {
  it("is false initially", () => {
    const { result } = renderHookWithProvider(() => useIsConnecting());
    expect(result.current).toBe(false);
  });

  it("flips to true while the store reports connecting", () => {
    const store = renderHookWithProvider(() => useWalletStore((s) => s));
    const hook = renderHookWithProvider(() => useIsConnecting());
    expect(hook.result.current).toBe(false);
    act(() => {
      store.config.createConnector("noop");
    });
    expect(hook.result.current).toBe(false);
  });
});
