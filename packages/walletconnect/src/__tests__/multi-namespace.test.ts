import type { ChainPlatform, WalletAdapter } from "@usebutr/core";
import type { Eip1193Listener } from "@usebutr/evm";
import { describe, expect, it, vi } from "vitest";

import type { UniversalProviderConstructor, UniversalProviderLike } from "../adapter";
import { createWalletConnectAdapters } from "../adapter";

type ConnectArgs = Parameters<UniversalProviderLike["connect"]>[0];
type FakeSession = { namespaces: Record<string, { accounts: ReadonlyArray<string> }> };

const requestedPrefixes = (opts: ConnectArgs): Array<string> =>
  Object.keys({ ...opts.namespaces, ...opts.optionalNamespaces });

/** `approve` narrows what the wallet grants, mirroring a wallet that
 *  declines an optional namespace it does not speak. */
const createFakeProvider = (
  overrides: { approve?: ReadonlyArray<string> } = {},
): UniversalProviderLike & {
  connectCalls: Array<ConnectArgs>;
  disconnectCalls: () => number;
} => {
  const listeners = new Map<string, Set<Eip1193Listener>>();
  const connectCalls: Array<ConnectArgs> = [];
  let disconnectCalls = 0;
  let session: FakeSession | null = null;

  return {
    connect(opts) {
      connectCalls.push(opts);
      const granted = requestedPrefixes(opts).filter(
        (prefix) => overrides.approve === undefined || overrides.approve.includes(prefix),
      );
      session = {
        namespaces: Object.fromEntries(granted.map((prefix) => [prefix, { accounts: [] }])),
      };
      return Promise.resolve(undefined);
    },
    connectCalls,
    disconnect() {
      disconnectCalls += 1;
      session = null;
      return Promise.resolve();
    },
    disconnectCalls: () => disconnectCalls,
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
    get session() {
      return session;
    },
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

const createEvmAndSvmAdapters = async (
  provider: UniversalProviderLike,
): Promise<{ evm: WalletAdapter; svm: WalletAdapter }> => {
  const adapters = await createWalletConnectAdapters({
    namespaces: { evm: ["eip155:1"], svm: ["solana:mainnet"] },
    projectId: "test",
    universalProvider: fakeUniversalProvider(provider),
  });
  const evm = adapters.find((adapter) => adapter.chainPlatform === "evm");
  const svm = adapters.find((adapter) => adapter.chainPlatform === "svm");
  if (evm === undefined || svm === undefined) {
    throw new Error("expected one EVM and one SVM adapter");
  }
  return { evm, svm };
};

describe("createWalletConnectAdapters (one session across namespaces)", () => {
  it("pairs every requested namespace in a single provider.connect", async () => {
    const provider = createFakeProvider();
    const { evm } = await createEvmAndSvmAdapters(provider);

    await evm.connect();

    expect(provider.connectCalls).toHaveLength(1);
    const call = provider.connectCalls[0];
    expect(Object.keys({ ...call?.namespaces, ...call?.optionalNamespaces }).toSorted()).toEqual([
      "eip155",
      "solana",
    ]);
    expect(call?.namespaces.eip155?.chains).toEqual(["eip155:1"]);
    expect(call?.optionalNamespaces?.solana?.chains).toEqual(["solana:mainnet"]);
    expect(call?.optionalNamespaces?.solana?.methods).toContain("solana_signAndSendTransaction");
  });

  it("the sibling adapter reuses the pairing instead of opening a second one", async () => {
    const provider = createFakeProvider();
    const { evm, svm } = await createEvmAndSvmAdapters(provider);

    await evm.connect();
    await svm.connect();

    expect(provider.connectCalls).toHaveLength(1);
  });

  it("concurrent connects from both adapters produce exactly one pairing", async () => {
    const provider = createFakeProvider();
    const { evm, svm } = await createEvmAndSvmAdapters(provider);

    await Promise.all([evm.connect(), svm.connect()]);

    expect(provider.connectCalls).toHaveLength(1);
  });

  it("rejects on the adapter whose namespace the wallet declined", async () => {
    const provider = createFakeProvider({ approve: ["eip155"] });
    const { evm, svm } = await createEvmAndSvmAdapters(provider);

    await evm.connect();

    await expect(svm.connect()).rejects.toThrow(/carries no "solana" namespace/v);
  });

  it("keeps the shared session until every connected adapter disconnects", async () => {
    const provider = createFakeProvider();
    const { evm, svm } = await createEvmAndSvmAdapters(provider);

    await evm.connect();
    await svm.connect();
    await evm.disconnect?.();

    await expect(svm.connect({ silent: true })).resolves.toBeUndefined();
    expect(provider.disconnectCalls()).toBe(0);
    expect(provider.session).not.toBeNull();

    await svm.disconnect?.();
    expect(provider.disconnectCalls()).toBe(1);
    expect(provider.session).toBeNull();
  });

  it("disconnects the session when the only connected adapter disconnects", async () => {
    const provider = createFakeProvider();
    const { evm } = await createEvmAndSvmAdapters(provider);

    await evm.connect();
    await evm.disconnect?.();

    expect(provider.disconnectCalls()).toBe(1);
    expect(provider.session).toBeNull();
  });
});
