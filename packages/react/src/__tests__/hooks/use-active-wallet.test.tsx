import { describe, expect, it } from "vitest";

import { useActiveWallet } from "../../hooks/selectors";
import { renderHookWithProvider } from "../render-with-provider";

describe("useActiveWallet", () => {
  it("returns undefined when nothing is connected", () => {
    const { result } = renderHookWithProvider(() => useActiveWallet());
    expect(result.current).toBeUndefined();
  });
});
