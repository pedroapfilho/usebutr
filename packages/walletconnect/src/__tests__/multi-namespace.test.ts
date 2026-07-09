import type { ChainPlatform } from "@usebutr/core";
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
    const universalProvider = fakeUniversalProvider(createFakeProvider());
    await expect(
      createWalletConnectAdapters({
        namespaces: {},
        projectId: "test",
        universalProvider,
      }),
    ).rejects.toThrow(/at least one namespace/v);
  });

  it("rejects an unimplemented namespace with a clear message", async () => {
    // EVM, SVM, Sui, and Bitcoin (bip122) all ship today, so the
    // catches it. Replace this cast when a future namespace lands
    const forwardPlatform = "cosmos" as ChainPlatform;
    const universalProvider = fakeUniversalProvider(createFakeProvider());
    await expect(
      createWalletConnectAdapters({
        namespaces: { [forwardPlatform]: ["cosmos:cosmoshub-4"] },
        projectId: "test",
        universalProvider,
      }),
    ).rejects.toThrow(/no namespace builder registered/v);
  });

  it("returns one Bitcoin adapter with the base id when only Bitcoin is requested", async () => {
    const adapters = await createWalletConnectAdapters({
      namespaces: { bitcoin: ["bip122:000000000019d6689c085ae165831e93"] },
      projectId: "test",
      universalProvider: fakeUniversalProvider(createFakeProvider()),
    });
    expect(adapters).toHaveLength(1);
    expect(adapters[0]?.id).toBe("walletconnect");
    expect(adapters[0]?.chainPlatform).toBe("bitcoin");
  });

  it("returns one Sui adapter with the base id when only Sui is requested", async () => {
    const adapters = await createWalletConnectAdapters({
      namespaces: { sui: ["sui:mainnet"] },
      projectId: "test",
      universalProvider: fakeUniversalProvider(createFakeProvider()),
    });
    expect(adapters).toHaveLength(1);
    expect(adapters[0]?.id).toBe("walletconnect");
    expect(adapters[0]?.chainPlatform).toBe("sui");
  });

  it("returns one SVM adapter with the base id when only SVM is requested", async () => {
    const adapters = await createWalletConnectAdapters({
      namespaces: { svm: ["solana:mainnet"] },
      projectId: "test",
      universalProvider: fakeUniversalProvider(createFakeProvider()),
    });
    expect(adapters).toHaveLength(1);
    expect(adapters[0]?.id).toBe("walletconnect");
    expect(adapters[0]?.chainPlatform).toBe("svm");
  });

  it("returns suffixed adapter ids when multiple namespaces are requested", async () => {
    const adapters = await createWalletConnectAdapters({
      namespaces: { evm: ["eip155:1"], svm: ["solana:mainnet"] },
      projectId: "test",
      universalProvider: fakeUniversalProvider(createFakeProvider()),
    });
    expect(adapters).toHaveLength(2);
    const ids = adapters.map((a) => a.id).toSorted();
    expect(ids).toEqual(["walletconnect-evm", "walletconnect-svm"]);
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
