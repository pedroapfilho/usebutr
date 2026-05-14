import React from "react";
import { act, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createFakeAdapter, createFakePersistence } from "@butr/testing";
import { WalletManagerProvider, useWalletStoreContext } from "../context";
import { renderHookWithProvider } from "./render-with-provider";

describe("WalletManagerProvider", () => {
  it("renders children", () => {
    render(
      <WalletManagerProvider
        config={{
          connectors: [],
          createConnector: () => null,
          storage: createFakePersistence(),
        }}
      >
        <div>hello</div>
      </WalletManagerProvider>,
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("hydrates the store on mount and exposes isHydrated via context", async () => {
    const { result } = renderHookWithProvider(() => useWalletStoreContext());
    // Hydration is async — wait for it to settle.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.getState().isHydrated).toBe(true);
  });

  it("seeds the store with the storage pool on first mount", async () => {
    const adapter = createFakeAdapter({ id: "fake-evm", chainPlatform: "evm" });
    const storage = createFakePersistence({
      activeConnectorId: adapter.id,
      pool: {
        [adapter.id]: {
          account: {
            chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" },
            id: "eip155:1:0x0",
            walletAddress: "0x0",
          },
          accounts: [
            {
              chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" },
              id: "eip155:1:0x0",
              walletAddress: "0x0",
            },
          ],
          chainPlatform: "evm",
          connectorId: adapter.id,
        },
      },
    });
    const { result } = renderHookWithProvider(() => useWalletStoreContext(), {
      adapters: [adapter],
      storage,
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.getState().pool.has(adapter.id)).toBe(true);
    expect(result.current.getState().activeConnectorId).toBe(adapter.id);
  });

  it("fires onHydrated once with the eager-restore outcome", async () => {
    const onHydrated = vi.fn();
    renderHook(() => null, {
      wrapper: ({ children }) => (
        <WalletManagerProvider
          config={{
            connectors: [],
            createConnector: () => null,
            onHydrated,
            storage: createFakePersistence(),
          }}
        >
          {children}
        </WalletManagerProvider>
      ),
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(onHydrated).toHaveBeenCalledTimes(1);
    expect(onHydrated).toHaveBeenCalledWith(
      expect.objectContaining({
        dropped: expect.any(Array),
        pendingIds: expect.any(Array),
        restoredIds: expect.any(Array),
      }),
    );
  });

  it("only hydrates once across re-renders", async () => {
    const onHydrated = vi.fn();
    const { rerender } = renderHook(() => null, {
      wrapper: ({ children }) => (
        <WalletManagerProvider
          config={{
            connectors: [],
            createConnector: () => null,
            onHydrated,
            storage: createFakePersistence(),
          }}
        >
          {children}
        </WalletManagerProvider>
      ),
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    rerender();
    rerender();
    expect(onHydrated).toHaveBeenCalledTimes(1);
  });
});

describe("useWalletStoreContext", () => {
  it("returns the store when used inside the provider", () => {
    const { result } = renderHookWithProvider(() => useWalletStoreContext());
    expect(result.current).toBeDefined();
    expect(typeof result.current.getState).toBe("function");
  });

  it("throws when used outside the provider", () => {
    // renderHook reports the thrown error; suppress the React error log so
    // we don't pollute test output.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useWalletStoreContext())).toThrow(
      /WalletManagerProvider/,
    );
    spy.mockRestore();
  });
});
