import type { ConnectorEvent, EvmAdapter } from "@usebutr/core";
import { buildAccount, EVM_CHAINS } from "@usebutr/core";
import type { Eip1193RequestArgs } from "@usebutr/evm";
import { describe, expect, it, vi } from "vitest";

import { createWalletConnectAdapters } from "../adapter";

import type { FakeProvider } from "./fake-provider";
import { createFakeProvider, fakeUniversalProvider, walletRequests } from "./fake-provider";

const ADDRESS = "0x53d120cf09b21C2fcC67814CDF10C8Ca9Bcc7670";

/** The eip155 provider answers `eth_chainId` and `eth_accounts` itself,
 *  from its current chain, which `wallet_switchEthereumChain` moves. */
const evmWallet = () => {
  let chainId = 1;
  return (args: Eip1193RequestArgs) => {
    if (args.method === "eth_chainId") {
      return chainId;
    }
    if (args.method === "eth_accounts") {
      return [ADDRESS];
    }
    if (args.method === "wallet_switchEthereumChain") {
      const [target] = Array.isArray(args.params) ? args.params : [];
      if (typeof target === "object" && target !== null && "chainId" in target) {
        chainId = Number(target.chainId);
      }
      return null;
    }
    return args.method === "eth_sendTransaction" ? "0xhash" : "0xdeadbeef";
  };
};

const createEvmAdapter = async (
  provider: FakeProvider,
  options: { chains?: ReadonlyArray<string>; onPairingUri?: (uri: string) => void } = {},
): Promise<EvmAdapter> => {
  const [adapter] = await createWalletConnectAdapters({
    namespaces: { evm: options.chains ?? ["eip155:1"] },
    onPairingUri: options.onPairingUri,
    projectId: "test",
    universalProvider: fakeUniversalProvider(provider),
  });
  if (adapter?.chainPlatform !== "evm") {
    throw new Error("expected one EVM adapter");
  }
  return adapter;
};

describe("createWalletConnectAdapters (EVM namespace)", () => {
  it("builds an EVM adapter with sensible defaults and no account picker", async () => {
    const adapter = await createEvmAdapter(createFakeProvider());

    expect(adapter.id).toBe("walletconnect");
    expect(adapter.name).toBe("WalletConnect");
    expect(adapter.chainPlatform).toBe("evm");
    // WC has no EIP-2255 picker: more accounts means re-pairing.
    expect(adapter.requestAccounts).toBeUndefined();
    expect(adapter.signMessage).toBeTypeOf("function");
    expect(adapter.switchChain).toBeTypeOf("function");
  });

  it("honours custom id/name/icon", async () => {
    const [adapter] = await createWalletConnectAdapters({
      icon: "data:image/svg+xml;base64,Zm9v",
      id: "walletconnect:custom",
      name: "My Custom WC",
      namespaces: { evm: ["eip155:1"] },
      projectId: "test",
      universalProvider: fakeUniversalProvider(createFakeProvider()),
    });

    expect(adapter?.id).toBe("walletconnect:custom");
    expect(adapter?.name).toBe("My Custom WC");
    expect(adapter?.icon).toBe("data:image/svg+xml;base64,Zm9v");
  });

  it("connect() triggers WalletConnect's namespace handshake with the configured chains", async () => {
    const provider = createFakeProvider();
    const adapter = await createEvmAdapter(provider, { chains: ["eip155:1", "eip155:137"] });

    await adapter.connect();

    expect(provider.connectCalls).toHaveLength(1);
    const namespace = provider.connectCalls[0]?.namespaces.eip155;
    expect(namespace?.chains).toEqual(["eip155:1", "eip155:137"]);
    expect(namespace?.methods).toContain("personal_sign");
    expect(namespace?.events).toContain("accountsChanged");
  });

  it("connect() short-circuits when a live session already exists", async () => {
    const provider = createFakeProvider();
    const adapter = await createEvmAdapter(provider);

    await adapter.connect();
    await adapter.connect();

    expect(provider.connectCalls).toHaveLength(1);
  });

  it("disconnect() calls provider.disconnect() only when a session exists", async () => {
    const provider = createFakeProvider();
    const adapter = await createEvmAdapter(provider);

    await adapter.disconnect?.();
    expect(provider.disconnectCalls()).toBe(0);

    await adapter.connect();
    await adapter.disconnect?.();
    expect(provider.disconnectCalls()).toBe(1);
  });

  it("getSigner() hands back an EIP-1193 provider that routes to the eip155 chain", async () => {
    const provider = createFakeProvider({ request: evmWallet() });
    const adapter = await createEvmAdapter(provider);
    await adapter.connect();

    const signer = await adapter.getSigner();
    if (signer.kind !== "eip1193") {
      throw new Error(`expected an eip1193 signer, got ${signer.kind}`);
    }
    // UniversalProvider answers a number; EIP-1193 wants hex.
    await expect(signer.provider.request({ method: "eth_chainId" })).resolves.toBe("0x1");
    await signer.provider.request({ method: "eth_blockNumber" });

    expect(walletRequests(provider)).toEqual([
      { args: { method: "eth_blockNumber" }, chain: "eip155:1" },
    ]);
  });

  it("getAccounts() resolves the session's EVM accounts on the registry chain", async () => {
    const provider = createFakeProvider({ request: evmWallet() });
    const adapter = await createEvmAdapter(provider);
    await adapter.connect();

    await expect(adapter.getAccounts()).resolves.toEqual([
      buildAccount(ADDRESS, EVM_CHAINS.ethereum),
    ]);
  });

  it("sendTx({ chain }) switches the eip155 chain, then routes the send to it", async () => {
    const provider = createFakeProvider({ request: evmWallet() });
    const adapter = await createEvmAdapter(provider, { chains: ["eip155:1", "eip155:137"] });
    await adapter.connect();

    const hash = await adapter.sendTx?.({ to: "0xCCC", value: 1n }, { chain: EVM_CHAINS.polygon });

    expect(hash).toBe("0xhash");
    const calls = walletRequests(provider).filter(({ args }) => args.method !== "eth_accounts");
    expect(calls).toEqual([
      {
        args: { method: "wallet_switchEthereumChain", params: [{ chainId: "0x89" }] },
        chain: "eip155:1",
      },
      {
        args: {
          method: "eth_sendTransaction",
          params: [{ from: ADDRESS, to: "0xCCC", value: "0x1" }],
        },
        chain: "eip155:137",
      },
    ]);
  });

  it("signMessage() rejects an account the session does not expose", async () => {
    const provider = createFakeProvider({ request: evmWallet() });
    const adapter = await createEvmAdapter(provider);
    await adapter.connect();

    await expect(
      adapter.signMessage?.(new Uint8Array([1]), {
        account: buildAccount("0x0000000000000000000000000000000000000001", EVM_CHAINS.ethereum),
      }),
    ).rejects.toThrow(/does not expose account/v);
    expect(walletRequests(provider).map(({ args }) => args.method)).not.toContain("personal_sign");
  });

  it("reports a local chain switch once, even if the wallet echoes a remote event", async () => {
    const provider = createFakeProvider({ request: evmWallet() });
    const adapter = await createEvmAdapter(provider, { chains: ["eip155:1", "eip155:137"] });
    await adapter.connect();
    const listener = vi.fn<(event: ConnectorEvent) => void>();
    const unsubscribe = adapter.subscribe?.(listener);

    await adapter.switchChain?.(EVM_CHAINS.polygon);
    provider.emit("session_event", {
      params: { chainId: "eip155:1", event: { data: 137, name: "chainChanged" } },
    });
    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalledExactlyOnceWith({
        accounts: [buildAccount(ADDRESS, EVM_CHAINS.polygon)],
        type: "accountsChanged",
      });
    });

    unsubscribe?.();
  });
});

