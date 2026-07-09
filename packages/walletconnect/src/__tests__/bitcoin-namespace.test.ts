import type { BitcoinAdapter, WalletAdapter } from "@usebutr/core";
import { describe, expect, it } from "vitest";

import type { UniversalProviderLike } from "../adapter";
import { bitcoinNamespace } from "../namespaces/bitcoin";

/** signTransaction only exists on the bitcoin variant of the
 *  WalletAdapter union — narrow on the discriminant before calling. */
const expectBitcoinAdapter = (adapter: WalletAdapter): BitcoinAdapter => {
  if (adapter.chainPlatform !== "bitcoin") {
    throw new Error("expected a bitcoin adapter");
  }
  return adapter;
};

type RequestArgs = Parameters<UniversalProviderLike["request"]>[0];
type ConnectArgs = Parameters<UniversalProviderLike["connect"]>[0];
type Session = {
  namespaces?: Record<string, { accounts?: ReadonlyArray<string> }>;
} | null;

const MAINNET = "bip122:000000000019d6689c085ae165831e93";
const TESTNET = "bip122:000000000933ea01ad0ee984209779ba";
const REGTEST = "bip122:0f9188f13cb7b2c71f2a335e3a4fc328";

const bytesToHex = (bytes: Uint8Array): string => {
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
};

const createFakeProvider = (overrides?: {
  request?: (args: RequestArgs) => Promise<unknown>;
  session?: Session;
}): UniversalProviderLike & {
  connectCalls: Array<ConnectArgs>;
  requestCalls: Array<RequestArgs>;
} => {
  const listeners = new Map<string, Set<(...args: ReadonlyArray<unknown>) => void>>();
  const connectCalls: Array<ConnectArgs> = [];
  const requestCalls: Array<RequestArgs> = [];

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
    request(args) {
      requestCalls.push(args);
      return overrides?.request ? overrides.request(args) : Promise.resolve(null);
    },
    requestCalls,
    session: overrides?.session ?? null,
  };
};

