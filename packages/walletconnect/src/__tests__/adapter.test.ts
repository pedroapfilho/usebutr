import type { Eip1193Listener, Eip1193Value } from "@usebutr/evm";
import { describe, expect, it, vi } from "vitest";

import type { UniversalProviderConstructor, UniversalProviderLike } from "../adapter";
import { createWalletConnectAdapters } from "../adapter";

const EVM_ONLY = { evm: ["eip155:1"] } as const;

type ConnectArgs = Parameters<UniversalProviderLike["connect"]>[0];
type RequestArgs = Parameters<UniversalProviderLike["request"]>[0];
type ProviderListener = Eip1193Listener;

type ListenerCall = { event: string; fn: ProviderListener };
type FakeSession = { namespaces: Record<string, { accounts: ReadonlyArray<string> }> };

/** A wallet approving everything the dapp asked for: the resulting
 *  session carries one entry per requested namespace. */
const approvedSession = (opts: ConnectArgs): FakeSession => ({
  namespaces: Object.fromEntries(
    Object.keys({ ...opts.namespaces, ...opts.optionalNamespaces }).map((prefix) => [
      prefix,
      { accounts: [] },
    ]),
  ),
});

const createFakeProvider = (
  overrides: { disconnect?: () => Promise<void> } = {},
): UniversalProviderLike & {
  connectCalls: Array<ConnectArgs>;
  readonly disconnectCalls: number;
  emit: (event: string, ...args: ReadonlyArray<Eip1193Value | undefined>) => void;
  onCalls: Array<ListenerCall>;
  removeListenerCalls: Array<ListenerCall>;
} => {
  const listeners = new Map<string, Set<ProviderListener>>();
  const requests: Array<RequestArgs> = [];
  let session: FakeSession | null = null;
  const connectCalls: Array<ConnectArgs> = [];
  const onCalls: Array<ListenerCall> = [];
  const removeListenerCalls: Array<ListenerCall> = [];
  const state = { disconnectCalls: 0 };

  return {
    connect(opts: ConnectArgs) {
      connectCalls.push(opts);
      session = approvedSession(opts);
      return Promise.resolve(undefined);
    },
    connectCalls,
    disconnect() {
      state.disconnectCalls += 1;
      session = null;
      return overrides.disconnect ? overrides.disconnect() : Promise.resolve();
    },
    get disconnectCalls() {
      return state.disconnectCalls;
    },
    emit(event: string, ...args: ReadonlyArray<Eip1193Value | undefined>) {
      const set = listeners.get(event);
      if (!set) {
        return;
      }
      for (const fn of set) {
        fn(...args);
      }
    },
    on(event: string, fn: ProviderListener) {
      onCalls.push({ event, fn });
      const set = listeners.get(event) ?? new Set();
      set.add(fn);
      listeners.set(event, set);
    },
    onCalls,
    removeListener(event: string, fn: ProviderListener) {
      removeListenerCalls.push({ event, fn });
      listeners.get(event)?.delete(fn);
    },
    removeListenerCalls,
    request(args: RequestArgs) {
      requests.push(args);
      if (args.method === "eth_accounts" || args.method === "eth_requestAccounts") {
        return Promise.resolve(["0x53d120cf09b21c2fcc67814cdf10c8ca9bcc7670"]);
      }
      if (args.method === "eth_chainId") {
        return Promise.resolve("0x1");
      }
      return Promise.resolve(undefined);
    },
    get session() {
      return session;
    },
  };
};

const stubUniversalProvider = (instance: UniversalProviderLike): UniversalProviderConstructor => ({
  init: vi.fn().mockResolvedValue(instance),
});

