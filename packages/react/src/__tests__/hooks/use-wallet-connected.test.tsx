import { describe, expect, it } from "vitest";

import { useWalletConnected } from "../../hooks/selectors";
import { renderHookWithProvider } from "../render-with-provider";

describe("useWalletConnected", () => {
  it("is false when pool is empty", () => {
    const { result } = renderHookWithProvider(() => useWalletConnected());
    expect(result.current).toBe(false);
  });
});
