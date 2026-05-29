import { act, renderHook } from "@testing-library/react";
import type {
  StoredPoolEntry,
  WalletAdapter,
  WalletManagerConfig,
  WalletSnapshot,
} from "@usebutr/core";
import { createFakePersistence } from "@usebutr/testing";
import React, { type PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";

import { WalletManagerProvider } from "../../context";
import { useWalletSnapshot } from "../../snapshot-context";
import { configToProps } from "../render-with-provider";

const evmEntry = (overrides: Partial<StoredPoolEntry> = {}): StoredPoolEntry => ({
  account: {
    chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" },
    id: "acc-1",
    walletAddress: "0xabc",
  },
  accounts: [
    {
      chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" },
      id: "acc-1",
      walletAddress: "0xabc",
    },
  ],
  chainPlatform: "evm",
  connectorId: "metamask",
  ...overrides,
});

const baseSnapshot: WalletSnapshot = {
  activeConnectorId: "metamask",
  pool: { metamask: evmEntry() },
  selection: { evm: "metamask" },
};

type WrapperOpts = {
  adapters?: ReadonlyArray<WalletAdapter>;
  initialSnapshot?: WalletSnapshot;
  storageSeed?: Parameters<typeof createFakePersistence>[0];
};

const buildWrapper = ({ adapters = [], initialSnapshot, storageSeed }: WrapperOpts = {}) => {
  const byId = new Map(adapters.map((a) => [a.id, a]));
  const config: WalletManagerConfig = {
    connectors: [],
    createConnector: (id) => byId.get(id) ?? null,
    storage: createFakePersistence(storageSeed),
  };
  const TestWrapper = ({ children }: PropsWithChildren) => (
    <WalletManagerProvider {...configToProps(config)} initialSnapshot={initialSnapshot}>
      {children}
    </WalletManagerProvider>
  );
  TestWrapper.displayName = "TestWrapper";
  return TestWrapper;
};

describe("useWalletSnapshot", () => {
  it("returns the initialSnapshot before hydration completes", async () => {
    const wrapper = buildWrapper({ initialSnapshot: baseSnapshot });
    const { result } = renderHook(() => useWalletSnapshot(), { wrapper });
    // First synchronous render — hydration hasn't run yet, so we see
    // the snapshot passed via the provider prop.
    expect(result.current.activeConnectorId).toBe("metamask");
    expect(result.current.pool.metamask?.account.walletAddress).toBe("0xabc");
    expect(result.current.selection.evm).toBe("metamask");
    // Flush the mount-time hydration effect so React doesn't log an
    // act-warning when the test unmounts.
    await act(async () => {
      await Promise.resolve();
    });
  });

  it("returns an empty snapshot when no initialSnapshot is provided", async () => {
    const wrapper = buildWrapper();
    const { result } = renderHook(() => useWalletSnapshot(), { wrapper });
    expect(result.current.activeConnectorId).toBeNull();
    expect(result.current.pool).toEqual({});
    expect(result.current.selection).toEqual({});
    await act(async () => {
      await Promise.resolve();
    });
  });

  it("derives the snapshot from the live store after hydration", async () => {
    // Seed the persistence with an entry whose adapter is NOT
    // registered. Hydration will park it as pending (no connect
    // attempt), but `isHydrated` still flips to true. The derived
    // snapshot then reflects an empty live pool — distinct from the
    // stale `initialSnapshot`, proving the source switched.
    const wrapper = buildWrapper({
      initialSnapshot: baseSnapshot,
      storageSeed: { activeConnectorId: "metamask", pool: { metamask: evmEntry() } },
    });
    const { result } = renderHook(() => useWalletSnapshot(), { wrapper });

    expect(result.current.pool.metamask).toBeDefined();

    await act(async () => {
      // Let the hydration microtasks flush.
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    // Post-hydration: derived from the live store. The parked
    // pending entry never made it into the pool, so the snapshot now
    // shows an empty pool — the stale cookie has been reconciled.
    expect(result.current.pool.metamask).toBeUndefined();
    expect(result.current.activeConnectorId).toBeNull();
  });
});