describe("createWalletConnectAdapters (single-namespace)", () => {
  it("builds an EVM WalletAdapter with sensible defaults", async () => {
    const provider = createFakeProvider();
    const [adapter] = await createWalletConnectAdapters({
      namespaces: EVM_ONLY,
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    if (adapter === undefined) {
      throw new Error("expected one adapter");
    }
    expect(adapter.id).toBe("walletconnect");
    expect(adapter.name).toBe("WalletConnect");
    expect(adapter.chainPlatform).toBe("evm");
    expect(adapter.capabilities.requestAccounts).toBe(false);
    expect(adapter.capabilities.signMessage).toBe(true);
    expect(adapter.capabilities.switchChain).toBe(true);
  });

  it("forwards display_uri events to onPairingUri", async () => {
    const provider = createFakeProvider();
    const onPairingUri = vi.fn<(uri: string) => void>();
    await createWalletConnectAdapters({
      namespaces: EVM_ONLY,
      onPairingUri,
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    provider.emit("display_uri", "wc:1234@2?relay-protocol=irn&symKey=abc");

    expect(onPairingUri).toHaveBeenCalledWith("wc:1234@2?relay-protocol=irn&symKey=abc");
  });

  it("ignores non-string display_uri payloads", async () => {
    const provider = createFakeProvider();
    const onPairingUri = vi.fn<(uri: string) => void>();
    await createWalletConnectAdapters({
      namespaces: EVM_ONLY,
      onPairingUri,
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    provider.emit("display_uri", { uri: "wc:1234" });

    expect(onPairingUri).not.toHaveBeenCalled();
  });

  it("connect() triggers WalletConnect's namespace handshake with the configured chains", async () => {
    const provider = createFakeProvider();
    const [adapter] = await createWalletConnectAdapters({
      namespaces: { evm: ["eip155:1", "eip155:137"] },
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    if (adapter === undefined) {
      throw new Error("expected one adapter");
    }
    await adapter.connect();

    expect(provider.connectCalls).toHaveLength(1);
    const namespace = provider.connectCalls[0]?.namespaces.eip155;
    expect(namespace?.chains).toEqual(["eip155:1", "eip155:137"]);
    expect(namespace?.methods).toContain("personal_sign");
    expect(namespace?.events).toContain("accountsChanged");
  });

  it("connect() short-circuits when a live session already exists", async () => {
    const provider = createFakeProvider();
    const [adapter] = await createWalletConnectAdapters({
      namespaces: EVM_ONLY,
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    if (adapter === undefined) {
      throw new Error("expected one adapter");
    }
    await adapter.connect();
    expect(provider.connectCalls).toHaveLength(1);

    await adapter.connect();
    expect(provider.connectCalls).toHaveLength(1);
  });

  it("disconnect() calls provider.disconnect() only when a session exists", async () => {
    const provider = createFakeProvider();
    const [adapter] = await createWalletConnectAdapters({
      namespaces: EVM_ONLY,
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    if (adapter === undefined) {
      throw new Error("expected one adapter");
    }
    await adapter.disconnect?.();
    expect(provider.disconnectCalls).toBe(0);

    await adapter.connect();
    await adapter.disconnect?.();
    expect(provider.disconnectCalls).toBe(1);
  });

  it("honours custom id/name/icon", async () => {
    const provider = createFakeProvider();
    const [adapter] = await createWalletConnectAdapters({
      icon: "data:image/svg+xml;base64,Zm9v",
      id: "walletconnect:custom",
      name: "My Custom WC",
      namespaces: EVM_ONLY,
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    if (adapter === undefined) {
      throw new Error("expected one adapter");
    }
    expect(adapter.id).toBe("walletconnect:custom");
    expect(adapter.name).toBe("My Custom WC");
    expect(adapter.icon).toBe("data:image/svg+xml;base64,Zm9v");
  });
});

const onPairingUri = () => {};
const displayUriListeners = (calls: Array<ListenerCall>): Array<ListenerCall> =>
  calls.filter((c) => c.event === "display_uri");

describe("createWalletConnectAdapters (display_uri listener lifecycle)", () => {
  it("attaches exactly one display_uri listener on init", async () => {
    const provider = createFakeProvider();
    await createWalletConnectAdapters({
      namespaces: EVM_ONLY,
      onPairingUri,
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    expect(displayUriListeners(provider.onCalls)).toHaveLength(1);
  });

  it("removes the display_uri listener on disconnect (same handler reference)", async () => {
    const provider = createFakeProvider();
    const [adapter] = await createWalletConnectAdapters({
      namespaces: EVM_ONLY,
      onPairingUri,
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    if (adapter === undefined) {
      throw new Error("expected one adapter");
    }
    await adapter.connect();
    await adapter.disconnect?.();

    const removed = displayUriListeners(provider.removeListenerCalls);
    expect(removed).toHaveLength(1);
    expect(removed[0]?.fn).toBe(displayUriListeners(provider.onCalls)[0]?.fn);
  });

  it("removes the listener even when no session was ever established", async () => {
    const provider = createFakeProvider();
    const [adapter] = await createWalletConnectAdapters({
      namespaces: EVM_ONLY,
      onPairingUri,
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    if (adapter === undefined) {
      throw new Error("expected one adapter");
    }
    await adapter.disconnect?.();

    expect(provider.disconnectCalls).toBe(0);
    expect(displayUriListeners(provider.removeListenerCalls)).toHaveLength(1);
  });

  it("removes the listener when provider.disconnect rejects (cleanup in finally)", async () => {
    const boom = new Error("relay error");
    const provider = createFakeProvider({ disconnect: () => Promise.reject(boom) });
    const [adapter] = await createWalletConnectAdapters({
      namespaces: EVM_ONLY,
      onPairingUri,
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    if (adapter === undefined) {
      throw new Error("expected one adapter");
    }
    await adapter.connect();

    await expect(adapter.disconnect?.()).resolves.toBeUndefined();
    expect(provider.disconnectCalls).toBe(1);
    expect(displayUriListeners(provider.removeListenerCalls)).toHaveLength(1);
  });

  it("still forwards the pairing URI after connect / disconnect / connect", async () => {
    const provider = createFakeProvider();
    const seen = vi.fn<(uri: string) => void>();
    const [adapter] = await createWalletConnectAdapters({
      namespaces: EVM_ONLY,
      onPairingUri: seen,
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    if (adapter === undefined) {
      throw new Error("expected one adapter");
    }
    await adapter.connect();
    await adapter.disconnect?.();
    await adapter.connect();

    provider.emit("display_uri", "wc:second@2");

    expect(provider.connectCalls).toHaveLength(2);
    expect(seen).toHaveBeenCalledWith("wc:second@2");
  });

  it("is idempotent — disconnecting twice does not throw or double-remove", async () => {
    const provider = createFakeProvider();
    const [adapter] = await createWalletConnectAdapters({
      namespaces: EVM_ONLY,
      onPairingUri,
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    if (adapter === undefined) {
      throw new Error("expected one adapter");
    }
    await adapter.connect();
    await adapter.disconnect?.();
    await expect(adapter.disconnect?.()).resolves.toBeUndefined();

    expect(displayUriListeners(provider.removeListenerCalls)).toHaveLength(1);
  });
});
