import type { SuiAdapter, WalletAdapter } from "@usebutr/core";
import { describe, expect, it } from "vitest";

import type { UniversalProviderLike } from "../adapter";
import { suiNamespace } from "../namespaces/sui";

/** signTransaction only exists on the sui variant of the
 *  WalletAdapter union; narrow on the discriminant before calling. */
const expectSuiAdapter = (adapter: WalletAdapter): SuiAdapter => {
  if (adapter.chainPlatform !== "sui") {
    throw new Error("expected a sui adapter");
  }
  return adapter;
};

type RequestArgs = Parameters<UniversalProviderLike["request"]>[0];
type ConnectArgs = Parameters<UniversalProviderLike["connect"]>[0];
type Session = {
  namespaces?: Record<string, { accounts?: ReadonlyArray<string> }>;
} | null;

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

describe("suiNamespace", () => {
  it("declares the right CAIP prefix and chain platform", () => {
    expect(suiNamespace.caipPrefix).toBe("sui");
    expect(suiNamespace.chainPlatform).toBe("sui");
    expect(suiNamespace.defaultChains).toEqual(["sui:mainnet"]);
    expect(suiNamespace.defaultMethods).toContain("sui_signTransaction");
    expect(suiNamespace.defaultMethods).toContain("sui_signAndExecuteTransaction");
    expect(suiNamespace.defaultMethods).toContain("sui_signPersonalMessage");
    expect(suiNamespace.defaultEvents).toContain("accountsChanged");
    expect(suiNamespace.defaultEvents).toContain("chainChanged");
  });

  it("builds an adapter with the expected identity and capabilities", () => {
    const provider = createFakeProvider();
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet"],
      icon: "data:image/svg+xml;base64,Zm9v",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    expect(adapter.id).toBe("walletconnect-sui");
    expect(adapter.name).toBe("WalletConnect (SUI)");
    expect(adapter.icon).toBe("data:image/svg+xml;base64,Zm9v");
    expect(adapter.chainPlatform).toBe("sui");
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

  it("connect() drives the WC namespace handshake with the sui methods + events", async () => {
    const provider = createFakeProvider();
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet", "sui:testnet"],
      icon: "x",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    await adapter.connect();

    expect(provider.connectCalls).toHaveLength(1);
    const namespace = provider.connectCalls[0]?.namespaces["sui"];
    expect(namespace?.chains).toEqual(["sui:mainnet", "sui:testnet"]);
    expect(namespace?.methods).toContain("sui_signTransaction");
    expect(namespace?.methods).toContain("sui_signAndExecuteTransaction");
    expect(namespace?.methods).toContain("sui_signPersonalMessage");
    expect(namespace?.events).toContain("accountsChanged");
  });

  it("connect() short-circuits when a session already exists", async () => {
    const provider = createFakeProvider({ session: { namespaces: {} } });
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet"],
      icon: "x",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    await adapter.connect();
    expect(provider.connectCalls).toHaveLength(0);
  });

  it("connect({ silent: true }) without a session rejects rather than prompting", async () => {
    const provider = createFakeProvider();
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet"],
      icon: "x",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    await expect(adapter.connect({ silent: true })).rejects.toThrow(/silent reconnect/v);
  });

  it("getAccount / getAccounts parse CAIP-10 addresses from the session", async () => {
    const provider = createFakeProvider({
      session: {
        namespaces: {
          sui: { accounts: ["sui:mainnet:0xabc1234567890abcdef"] },
        },
      },
    });
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet"],
      icon: "x",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    const account = await adapter.getAccount();
    expect(account?.walletAddress).toBe("0xabc1234567890abcdef");
    expect(account?.chain.namespace).toBe("sui");
    expect(account?.chain.id).toBe("sui:mainnet");

    const accounts = await adapter.getAccounts?.();
    expect(accounts).toHaveLength(1);
    expect(accounts?.[0]?.walletAddress).toBe("0xabc1234567890abcdef");
  });

  it("getAccounts surfaces all session accounts when the wallet exposes multiple addresses", async () => {
    const provider = createFakeProvider({
      session: {
        namespaces: {
          sui: {
            accounts: ["sui:mainnet:0xaaa111", "sui:testnet:0xbbb222"],
          },
        },
      },
    });
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet", "sui:testnet"],
      icon: "x",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    const accounts = await adapter.getAccounts?.();
    expect(accounts).toHaveLength(2);
    expect(accounts?.map((a) => a.walletAddress)).toEqual(["0xaaa111", "0xbbb222"]);
  });

  it("signMessage routes through sui_signPersonalMessage and decodes base64 signature + bytes", async () => {
    const echoedBytes = new Uint8Array([4, 5, 6]);
    const echoedB64 = btoa(String.fromCodePoint(...echoedBytes));
    const provider = createFakeProvider({
      request: (args) => {
        if (args.method === "sui_signPersonalMessage") {
          return Promise.resolve({ bytes: echoedB64, signature: "Zm9v" }); // "foo"
        }
        return Promise.resolve(null);
      },
      session: {
        namespaces: {
          sui: { accounts: ["sui:mainnet:0xabc1234567890abcdef"] },
        },
      },
    });
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet"],
      icon: "x",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    const result = await adapter.signMessage(new Uint8Array([1, 2, 3]));

    expect(provider.requestCalls).toHaveLength(1);
    const call = provider.requestCalls[0];
    expect(call?.method).toBe("sui_signPersonalMessage");
    expect(call?.params).toMatchObject({
      address: "0xabc1234567890abcdef",
      message: btoa(String.fromCodePoint(1, 2, 3)),
    });
    // "Zm9v" base64 = "foo" = [102, 111, 111]
    expect(result.signature).toEqual(new Uint8Array([102, 111, 111]));
    expect(result.signedMessage).toEqual(echoedBytes);
  });

  it("signMessage falls back to the input bytes when the wallet omits `bytes`", async () => {
    const provider = createFakeProvider({
      request: () => Promise.resolve({ signature: "Zm9v" }),
      session: {
        namespaces: {
          sui: { accounts: ["sui:mainnet:0xabc1234567890abcdef"] },
        },
      },
    });
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet"],
      icon: "x",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    const msg = new Uint8Array([1, 2, 3]);
    const result = await adapter.signMessage(msg);
    expect(result.signedMessage).toEqual(msg);
    expect(result.signature).toEqual(new Uint8Array([102, 111, 111]));
  });

  it("signTransaction returns the base64-decoded signed transaction bytes (`transactionBytes`)", async () => {
    const signedBytes = new Uint8Array([7, 8, 9, 10]);
    const signedB64 = btoa(String.fromCodePoint(...signedBytes));
    const provider = createFakeProvider({
      request: (args) => {
        if (args.method === "sui_signTransaction") {
          return Promise.resolve({ signature: "Zm9v", transactionBytes: signedB64 });
        }
        return Promise.resolve(null);
      },
      session: {
        namespaces: {
          sui: { accounts: ["sui:mainnet:0xabc1234567890abcdef"] },
        },
      },
    });
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet"],
      icon: "x",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    const out = await expectSuiAdapter(adapter).signTransaction?.(new Uint8Array([1, 2, 3]));
    expect(provider.requestCalls[0]?.method).toBe("sui_signTransaction");
    expect(provider.requestCalls[0]?.params).toMatchObject({
      address: "0xabc1234567890abcdef",
      transaction: btoa(String.fromCodePoint(1, 2, 3)),
    });
    expect(out).toEqual(signedBytes);
  });

  it("signTransaction also accepts the legacy `transactionBlockBytes` key from older Dappkit wallets", async () => {
    const signedBytes = new Uint8Array([7, 8, 9, 10]);
    const signedB64 = btoa(String.fromCodePoint(...signedBytes));
    const provider = createFakeProvider({
      request: () =>
        Promise.resolve({
          signature: "Zm9v",
          transactionBlockBytes: signedB64,
        }),
      session: {
        namespaces: {
          sui: { accounts: ["sui:mainnet:0xabc1234567890abcdef"] },
        },
      },
    });
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet"],
      icon: "x",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    const out = await expectSuiAdapter(adapter).signTransaction?.(new Uint8Array([1, 2, 3]));
    expect(out).toEqual(signedBytes);
  });

  it("signTransaction accepts a base64 string tx input as well as Uint8Array", async () => {
    const signedBytes = new Uint8Array([7, 8, 9]);
    const signedB64 = btoa(String.fromCodePoint(...signedBytes));
    const provider = createFakeProvider({
      request: () =>
        Promise.resolve({
          signature: "Zm9v",
          transactionBytes: signedB64,
        }),
      session: {
        namespaces: {
          sui: { accounts: ["sui:mainnet:0xabc1234567890abcdef"] },
        },
      },
    });
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet"],
      icon: "x",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    const out = await expectSuiAdapter(adapter).signTransaction?.("AAEC");
    expect(provider.requestCalls[0]?.params).toMatchObject({ transaction: "AAEC" });
    expect(out).toEqual(signedBytes);
  });

  it("sendTx routes through sui_signAndExecuteTransaction and returns the digest", async () => {
    const provider = createFakeProvider({
      request: (args) => {
        if (args.method === "sui_signAndExecuteTransaction") {
          return Promise.resolve({ digest: "0xdeadbeef" });
        }
        return Promise.resolve(null);
      },
      session: {
        namespaces: {
          sui: { accounts: ["sui:mainnet:0xabc1234567890abcdef"] },
        },
      },
    });
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet"],
      icon: "x",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    const digest = await adapter.sendTx(new Uint8Array([9, 8, 7]));
    expect(provider.requestCalls[0]?.method).toBe("sui_signAndExecuteTransaction");
    expect(provider.requestCalls[0]?.params).toMatchObject({
      address: "0xabc1234567890abcdef",
      transaction: btoa(String.fromCodePoint(9, 8, 7)),
    });
    expect(digest).toBe("0xdeadbeef");
  });

  it("sendTx throws when the response is missing a digest", async () => {
    const provider = createFakeProvider({
      request: () => Promise.resolve({}),
      session: {
        namespaces: {
          sui: { accounts: ["sui:mainnet:0xabc1234567890abcdef"] },
        },
      },
    });
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet"],
      icon: "x",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    await expect(adapter.sendTx(new Uint8Array([1]))).rejects.toThrow(/no digest/v);
  });

  it("sendTxToChain forwards through sendTx and fires the callback", async () => {
    const provider = createFakeProvider({
      request: () => Promise.resolve({ digest: "0xfeed" }),
      session: {
        namespaces: {
          sui: { accounts: ["sui:mainnet:0xabc1234567890abcdef"] },
        },
      },
    });
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet"],
      icon: "x",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    let calls = 0;
    const digest = await adapter.sendTxToChain(
      new Uint8Array([1, 2, 3]),
      "sui:testnet",
      undefined,
      () => {
        calls += 1;
      },
    );
    expect(digest).toBe("0xfeed");
    expect(calls).toBe(1);
  });

  it("routes signMessage through a specific account when one is passed", async () => {
    const provider = createFakeProvider({
      request: () => Promise.resolve({ signature: "Zm9v" }),
      session: {
        namespaces: {
          sui: {
            accounts: ["sui:mainnet:0xaaa111", "sui:mainnet:0xbbb222"],
          },
        },
      },
    });
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet"],
      icon: "x",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    const accounts = await adapter.getAccounts?.();
    const target = accounts?.find((a) => a.walletAddress === "0xbbb222");
    expect(target).toBeDefined();

    await adapter.signMessage(new Uint8Array([1]), target);
    expect(provider.requestCalls[0]?.params).toMatchObject({ address: "0xbbb222" });
  });

  it("switchChain updates the active chain for subsequent calls; non-Sui rejects", async () => {
    const provider = createFakeProvider({
      request: () => Promise.resolve({ signature: "Zm9v" }),
      session: {
        namespaces: {
          sui: {
            accounts: ["sui:mainnet:0xaaa111", "sui:testnet:0xbbb222"],
          },
        },
      },
    });
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet", "sui:testnet"],
      icon: "x",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    await adapter.switchChain({
      id: "sui:testnet",
      name: "Sui Testnet",
      namespace: "sui",
      reference: "testnet",
    });

    const first = await adapter.getAccount();
    expect(first?.chain.id).toBe("sui:testnet");

    expect(() =>
      adapter.switchChain({
        id: "solana:mainnet",
        name: "Solana",
        namespace: "solana",
        reference: "mainnet",
      }),
    ).toThrow(/non-Sui chain/v);
  });

  it("getAccount reflects session account drift (simulating an accountsChanged event)", async () => {
    let accounts: ReadonlyArray<string> = ["sui:mainnet:0xaaa111"];
    const provider: UniversalProviderLike = {
      connect: () => Promise.resolve(),
      disconnect: () => Promise.resolve(),
      on: () => {},
      removeListener: () => {},
      request: () => Promise.resolve(null),
      get session() {
        return { namespaces: { sui: { accounts } } };
      },
    };
    const adapter = suiNamespace.buildAdapter({
      chains: ["sui:mainnet"],
      icon: "x",
      id: "walletconnect-sui",
      name: "WalletConnect (SUI)",
      provider,
    });

    let active = await adapter.getAccount();
    expect(active?.walletAddress).toBe("0xaaa111");

    // Simulate the wallet exposing a different account after a
    // session_update (WC mutates the session in place).
    accounts = ["sui:mainnet:0xbbb222"];
    active = await adapter.getAccount();
    expect(active?.walletAddress).toBe("0xbbb222");
  });
});
