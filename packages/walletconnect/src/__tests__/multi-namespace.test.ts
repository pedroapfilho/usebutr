import type { ChainPlatform, ConnectorEvent, EvmAdapter, SvmAdapter } from "@usebutr/core";
import { buildAccount, EVM_CHAINS, SVM_CHAINS } from "@usebutr/core";
import { describe, expect, it, vi } from "vitest";

import { createWalletConnectAdapters } from "../adapter";

import type { FakeProvider } from "./fake-provider";
import { createFakeProvider, fakeUniversalProvider, walletRequests } from "./fake-provider";

const EVM_ADDRESS = "0x53d120cf09b21C2fcC67814CDF10C8Ca9Bcc7670";
const SOL_ADDRESS = "Bg9LkP1234567890abcdefghijkmnopqrstuvwxy";
const SUI_ADDRESS = `0x${"ab".repeat(32)}`;

// WalletConnect's CAIP-2 ids for Solana clusters.
// Session ids (genesis hashes) and the registry chains butr maps them to.
const SOL_MAINNET_ID = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";
const SOL_DEVNET_ID = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1";
const SOL_DEVNET = SVM_CHAINS.devnet;

describe("createWalletConnectAdapters", () => {
  it("rejects when no namespaces are passed", async () => {
    const universalProvider = fakeUniversalProvider(createFakeProvider());
    await expect(
      createWalletConnectAdapters({ namespaces: {}, projectId: "test", universalProvider }),
    ).rejects.toThrow(/at least one namespace/v);
  });

  it.each([
    ["an unknown platform", "cosmos", "cosmos:cosmoshub-4"],
    ["a platform without a WalletConnect namespace", "polkadot", "polkadot:91b171bb"],
  ])("rejects %s with a clear message", async (_label, platform, chain) => {
    const universalProvider = fakeUniversalProvider(createFakeProvider());
    const namespaces = Object.fromEntries([[platform, [chain]]]);
    await expect(
      createWalletConnectAdapters({ namespaces, projectId: "test", universalProvider }),
    ).rejects.toThrow(/no namespace builder registered for: /v);
  });

  it.each<[ChainPlatform, string]>([
    ["bitcoin", "bip122:000000000019d6689c085ae165831e93"],
    ["evm", "eip155:1"],
    ["sui", "sui:mainnet"],
    ["svm", SOL_MAINNET_ID],
  ])(
    "returns one %s adapter with the base id when only it is requested",
    async (platform, chain) => {
      const adapters = await createWalletConnectAdapters({
        namespaces: { [platform]: [chain] },
        projectId: "test",
        universalProvider: fakeUniversalProvider(createFakeProvider()),
      });
      expect(adapters.map(({ chainPlatform, id }) => ({ chainPlatform, id }))).toEqual([
        { chainPlatform: platform, id: "walletconnect" },
      ]);
    },
  );

  it("returns suffixed adapter ids and names when multiple namespaces are requested", async () => {
    const adapters = await createWalletConnectAdapters({
      namespaces: { evm: ["eip155:1"], svm: [SOL_MAINNET_ID] },
      projectId: "test",
      universalProvider: fakeUniversalProvider(createFakeProvider()),
    });
    expect(adapters.map(({ id, name }) => ({ id, name }))).toEqual([
      { id: "walletconnect-evm", name: "WalletConnect (EVM)" },
      { id: "walletconnect-svm", name: "WalletConnect (SVM)" },
    ]);
  });

  it("falls back to a namespace's default chains when an empty array is passed", async () => {
    const provider = createFakeProvider();
    const [adapter] = await createWalletConnectAdapters({
      namespaces: { evm: [] },
      projectId: "test",
      universalProvider: fakeUniversalProvider(provider),
    });
    await adapter?.connect();
    expect(provider.connectCalls[0]?.namespaces.eip155?.chains).toEqual(["eip155:1"]);
  });
});

