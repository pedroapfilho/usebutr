import { describe, expect, it } from "vitest";

import type { UniversalProviderLike } from "../adapter";
import { solanaNamespace } from "../namespaces/svm";

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

describe("solanaNamespace", () => {
  it("declares the right CAIP prefix and chain platform", () => {
    expect(solanaNamespace.caipPrefix).toBe("solana");
    expect(solanaNamespace.chainPlatform).toBe("svm");
    expect(solanaNamespace.defaultChains).toEqual(["solana:mainnet"]);
    expect(solanaNamespace.defaultMethods).toContain("solana_signMessage");
    expect(solanaNamespace.defaultMethods).toContain("solana_signAndSendTransaction");
  });

  it("builds an adapter with the expected identity and capabilities", () => {
    const provider = createFakeProvider();
    const adapter = solanaNamespace.buildAdapter({
      chains: ["solana:mainnet"],
      icon: "data:image/svg+xml;base64,Zm9v",
      id: "walletconnect-svm",
      name: "WalletConnect (SVM)",
      provider,
    });

    expect(adapter.id).toBe("walletconnect-svm");
    expect(adapter.name).toBe("WalletConnect (SVM)");
    expect(adapter.icon).toBe("data:image/svg+xml;base64,Zm9v");
    expect(adapter.chainPlatform).toBe("svm");
    expect(adapter.capabilities.sendTransaction).toBe(true);
    expect(adapter.capabilities.signMessage).toBe(true);
    expect(adapter.capabilities.signTransaction).toBe(true);
    expect(adapter.capabilities.signIn).toBe(false);
    expect(adapter.capabilities.subscribe).toBe(false);
    expect(adapter.capabilities.switchChain).toBe(true);
    expect(adapter.capabilities.getBalance).toBe(false);
  });

  it("connect() drives the WC namespace handshake with the solana methods + events", async () => {
    const provider = createFakeProvider();
    const adapter = solanaNamespace.buildAdapter({
      chains: ["solana:mainnet", "solana:devnet"],
      icon: "x",
      id: "walletconnect-svm",
      name: "WalletConnect (SVM)",
      provider,
    });

    await adapter.connect();

    expect(provider.connectCalls).toHaveLength(1);
    const namespace = provider.connectCalls[0]?.namespaces.solana;
    expect(namespace?.chains).toEqual(["solana:mainnet", "solana:devnet"]);
    expect(namespace?.methods).toContain("solana_signMessage");
    expect(namespace?.methods).toContain("solana_signTransaction");
    expect(namespace?.methods).toContain("solana_signAndSendTransaction");
    expect(namespace?.events).toContain("accountsChanged");
  });

  it("connect() short-circuits when a session already exists", async () => {
    const provider = createFakeProvider({ session: { namespaces: {} } });
    const adapter = solanaNamespace.buildAdapter({
      chains: ["solana:mainnet"],
      icon: "x",
      id: "walletconnect-svm",
      name: "WalletConnect (SVM)",
      provider,
    });

    await adapter.connect();
    expect(provider.connectCalls).toHaveLength(0);
  });

  it("getAccount / getAccounts parse CAIP-10 addresses from the session", async () => {
    const provider = createFakeProvider({
      session: {
        namespaces: {
          solana: { accounts: ["solana:mainnet:Bg9LkP1234567890abcdefghijkmnopqrstuvwxy"] },
        },
      },
    });
    const adapter = solanaNamespace.buildAdapter({
      chains: ["solana:mainnet"],
      icon: "x",
      id: "walletconnect-svm",
      name: "WalletConnect (SVM)",
      provider,
    });

    const account = await adapter.getAccount();
    expect(account?.walletAddress).toBe("Bg9LkP1234567890abcdefghijkmnopqrstuvwxy");
    expect(account?.chain.namespace).toBe("solana");

    const accounts = await adapter.getAccounts?.();
    expect(accounts).toHaveLength(1);
  });

  it("signMessage routes through solana_signMessage with base64 message + base58 signature", async () => {
    const provider = createFakeProvider({
      request: (args) => {
        if (args.method === "solana_signMessage") {
          // "111" base58 = 3 leading-zero bytes; easy to verify.
          return Promise.resolve({ signature: "111" });
        }
        return Promise.resolve(null);
      },
      session: {
        namespaces: {
          solana: { accounts: ["solana:mainnet:Bg9LkP1234567890abcdefghijkmnopqrstuvwxy"] },
        },
      },
    });
    const adapter = solanaNamespace.buildAdapter({
      chains: ["solana:mainnet"],
      icon: "x",
      id: "walletconnect-svm",
      name: "WalletConnect (SVM)",
      provider,
    });

    const result = await adapter.signMessage(new Uint8Array([1, 2, 3]));

    expect(provider.requestCalls).toHaveLength(1);
    const call = provider.requestCalls[0];
    expect(call?.method).toBe("solana_signMessage");
    expect(call?.params).toMatchObject({
      message: btoa(String.fromCodePoint(1, 2, 3)),
      pubkey: "Bg9LkP1234567890abcdefghijkmnopqrstuvwxy",
    });
    expect(result.signature).toEqual(new Uint8Array([0, 0, 0]));
    expect(result.signedMessage).toEqual(new Uint8Array([1, 2, 3]));
  });

  it("sendTx routes through solana_signAndSendTransaction and returns the signature", async () => {
    const provider = createFakeProvider({
      request: (args) => {
        if (args.method === "solana_signAndSendTransaction") {
          return Promise.resolve({ signature: "abc123" });
        }
        return Promise.resolve(null);
      },
      session: {
        namespaces: {
          solana: { accounts: ["solana:mainnet:Bg9LkP1234567890abcdefghijkmnopqrstuvwxy"] },
        },
      },
    });
    const adapter = solanaNamespace.buildAdapter({
      chains: ["solana:mainnet"],
      icon: "x",
      id: "walletconnect-svm",
      name: "WalletConnect (SVM)",
      provider,
    });

    const sig = await adapter.sendTx(new Uint8Array([9, 8, 7]));

    expect(provider.requestCalls[0]?.method).toBe("solana_signAndSendTransaction");
    expect(sig).toBe("abc123");
  });
});
