import React, { type PropsWithChildren } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createFakePersistence } from "@butr/testing";
import {
  ANNOUNCE_EVENT,
  type Eip1193Provider,
  type Eip6963ProviderInfo,
} from "@butr/evm";
import { useWalletStore } from "@butr/react";
import { AutoWalletManagerProvider, useDiscoveredWallets } from "../auto-provider";

const buildFakeEip1193Provider = (account: string): Eip1193Provider => {
  const listeners = new Map<string, Set<(...args: Array<unknown>) => void>>();
  return {
    on: (event, handler) => {
      const set = listeners.get(event) ?? new Set();
      set.add(handler as (...args: Array<unknown>) => void);
      listeners.set(event, set);
    },
    removeListener: (event, handler) => {
      listeners.get(event)?.delete(handler as (...args: Array<unknown>) => void);
    },
    request: async ({ method }: { method: string }) => {
      switch (method) {
        case "eth_requestAccounts":
        case "eth_accounts":
          return [account];
        case "eth_chainId":
          return "0x1";
        case "eth_getBalance":
          return "0x0";
        default:
          return null;
      }
    },
  };
};

const announceEvmWallet = (info: Eip6963ProviderInfo, provider: Eip1193Provider) => {
  const event = new CustomEvent(ANNOUNCE_EVENT, { detail: { info, provider } });
  window.dispatchEvent(event);
};

const buildWrapper =
  (props: React.ComponentProps<typeof AutoWalletManagerProvider> = { children: null }) =>
  ({ children }: PropsWithChildren) => (
    <AutoWalletManagerProvider {...props}>{children}</AutoWalletManagerProvider>
  );

describe("AutoWalletManagerProvider", () => {
  it("renders children inside a working WalletManagerProvider", async () => {
    const { result } = renderHook(() => useWalletStore((s) => s.isHydrated), {
      wrapper: buildWrapper({ children: null, storage: createFakePersistence() }),
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current).toBe(true);
  });

  it("populates useDiscoveredWallets when an EIP-6963 wallet announces", async () => {
    const provider = buildFakeEip1193Provider("0xabc");
    const info: Eip6963ProviderInfo = {
      icon: "data:img",
      name: "Test Wallet",
      rdns: "test.wallet",
      uuid: "uuid-1",
    };
    const { result } = renderHook(() => useDiscoveredWallets(), {
      wrapper: buildWrapper({
        children: null,
        auto: { evm: true, injected: false },
        storage: createFakePersistence(),
      }),
    });
    await act(async () => {
      announceEvmWallet(info, provider);
      await Promise.resolve();
    });
    expect(result.current.map((a) => a.id)).toContain("test.wallet");
  });

  it("auto-restores an EVM wallet whose adapter announces synchronously", async () => {
    const account = "0xfeed";
    const provider = buildFakeEip1193Provider(account);
    const info: Eip6963ProviderInfo = {
      icon: "data:img",
      name: "Restored Wallet",
      rdns: "restored.wallet",
      uuid: "uuid-2",
    };
    const seededAccount = {
      chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155" as const, reference: "1" },
      id: `eip155:1:${account}`,
      walletAddress: account,
    };
    const storage = createFakePersistence({
      activeConnectorId: "restored.wallet",
      pool: {
        "restored.wallet": {
          account: seededAccount,
          accounts: [seededAccount],
          chainPlatform: "evm",
          connectorId: "restored.wallet",
        },
      },
    });
    // Announce BEFORE the provider mounts — Phantom/MetaMask extensions can
    // dispatch announceProvider eagerly. The discovery loop will replay via
    // requestProvider on mount and pick it up.
    const onMount = () => {
      // Listen for requestProvider so the wallet can reply synchronously.
      window.addEventListener(
        "eip6963:requestProvider",
        () => announceEvmWallet(info, provider),
        { once: true },
      );
    };
    onMount();
    const { result } = renderHook(
      () => useWalletStore((s) => ({ pool: s.pool, isHydrated: s.isHydrated })),
      {
        wrapper: buildWrapper({
          children: null,
          auto: { evm: true, injected: false },
          storage,
        }),
      },
    );
    await act(async () => {
      // Give the async hydration + restore enough time.
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.isHydrated).toBe(true);
    expect(result.current.pool.has("restored.wallet")).toBe(true);
  });

  it("respects auto={{ evm: false, svm: false }} by leaving discovery empty", async () => {
    const provider = buildFakeEip1193Provider("0xdead");
    const info: Eip6963ProviderInfo = {
      icon: "data:img",
      name: "Ignored",
      rdns: "ignored.wallet",
      uuid: "uuid-3",
    };
    const { result } = renderHook(() => useDiscoveredWallets(), {
      wrapper: buildWrapper({
        children: null,
        auto: { evm: false, svm: false, injected: false },
        storage: createFakePersistence(),
      }),
    });
    await act(async () => {
      announceEvmWallet(info, provider);
      await Promise.resolve();
    });
    expect(result.current).toEqual([]);
  });

  it("forwards onConnect / onHydrated / onDisconnect through to the inner provider", async () => {
    const onConnect = vi.fn();
    const onHydrated = vi.fn();
    const onDisconnect = vi.fn();
    const onConnectError = vi.fn();
    const onReset = vi.fn();
    const onSlowConnect = vi.fn();
    const onStorageError = vi.fn();
    renderHook(() => null, {
      wrapper: buildWrapper({
        children: null,
        auto: { evm: false, svm: false, injected: false },
        onConnect,
        onHydrated,
        onDisconnect,
        onConnectError,
        onReset,
        onSlowConnect,
        onStorageError,
        slowConnectThresholdMs: 1000,
        storageKeyPrefix: "test-prefix",
        storage: createFakePersistence(),
      }),
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(onHydrated).toHaveBeenCalledTimes(1);
  });
});

describe("useDiscoveredWallets outside provider", () => {
  it("returns an empty array (default context value)", () => {
    const { result } = renderHook(() => useDiscoveredWallets());
    expect(result.current).toEqual([]);
  });
});
