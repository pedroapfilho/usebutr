import { act, renderHook } from "@testing-library/react";
import type { WalletManagerConfig, WalletSource } from "@usebutr/core";
import {
  createFakeAdapter,
  createFakeConnectedWallet,
  createFakePersistence,
} from "@usebutr/testing";
import type { PropsWithChildren } from "react";
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useWalletManager, WalletManagerProvider } from "../context";
import { useWallet } from "../hooks/state";

import { renderWithManager, settle, staticSource, storedEntryOf } from "./render";

const WalletName = () => {
  const wallet = useWallet();
  return <span>{wallet === undefined ? "none" : wallet.account.walletAddress}</span>;
};

describe("WalletManagerProvider", () => {
  it("starts the manager after mount and hydrates", async () => {
    const onHydrated = vi.fn<NonNullable<WalletManagerConfig["onHydrated"]>>();
    const { result } = renderWithManager(() => null, { config: { onHydrated } });

    await settle();

    expect(result.current.manager.getState().isHydrated).toBe(true);
    expect(onHydrated).toHaveBeenCalledOnce();
  });

  it("keeps one manager for the lifetime of a mount", () => {
    const { rerender, result } = renderWithManager(() => null);
    const first = result.current.manager;
    rerender();
    expect(result.current.manager).toBe(first);
  });

  it("runs nothing on the server", () => {
    const source = vi.fn<WalletSource>(() => () => {});
    const storage = createFakePersistence();
    const load = vi.spyOn(storage, "load");

    const html = renderToString(
      <WalletManagerProvider config={{ sources: [source], storage }}>
        <WalletName />
      </WalletManagerProvider>,
    );

    expect(html).toContain("none");
    expect(source).not.toHaveBeenCalled();
    expect(load).not.toHaveBeenCalled();
  });

  it("renders a seeded wallet from the first server render", () => {
    const wallet = createFakeConnectedWallet({ addresses: ["0xseeded"], id: "metamask" });
    const initialState = {
      activeConnectorId: "metamask",
      pool: { metamask: storedEntryOf(wallet) },
      selection: {},
    };

    const html = renderToString(
      <WalletManagerProvider
        config={{ storage: createFakePersistence() }}
        initialState={initialState}
      >
        <WalletName />
      </WalletManagerProvider>,
    );

    expect(html).toContain("0xseeded");
  });

  it("stops the manager on unmount", async () => {
    const adapter = createFakeAdapter({ id: "metamask" });
    const unsubscribe = vi.fn<() => void>();
    const source = vi.fn<WalletSource>((onAdapter) => {
      onAdapter(adapter);
      return unsubscribe;
    });
    const { result, unmount } = renderWithManager(() => null, {
      config: { sources: [source] },
    });
    await settle();
    await act(() => result.current.manager.connect("metamask"));
    expect(adapter.listenerCount()).toBe(1);

    unmount();

    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(adapter.listenerCount()).toBe(0);
  });

  it("hydrates once under StrictMode's double effect", async () => {
    const storage = createFakePersistence();
    const load = vi.spyOn(storage, "load");
    const source = vi.fn(staticSource(createFakeAdapter()));
    const Wrapper = ({ children }: PropsWithChildren) => (
      <StrictMode>
        <WalletManagerProvider config={{ sources: [source], storage }}>
          {children}
        </WalletManagerProvider>
      </StrictMode>
    );

    const { result } = renderHook(() => useWalletManager(), { wrapper: Wrapper });
    await settle();

    expect(load).toHaveBeenCalledOnce();
    expect(result.current.getState().isHydrated).toBe(true);
    expect(result.current.getState().adapters).toHaveLength(1);
  });

  it("gives stable action references", () => {
    const { rerender, result } = renderWithManager(() => null);
    const { connect, disconnect, setActive } = result.current.manager;
    rerender();
    expect(result.current.manager.connect).toBe(connect);
    expect(result.current.manager.disconnect).toBe(disconnect);
    expect(result.current.manager.setActive).toBe(setActive);
  });

  it("throws outside a provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useWalletManager())).toThrow(
      "useWalletManager must be used within WalletManagerProvider",
    );
    vi.restoreAllMocks();
  });
});
