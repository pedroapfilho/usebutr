import { act, renderHook } from "@testing-library/react";
import type { WalletAdapter, WalletSource } from "@usebutr/core";
import { createFakeAdapter, createFakePersistence } from "@usebutr/testing";
import React, { type PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";

import { WalletManagerProvider } from "../../context";
import { useDiscoveredWalletsByPlatform } from "../../hooks/grouped";

const sourceOf = (...adapters: Array<WalletAdapter>): WalletSource => ({
  subscribe: (onAdapter) => {
    for (const adapter of adapters) {
      onAdapter(adapter);
    }
    return () => {};
  },
});

// eslint-disable-next-line react/display-name -- test wrapper factory, display name not needed
const wrap =
  (discovery?: WalletSource) =>
  ({ children }: PropsWithChildren) => (
    <WalletManagerProvider discovery={discovery} storage={createFakePersistence()}>
      {children}
    </WalletManagerProvider>
  );

describe("useDiscoveredWalletsByPlatform", () => {
  it("returns an empty map without a discovery source", () => {
    const { result } = renderHook(() => useDiscoveredWalletsByPlatform(), { wrapper: wrap() });
    expect(result.current.size).toBe(0);
  });

  it("buckets one multi-chain brand's adapters into their platforms", async () => {
    const discovery = sourceOf(
      createFakeAdapter({ chainPlatform: "svm", id: "phantom-svm", name: "Phantom" }),
      createFakeAdapter({ chainPlatform: "evm", id: "phantom-evm", name: "Phantom" }),
      createFakeAdapter({ chainPlatform: "evm", id: "metamask", name: "MetaMask" }),
    );
    const { result } = renderHook(() => useDiscoveredWalletsByPlatform(), {
      wrapper: wrap(discovery),
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect([...result.current.keys()]).toEqual(["evm", "svm"]);
    expect(result.current.get("evm")?.map((a) => a.id)).toEqual(["phantom-evm", "metamask"]);
    expect(result.current.get("svm")?.map((a) => a.id)).toEqual(["phantom-svm"]);
  });

  it("keeps a stable reference while the discovered list is unchanged", async () => {
    const discovery = sourceOf(createFakeAdapter({ chainPlatform: "evm", id: "metamask" }));
    const { rerender, result } = renderHook(() => useDiscoveredWalletsByPlatform(), {
      wrapper: wrap(discovery),
    });

    await act(async () => {
      await Promise.resolve();
    });
    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
  });
});
