import { describe, expect, it, vi } from "vitest";
import type { UniversalProviderConstructor, UniversalProviderLike } from "../adapter";
import { createWalletConnectAdapter } from "../adapter";

type ConnectArgs = Parameters<UniversalProviderLike["connect"]>[0];

const createFakeProvider = (): UniversalProviderLike & {
  connectCalls: Array<ConnectArgs>;
  readonly disconnectCalls: number;
  emit: (event: string, ...args: ReadonlyArray<unknown>) => void;
} => {
  const listeners = new Map<string, Set<(...args: ReadonlyArray<unknown>) => void>>();
  const requests: Array<{ method: string; params?: ReadonlyArray<unknown> | object }> = [];
  let session: unknown = null;
  const connectCalls: Array<ConnectArgs> = [];
  // Closure-held counter so the getter on the returned object always
  // reads the live value (a plain numeric property would snapshot at
  // creation time and never update).
  const state = { disconnectCalls: 0 };

  return {
    connect(opts) {
      connectCalls.push(opts);
      session = { topic: "fake-session" };
      return Promise.resolve();
    },
    connectCalls,
    disconnect() {
      state.disconnectCalls += 1;
      session = null;
      return Promise.resolve();
    },
    get disconnectCalls() {
      return state.disconnectCalls;
    },
    emit(event, ...args) {
      const set = listeners.get(event);
      if (!set) {
        return;
      }
      for (const fn of set) {
        fn(...args);
      }
    },
    on(event, fn) {
      const set = listeners.get(event) ?? new Set();
      set.add(fn);
      listeners.set(event, set);
    },
    removeListener(event, fn) {
      listeners.get(event)?.delete(fn);
    },
    request(args) {
      requests.push(args);
      // Reasonable defaults so the EIP-6963 adapter's connect/getAccount
      // path can run end-to-end without crashing.
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
  } as never;
};

const stubUniversalProvider = (instance: UniversalProviderLike): UniversalProviderConstructor => ({
  init: vi.fn().mockResolvedValue(instance),
});

describe("createWalletConnectAdapter", () => {
  it("builds a WalletAdapter with sensible defaults", async () => {
    const provider = createFakeProvider();
    const adapter = await createWalletConnectAdapter({
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    expect(adapter.id).toBe("walletconnect");
    expect(adapter.name).toBe("WalletConnect");
    expect(adapter.chainPlatform).toBe("evm");
    expect(adapter.capabilities.requestAccounts).toBe(false);
    expect(adapter.capabilities.signMessage).toBe(true);
    expect(adapter.capabilities.switchChain).toBe(true);
  });

  it("forwards display_uri events to onPairingUri", async () => {
    const provider = createFakeProvider();
    const onPairingUri = vi.fn();
    await createWalletConnectAdapter({
      onPairingUri,
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    provider.emit("display_uri", "wc:1234@2?relay-protocol=irn&symKey=abc");

    expect(onPairingUri).toHaveBeenCalledWith("wc:1234@2?relay-protocol=irn&symKey=abc");
  });

  it("ignores non-string display_uri payloads", async () => {
    const provider = createFakeProvider();
    const onPairingUri = vi.fn();
    await createWalletConnectAdapter({
      onPairingUri,
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    // Some provider versions emit { uri: string } objects; harmless fallback.
    provider.emit("display_uri", { uri: "wc:1234" });

    expect(onPairingUri).not.toHaveBeenCalled();
  });

  it("connect() triggers WalletConnect's namespace handshake with the configured chains", async () => {
    const provider = createFakeProvider();
    const adapter = await createWalletConnectAdapter({
      chains: ["eip155:1", "eip155:137"],
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    await adapter.connect();

    expect(provider.connectCalls).toHaveLength(1);
    const namespace = provider.connectCalls[0]?.namespaces["eip155"];
    expect(namespace?.chains).toEqual(["eip155:1", "eip155:137"]);
    expect(namespace?.methods).toContain("personal_sign");
    expect(namespace?.events).toContain("accountsChanged");
  });

  it("connect() short-circuits when a live session already exists", async () => {
    const provider = createFakeProvider();
    const adapter = await createWalletConnectAdapter({
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    // First connect establishes the session.
    await adapter.connect();
    expect(provider.connectCalls).toHaveLength(1);

    // Second connect should be a no-op — session is live.
    await adapter.connect();
    expect(provider.connectCalls).toHaveLength(1);
  });

  it("disconnect() calls provider.disconnect() only when a session exists", async () => {
    const provider = createFakeProvider();
    const adapter = await createWalletConnectAdapter({
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    // No session yet — disconnect is a no-op.
    await adapter.disconnect?.();
    expect(provider.disconnectCalls).toBe(0);

    // After connect, disconnect tears down the session.
    await adapter.connect();
    await adapter.disconnect?.();
    expect(provider.disconnectCalls).toBe(1);
  });

  it("honours custom id/name/icon", async () => {
    const provider = createFakeProvider();
    const adapter = await createWalletConnectAdapter({
      icon: "data:image/svg+xml;base64,Zm9v",
      id: "walletconnect:custom",
      name: "My Custom WC",
      projectId: "test",
      universalProvider: stubUniversalProvider(provider),
    });

    expect(adapter.id).toBe("walletconnect:custom");
    expect(adapter.name).toBe("My Custom WC");
    expect(adapter.icon).toBe("data:image/svg+xml;base64,Zm9v");
  });
});
