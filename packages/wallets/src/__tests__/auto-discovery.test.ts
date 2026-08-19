import type { WalletAdapter } from "@usebutr/core";
import { describe, expect, it, vi } from "vitest";

import { autoDiscovery } from "../auto-discovery";
import type { DiscoverWalletAdapters } from "../auto-discovery";
import type { DiscoverOptions } from "../discover";

const createDiscover = () => vi.fn<DiscoverWalletAdapters>(() => () => {});

describe("autoDiscovery", () => {
  it("returns a WalletSource whose subscribe returns an unsubscribe fn", () => {
    const source = autoDiscovery({ evm: false, injected: false, svm: false }, createDiscover());
    expect(typeof source.subscribe).toBe("function");
    const unsubscribe = source.subscribe(() => {});
    expect(typeof unsubscribe).toBe("function");
    unsubscribe();
  });

  it("subscribe with evm:false svm:false returns a no-op unsubscribe fn", () => {
    const source = autoDiscovery({ evm: false, svm: false }, createDiscover());
    const unsubscribe = source.subscribe(() => {});
    expect(typeof unsubscribe).toBe("function");
    expect(() => {
      unsubscribe();
    }).not.toThrow();
  });

  it("forwards discovery options", () => {
    const discover = createDiscover();
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const options: DiscoverOptions = { evm: true, svm: false };
    const source = autoDiscovery(options, discover);
    const unsubscribe = source.subscribe(onAdapter);

    expect(discover).toHaveBeenCalledOnce();
    expect(discover).toHaveBeenCalledWith(onAdapter, options);

    unsubscribe();
  });
});