const displayUriListeners = (provider: FakeProvider) =>
  provider.onCalls.filter(({ event }) => event === "display_uri");
const removedDisplayUriListeners = (provider: FakeProvider) =>
  provider.removeListenerCalls.filter(({ event }) => event === "display_uri");

describe("createWalletConnectAdapters (display_uri listener lifecycle)", () => {
  it("forwards string display_uri events to onPairingUri and ignores other payloads", async () => {
    const provider = createFakeProvider();
    const onPairingUri = vi.fn<(uri: string) => void>();
    await createEvmAdapter(provider, { onPairingUri });

    provider.emit("display_uri", "wc:1234@2?relay-protocol=irn&symKey=abc");
    provider.emit("display_uri", { uri: "wc:1234" });

    expect(onPairingUri).toHaveBeenCalledTimes(1);
    expect(onPairingUri).toHaveBeenCalledWith("wc:1234@2?relay-protocol=irn&symKey=abc");
  });

  it("attaches exactly one display_uri listener on init", async () => {
    const provider = createFakeProvider();
    await createEvmAdapter(provider, { onPairingUri: () => {} });

    expect(displayUriListeners(provider)).toHaveLength(1);
  });

  it("removes the display_uri listener on disconnect (same handler reference)", async () => {
    const provider = createFakeProvider();
    const adapter = await createEvmAdapter(provider, { onPairingUri: () => {} });

    await adapter.connect();
    await adapter.disconnect?.();

    const removed = removedDisplayUriListeners(provider);
    expect(removed).toHaveLength(1);
    expect(removed[0]?.listener).toBe(displayUriListeners(provider)[0]?.listener);
  });

  it("removes the listener even when no session was ever established", async () => {
    const provider = createFakeProvider();
    const adapter = await createEvmAdapter(provider, { onPairingUri: () => {} });

    await adapter.disconnect?.();

    expect(provider.disconnectCalls()).toBe(0);
    expect(removedDisplayUriListeners(provider)).toHaveLength(1);
  });

  it("removes the listener when provider.disconnect rejects", async () => {
    const provider = createFakeProvider({
      disconnect: () => Promise.reject(new Error("relay error")),
    });
    const adapter = await createEvmAdapter(provider, { onPairingUri: () => {} });

    await adapter.connect();

    await expect(adapter.disconnect?.()).resolves.toBeUndefined();
    expect(provider.disconnectCalls()).toBe(1);
    expect(removedDisplayUriListeners(provider)).toHaveLength(1);
  });

  it("still forwards the pairing URI after connect / disconnect / connect", async () => {
    const provider = createFakeProvider();
    const seen = vi.fn<(uri: string) => void>();
    const adapter = await createEvmAdapter(provider, { onPairingUri: seen });

    await adapter.connect();
    await adapter.disconnect?.();
    await adapter.connect();

    provider.emit("display_uri", "wc:second@2");

    expect(provider.connectCalls).toHaveLength(2);
    expect(seen).toHaveBeenCalledWith("wc:second@2");
  });

  it("is idempotent: disconnecting twice does not throw or double-remove", async () => {
    const provider = createFakeProvider();
    const adapter = await createEvmAdapter(provider, { onPairingUri: () => {} });

    await adapter.connect();
    await adapter.disconnect?.();
    await expect(adapter.disconnect?.()).resolves.toBeUndefined();

    expect(removedDisplayUriListeners(provider)).toHaveLength(1);
  });
});