const createEvmAndSvmAdapters = async (
  provider: FakeProvider,
): Promise<{ evm: EvmAdapter; svm: SvmAdapter }> => {
  const adapters = await createWalletConnectAdapters({
    namespaces: { evm: ["eip155:1"], svm: [SOL_MAINNET_ID, SOL_DEVNET_ID] },
    projectId: "test",
    universalProvider: fakeUniversalProvider(provider),
  });
  const [evm, svm] = adapters;
  if (evm?.chainPlatform !== "evm" || svm?.chainPlatform !== "svm") {
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
    expect(call?.namespaces.eip155?.chains).toEqual(["eip155:1"]);
    expect(call?.optionalNamespaces?.solana?.chains).toEqual([SOL_MAINNET_ID, SOL_DEVNET_ID]);
    expect(call?.optionalNamespaces?.solana?.methods).toContain("solana_signAndSendTransaction");
  });

  it("asks the wallet for genesis-hash ids when given butr's Solana chains", async () => {
    const provider = createFakeProvider();
    const [adapter] = await createWalletConnectAdapters({
      namespaces: { svm: [SVM_CHAINS.mainnet.id, SVM_CHAINS.devnet.id] },
      projectId: "test",
      universalProvider: fakeUniversalProvider(provider),
    });

    await adapter?.connect();

    expect(provider.connectCalls[0]?.namespaces.solana?.chains).toEqual([
      SOL_MAINNET_ID,
      SOL_DEVNET_ID,
    ]);
  });

  it("shares one pairing between siblings, even when they connect concurrently", async () => {
    const provider = createFakeProvider();
    const { evm, svm } = await createEvmAndSvmAdapters(provider);

    await Promise.all([evm.connect(), svm.connect()]);
    await svm.connect();

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

describe("createWalletConnectAdapters (request routing)", () => {
  const connectBoth = async () => {
    const provider = createFakeProvider({
      accounts: {
        eip155: [`eip155:1:${EVM_ADDRESS}`],
        solana: [`${SOL_MAINNET_ID}:${SOL_ADDRESS}`, `${SOL_DEVNET_ID}:${SOL_ADDRESS}`],
      },
      request: (args) => {
        if (args.method === "eth_chainId") {
          return 1;
        }
        if (args.method === "eth_accounts") {
          return [EVM_ADDRESS];
        }
        return args.method === "personal_sign" ? "0xdeadbeef" : { signature: "111" };
      },
    });
    const adapters = await createEvmAndSvmAdapters(provider);
    await adapters.evm.connect();
    await adapters.svm.connect();
    return { ...adapters, provider };
  };

  it("names each namespace's chain, so a Solana request never reaches eip155", async () => {
    const { evm, provider, svm } = await connectBoth();

    await svm.signMessage?.(new Uint8Array([1]));
    await evm.signMessage?.(new Uint8Array([1]));

    const routed = walletRequests(provider)
      .filter(({ args }) => args.method !== "eth_accounts")
      .map(({ args, chain }) => [args.method, chain]);
    expect(routed).toEqual([
      ["solana_signMessage", SOL_MAINNET_ID],
      ["personal_sign", "eip155:1"],
    ]);
    expect(provider.requests.every(({ chain }) => chain !== undefined)).toBe(true);
  });

  it("routes later calls to the chain switchChain picked", async () => {
    const { provider, svm } = await connectBoth();

    await svm.switchChain?.(SOL_DEVNET);
    await svm.signMessage?.(new Uint8Array([1]));

    expect(walletRequests(provider).at(-1)?.chain).toBe(SOL_DEVNET_ID);
    await expect(svm.getAccounts()).resolves.toEqual([buildAccount(SOL_ADDRESS, SOL_DEVNET)]);
  });

  it("routes one sendTx to options.chain and rejects a chain the session did not approve", async () => {
    const { provider, svm } = await connectBoth();

    await svm.sendTx?.(new Uint8Array([1]), { chain: SOL_DEVNET });
    expect(walletRequests(provider).at(-1)?.chain).toBe(SOL_DEVNET_ID);

    await expect(svm.sendTx?.(new Uint8Array([1]), { chain: SVM_CHAINS.testnet })).rejects.toThrow(
      /did not approve Solana chain/v,
    );
    await expect(
      svm.sendTx?.(new Uint8Array([1]), {
        chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" },
      }),
    ).rejects.toThrow(/non-Solana chain/v);
  });
});

const flush = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

describe("createWalletConnectAdapters (EVM events in a mixed session)", () => {
  const subscribeEvm = async () => {
    const provider = createFakeProvider({
      accounts: { eip155: [`eip155:1:${EVM_ADDRESS}`] },
      request: (args) => {
        if (args.method === "eth_chainId") {
          return 1;
        }
        return args.method === "eth_accounts" ? [EVM_ADDRESS] : null;
      },
    });
    const { evm } = await createEvmAndSvmAdapters(provider);
    await evm.connect();
    const listener = vi.fn<(event: ConnectorEvent) => void>();
    const unsubscribe = evm.subscribe?.(listener);
    return { listener, provider, unsubscribe };
  };

  it("ignores another namespace's accountsChanged and chainChanged", async () => {
    const { listener, provider, unsubscribe } = await subscribeEvm();

    // UniversalProvider strips the CAIP-10 prefix and emits bare values.
    provider.emit("accountsChanged", [SOL_ADDRESS]);
    provider.emit("accountsChanged", [SUI_ADDRESS]);
    provider.emit("chainChanged", "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp");
    provider.emit("chainChanged", "000000000019d6689c085ae165831e93");
    provider.emit("chainChanged", "mainnet");
    for (const chainId of [
      SOL_MAINNET_ID,
      "sui:mainnet",
      "bip122:000000000019d6689c085ae165831e93",
    ]) {
      // Even EVM-shaped data and empty lists belong to the envelope's namespace.
      provider.emit("session_event", {
        params: { chainId, event: { data: [], name: "accountsChanged" } },
      });
      provider.emit("session_event", {
        params: { chainId, event: { data: [EVM_ADDRESS], name: "accountsChanged" } },
      });
      provider.emit("session_event", {
        params: { chainId, event: { data: 137, name: "chainChanged" } },
      });
    }
    await flush();

    expect(listener).not.toHaveBeenCalled();
    unsubscribe?.();
  });

  it.each([EVM_ADDRESS, `eip155:1:${EVM_ADDRESS}`])(
    "forwards an EVM account (%s) once",
    async (address) => {
      const { listener, provider, unsubscribe } = await subscribeEvm();

      // UniversalProvider emits the bare projection before the original envelope.
      provider.emit("accountsChanged", [EVM_ADDRESS]);
      provider.emit("session_event", {
        params: { chainId: "eip155:1", event: { data: [address], name: "accountsChanged" } },
      });
      await flush();

      expect(listener).toHaveBeenCalledExactlyOnceWith({
        accounts: [buildAccount(EVM_ADDRESS, EVM_CHAINS.ethereum)],
        type: "accountsChanged",
      });
      unsubscribe?.();
    },
  );

  it("forwards an empty EVM accountsChanged as disconnected", async () => {
    const { listener, provider, unsubscribe } = await subscribeEvm();

    provider.emit("accountsChanged", []);
    provider.emit("session_event", {
      params: { chainId: "eip155:1", event: { data: [], name: "accountsChanged" } },
    });

    expect(listener).toHaveBeenCalledExactlyOnceWith({ type: "disconnected" });
    unsubscribe?.();
  });

  it.each([137, "137", "0x89", "eip155:137"])(
    "forwards an EVM chainChanged (%s) once",
    async (chain) => {
      const { listener, provider, unsubscribe } = await subscribeEvm();

      provider.emit("chainChanged", "137");
      provider.emit("session_event", {
        params: { chainId: "eip155:1", event: { data: chain, name: "chainChanged" } },
      });
      await flush();

      expect(listener).toHaveBeenCalledExactlyOnceWith({
        accounts: [buildAccount(EVM_ADDRESS, EVM_CHAINS.polygon)],
        type: "accountsChanged",
      });
      unsubscribe?.();
    },
  );

  it("ignores malformed remote events instead of inventing a disconnect", async () => {
    const { listener, provider, unsubscribe } = await subscribeEvm();

    provider.emit("session_event", { params: { chainId: "eip155:1" } });
    provider.emit("session_event", {
      params: { chainId: "eip155:1", event: { data: [7], name: "accountsChanged" } },
    });
    provider.emit("session_event", {
      params: { chainId: "eip155:1", event: { data: "bad", name: "chainChanged" } },
    });
    await flush();

    expect(listener).not.toHaveBeenCalled();
    unsubscribe?.();
  });

  it("still forwards the session-wide disconnect, and unsubscribes every wrapper", async () => {
    const { listener, provider, unsubscribe } = await subscribeEvm();

    provider.emit("disconnect", { code: 6000, message: "User disconnected." });
    expect(listener).toHaveBeenCalledExactlyOnceWith({ type: "disconnected" });

    unsubscribe?.();
    const attached = provider.onCalls.filter(({ event }) => event !== "display_uri");
    const detached = provider.removeListenerCalls.filter(({ event }) => event !== "display_uri");
    expect(detached).toEqual(attached);
  });
});
