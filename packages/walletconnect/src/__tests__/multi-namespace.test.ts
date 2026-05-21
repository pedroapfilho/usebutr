import { describe, expect, it, vi } from "vitest";

import type { UniversalProviderConstructor, UniversalProviderLike } from "../adapter";
import { createWalletConnectAdapters } from "../adapter";

type ConnectArgs = Parameters<UniversalProviderLike["connect"]>[0];

const createFakeProvider = (): UniversalProviderLike & {
  connectCalls: Array<ConnectArgs>;
} => {
  const listeners = new Map<string, Set<(...args: ReadonlyArray<unknown>) => void>>();
  const connectCalls: Array<ConnectArgs> = [];

  return {
    connect(opts) {
      connectCalls.push(opts);
      return Promise.resolve();
    },
    connectCalls,
    disconnect() {
      return Promise.resolve();
    },
    on(event, listener) {
      let set = listeners.get(event);
      if (!set) {
        set = new Set();
        listeners.set(event, set);
      }
      set.add(listener);
    },
    removeListener(event, listener) {
      listeners.get(event)?.delete(listener);
    },
    request() {
      return Promise.resolve(null);
    },
    session: null,
  };
};

const fakeUniversalProvider = (provider: UniversalProviderLike): UniversalProviderConstructor => ({
  init: vi.fn().mockResolvedValue(provider),
});

describe("createWalletConnectAdapters", () => {
  it("rejects when no namespaces are passed", async () => {
    await expect(
      createWalletConnectAdapters({
        namespaces: {},
        projectId: "test",
        universalProvider: fakeUniversalProvider(createFakeProvider()),
      }),
    ).rejects.toThrow(/at least one namespace/v);
  });

  it("rejects an unimplemented namespace with a clear message", async () => {
    await expect(
      createWalletConnectAdapters({
        namespaces: { svm: ["solana:mainnet"] },
        projectId: "test",
        universalProvider: fakeUniversalProvider(createFakeProvider()),
      }),
    ).rejects.toThrow(/no namespace builder registered/v);
  });

  it("returns one EVM adapter with the base id when only EVM is requested", async () => {
    const adapters = await createWalletConnectAdapters({
      namespaces: { evm: ["eip155:1"] },
      projectId: "test",
      universalProvider: fakeUniversalProvider(createFakeProvider()),
    });
    expect(adapters).toHaveLength(1);
    expect(adapters[0]?.id).toBe("walletconnect");
    expect(adapters[0]?.chainPlatform).toBe("evm");
  });

  it("falls back to the EVM namespace's default chains when an empty array is passed", async () => {
    const adapters = await createWalletConnectAdapters({
      namespaces: { evm: [] },
      projectId: "test",
      universalProvider: fakeUniversalProvider(createFakeProvider()),
    });
    expect(adapters).toHaveLength(1);
    expect(adapters[0]?.chainPlatform).toBe("evm");
  });
});