describe("bitcoinNamespace", () => {
  it("declares the right CAIP prefix and chain platform", () => {
    expect(bitcoinNamespace.caipPrefix).toBe("bip122");
    expect(bitcoinNamespace.chainPlatform).toBe("bitcoin");
    expect(bitcoinNamespace.defaultChains).toEqual([MAINNET]);
    expect(bitcoinNamespace.defaultMethods).toContain("signMessage");
    expect(bitcoinNamespace.defaultMethods).toContain("signPsbt");
    expect(bitcoinNamespace.defaultMethods).toContain("sendTransfer");
    expect(bitcoinNamespace.defaultEvents).toContain("bip122_addressesChanged");
  });

  it("builds an adapter with the expected identity and capabilities", () => {
    const provider = createFakeProvider();
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET],
      icon: "data:image/svg+xml;base64,Zm9v",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    expect(adapter.id).toBe("walletconnect-bitcoin");
    expect(adapter.name).toBe("WalletConnect (BITCOIN)");
    expect(adapter.icon).toBe("data:image/svg+xml;base64,Zm9v");
    expect(adapter.chainPlatform).toBe("bitcoin");
    expect(adapter.capabilities.sendTransaction).toBe(true);
    expect(adapter.capabilities.signMessage).toBe(true);
    expect(adapter.capabilities.signTransaction).toBe(true);
    expect(adapter.capabilities.signIn).toBe(false);
    expect(adapter.capabilities.subscribe).toBe(false);
    expect(adapter.capabilities.switchChain).toBe(true);
    expect(adapter.capabilities.getBalance).toBe(false);
    expect(adapter.capabilities.getTransactionReceipt).toBe(false);
    expect(adapter.capabilities.requestAccounts).toBe(false);
  });

  it("connect() drives the WC namespace handshake with the bip122 methods + events", async () => {
    const provider = createFakeProvider();
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET, TESTNET],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    await adapter.connect();

    expect(provider.connectCalls).toHaveLength(1);
    const namespace = provider.connectCalls[0]?.namespaces["bip122"];
    expect(namespace?.chains).toEqual([MAINNET, TESTNET]);
    expect(namespace?.methods).toContain("signMessage");
    expect(namespace?.methods).toContain("signPsbt");
    expect(namespace?.methods).toContain("sendTransfer");
    expect(namespace?.events).toContain("bip122_addressesChanged");
  });

  it("connect() short-circuits when a session already exists", async () => {
    const provider = createFakeProvider({ session: { namespaces: {} } });
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    await adapter.connect();
    expect(provider.connectCalls).toHaveLength(0);
  });

  it("connect({ silent: true }) without a session rejects rather than prompting", async () => {
    const provider = createFakeProvider();
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    await expect(adapter.connect({ silent: true })).rejects.toThrow(/silent reconnect/v);
  });

  it("getAccount / getAccounts parse CAIP-10 addresses from the session", async () => {
    const provider = createFakeProvider({
      session: {
        namespaces: {
          bip122: { accounts: [`${MAINNET}:bc1qabc123`] },
        },
      },
    });
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    const account = await adapter.getAccount();
    expect(account?.walletAddress).toBe("bc1qabc123");
    expect(account?.chain.namespace).toBe("bip122");
    expect(account?.chain.id).toBe(MAINNET);
    expect(account?.chain.reference).toBe("000000000019d6689c085ae165831e93");

    const accounts = await adapter.getAccounts?.();
    expect(accounts).toHaveLength(1);
    expect(accounts?.[0]?.walletAddress).toBe("bc1qabc123");
  });

  it("getAccounts surfaces all session accounts when the wallet exposes multiple addresses", async () => {
    const provider = createFakeProvider({
      session: {
        namespaces: {
          bip122: {
            accounts: [`${MAINNET}:bc1qaaa`, `${TESTNET}:tb1qbbb`],
          },
        },
      },
    });
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET, TESTNET],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    const accounts = await adapter.getAccounts?.();
    expect(accounts).toHaveLength(2);
    expect(accounts?.map((a) => a.walletAddress)).toEqual(["bc1qaaa", "tb1qbbb"]);
  });

  it("signMessage routes through bip122 signMessage with utf-8 message + hex signature decode", async () => {
    const provider = createFakeProvider({
      request: (args) => {
        if (args.method === "signMessage") {
          return Promise.resolve({ address: "bc1qabc123", signature: "deadbeef" });
        }
        return Promise.resolve(null);
      },
      session: {
        namespaces: {
          bip122: { accounts: [`${MAINNET}:bc1qabc123`] },
        },
      },
    });
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    const msgBytes = new TextEncoder().encode("hello");
    const result = await adapter.signMessage(msgBytes);

    expect(provider.requestCalls).toHaveLength(1);
    const call = provider.requestCalls[0];
    expect(call?.method).toBe("signMessage");
    expect(call?.params).toMatchObject({
      account: "bc1qabc123",
      address: "bc1qabc123",
      message: "hello",
    });
    expect(bytesToHex(result.signature)).toBe("deadbeef");
    expect(result.signedMessage).toEqual(msgBytes);
  });

  it("signMessage accepts a leading 0x on the signature hex", async () => {
    const provider = createFakeProvider({
      request: () => Promise.resolve({ signature: "0xcafebabe" }),
      session: {
        namespaces: {
          bip122: { accounts: [`${MAINNET}:bc1qabc123`] },
        },
      },
    });
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    const result = await adapter.signMessage(new TextEncoder().encode("hi"));
    expect(bytesToHex(result.signature)).toBe("cafebabe");
  });

  it("signTransaction routes through signPsbt with broadcast:false and decodes base64 PSBT", async () => {
    const signedBytes = new Uint8Array([7, 8, 9, 10]);
    const signedB64 = btoa(String.fromCodePoint(...signedBytes));
    const provider = createFakeProvider({
      request: (args) => {
        if (args.method === "signPsbt") {
          return Promise.resolve({ psbt: signedB64 });
        }
        return Promise.resolve(null);
      },
      session: {
        namespaces: {
          bip122: { accounts: [`${MAINNET}:bc1qabc123`] },
        },
      },
    });
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    const out = await expectBitcoinAdapter(adapter).signTransaction?.(new Uint8Array([1, 2, 3]));
    expect(provider.requestCalls[0]?.method).toBe("signPsbt");
    expect(provider.requestCalls[0]?.params).toMatchObject({
      account: "bc1qabc123",
      broadcast: false,
      psbt: btoa(String.fromCodePoint(1, 2, 3)),
    });
    expect(out).toEqual(signedBytes);
  });

  it("signTransaction accepts a base64 string PSBT input as well as Uint8Array", async () => {
    const signedBytes = new Uint8Array([7, 8, 9]);
    const signedB64 = btoa(String.fromCodePoint(...signedBytes));
    const provider = createFakeProvider({
      request: () => Promise.resolve({ psbt: signedB64 }),
      session: {
        namespaces: {
          bip122: { accounts: [`${MAINNET}:bc1qabc123`] },
        },
      },
    });
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    const out = await expectBitcoinAdapter(adapter).signTransaction?.("cHNidA==");
    expect(provider.requestCalls[0]?.params).toMatchObject({ psbt: "cHNidA==" });
    expect(out).toEqual(signedBytes);
  });

  it("sendTx routes through signPsbt with broadcast:true and returns the txid", async () => {
    const provider = createFakeProvider({
      request: (args) => {
        if (args.method === "signPsbt") {
          return Promise.resolve({ psbt: "cHNidA==", txid: "0xdeadbeef" });
        }
        return Promise.resolve(null);
      },
      session: {
        namespaces: {
          bip122: { accounts: [`${MAINNET}:bc1qabc123`] },
        },
      },
    });
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    const txid = await adapter.sendTx(new Uint8Array([9, 8, 7]));
    expect(provider.requestCalls[0]?.method).toBe("signPsbt");
    expect(provider.requestCalls[0]?.params).toMatchObject({
      account: "bc1qabc123",
      broadcast: true,
      psbt: btoa(String.fromCodePoint(9, 8, 7)),
    });
    expect(txid).toBe("0xdeadbeef");
  });

  it("sendTx throws when the response is missing a txid", async () => {
    const provider = createFakeProvider({
      request: () => Promise.resolve({ psbt: "cHNidA==" }),
      session: {
        namespaces: {
          bip122: { accounts: [`${MAINNET}:bc1qabc123`] },
        },
      },
    });
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    await expect(adapter.sendTx(new Uint8Array([1]))).rejects.toThrow(/no txid/v);
  });

  it("sendTxToChain forwards through sendTx and fires the callback", async () => {
    const provider = createFakeProvider({
      request: () => Promise.resolve({ txid: "0xfeed" }),
      session: {
        namespaces: {
          bip122: { accounts: [`${MAINNET}:bc1qabc123`] },
        },
      },
    });
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    let calls = 0;
    const txid = await adapter.sendTxToChain(new Uint8Array([1, 2, 3]), TESTNET, undefined, () => {
      calls += 1;
    });
    expect(txid).toBe("0xfeed");
    expect(calls).toBe(1);
  });

  it("routes signMessage through a specific account when one is passed", async () => {
    const provider = createFakeProvider({
      request: () => Promise.resolve({ signature: "dead" }),
      session: {
        namespaces: {
          bip122: {
            accounts: [`${MAINNET}:bc1qaaa`, `${MAINNET}:bc1qbbb`],
          },
        },
      },
    });
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    const accounts = await adapter.getAccounts?.();
    const target = accounts?.find((a) => a.walletAddress === "bc1qbbb");
    expect(target).toBeDefined();

    await adapter.signMessage(new TextEncoder().encode("hi"), target);
    expect(provider.requestCalls[0]?.params).toMatchObject({
      account: "bc1qbbb",
      address: "bc1qbbb",
    });
  });

  it("switchChain works across mainnet, testnet, and regtest; non-bip122 rejects", async () => {
    const provider = createFakeProvider({
      request: () => Promise.resolve({ signature: "dead" }),
      session: {
        namespaces: {
          bip122: {
            accounts: [`${MAINNET}:bc1qaaa`, `${TESTNET}:tb1qbbb`, `${REGTEST}:bcrt1qccc`],
          },
        },
      },
    });
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET, TESTNET, REGTEST],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    await adapter.switchChain({
      id: TESTNET,
      name: "Bitcoin Testnet",
      namespace: "bip122",
      reference: "000000000933ea01ad0ee984209779ba",
    });
    let active = await adapter.getAccount();
    expect(active?.chain.id).toBe(TESTNET);

    await adapter.switchChain({
      id: REGTEST,
      name: "Bitcoin Regtest",
      namespace: "bip122",
      reference: "0f9188f13cb7b2c71f2a335e3a4fc328",
    });
    active = await adapter.getAccount();
    expect(active?.chain.id).toBe(REGTEST);

    expect(() =>
      adapter.switchChain({
        id: "solana:mainnet",
        name: "Solana",
        namespace: "solana",
        reference: "mainnet",
      }),
    ).toThrow(/non-Bitcoin chain/v);
  });

  it("getAccount reflects session account drift (simulating an addressesChanged event)", async () => {
    let accounts: ReadonlyArray<string> = [`${MAINNET}:bc1qaaa`];
    const provider: UniversalProviderLike = {
      connect: () => Promise.resolve(),
      disconnect: () => Promise.resolve(),
      on: () => {},
      removeListener: () => {},
      request: () => Promise.resolve(null),
      get session() {
        return { namespaces: { bip122: { accounts } } };
      },
    };
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    let active = await adapter.getAccount();
    expect(active?.walletAddress).toBe("bc1qaaa");

    // Simulate the wallet exposing a different account after a
    // session_update (WC mutates the session in place).
    accounts = [`${MAINNET}:bc1qbbb`];
    active = await adapter.getAccount();
    expect(active?.walletAddress).toBe("bc1qbbb");
  });

  it("signMessage throws when the response has no signature", async () => {
    const provider = createFakeProvider({
      request: () => Promise.resolve({}),
      session: {
        namespaces: {
          bip122: { accounts: [`${MAINNET}:bc1qabc123`] },
        },
      },
    });
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    await expect(adapter.signMessage(new TextEncoder().encode("x"))).rejects.toThrow(
      /no signature/v,
    );
  });

  it("signTransaction throws when the response has no psbt", async () => {
    const provider = createFakeProvider({
      request: () => Promise.resolve({}),
      session: {
        namespaces: {
          bip122: { accounts: [`${MAINNET}:bc1qabc123`] },
        },
      },
    });
    const adapter = bitcoinNamespace.buildAdapter({
      chains: [MAINNET],
      icon: "x",
      id: "walletconnect-bitcoin",
      name: "WalletConnect (BITCOIN)",
      provider,
    });

    await expect(
      expectBitcoinAdapter(adapter).signTransaction?.(new Uint8Array([1])),
    ).rejects.toThrow(/no psbt/v);
  });
});
