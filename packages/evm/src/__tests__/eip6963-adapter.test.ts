import type { ConnectorEvent } from "@usebutr/core";
import { buildAccount, EVM_CHAINS } from "@usebutr/core";
import { describe, expect, it, vi } from "vitest";

import type {
  Eip1193Listener,
  Eip1193Provider,
  Eip1193RequestArgs,
  Eip1193Value,
  Eip6963ProviderInfo,
} from "../eip1193";
import {
  buildEvmAdapter,
  chainIdDecimalToHex,
  chainIdHexToDecimal,
  formatEther,
} from "../eip6963-adapter";

const INFO: Eip6963ProviderInfo = {
  icon: "data:image/svg+xml;base64,...",
  name: "Mock EIP-6963 Wallet",
  rdns: "io.mock.wallet",
  uuid: "uuid-1",
};

type MockProviderHandle = Eip1193Provider & {
  emit: (event: string, ...args: ReadonlyArray<Eip1193Value | undefined>) => void;
  methods: () => Array<string>;
  requests: Array<Eip1193RequestArgs>;
  setHandler: (
    method: string,
    handler: (params: Eip1193RequestArgs["params"]) => Eip1193Value | undefined,
  ) => void;
};

const createMockProvider = (): MockProviderHandle => {
  const listeners = new Map<string, Set<Eip1193Listener>>();
  const handlers = new Map<
    string,
    (params: Eip1193RequestArgs["params"]) => Eip1193Value | undefined
  >();
  const requests: Array<Eip1193RequestArgs> = [];

  return {
    emit(event, ...args) {
      const set = listeners.get(event);
      if (!set) {
        return;
      }
      for (const listener of set) {
        listener(...args);
      }
    },
    methods: () => requests.map(({ method }) => method),
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
    request({ method, params }) {
      requests.push({ method, params });
      const handler = handlers.get(method);
      return Promise.resolve(handler ? handler(params) : undefined);
    },
    requests,
    setHandler(method, handler) {
      handlers.set(method, handler);
    },
  };
};

/** A wallet on Ethereum mainnet exposing `addresses`, active first. */
const connectedProvider = (addresses: ReadonlyArray<string> = ["0xAAA"]): MockProviderHandle => {
  const provider = createMockProvider();
  provider.setHandler("eth_accounts", () => [...addresses]);
  provider.setHandler("eth_chainId", () => "0x1");
  return provider;
};

const flush = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

const SOLANA_MAINNET = {
  id: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
  name: "Solana",
  namespace: "solana",
  reference: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
};

describe("EVM helpers", () => {
  it("converts chain ids between hex and decimal", () => {
    expect(chainIdHexToDecimal("0x1")).toBe("1");
    expect(chainIdHexToDecimal("0x89")).toBe("137");
    expect(chainIdDecimalToHex("1")).toBe("0x1");
    expect(chainIdDecimalToHex("137")).toBe("0x89");
  });

  it("formats wei to ether, trimming trailing zeros", () => {
    expect(formatEther(0n)).toBe("0");
    expect(formatEther(1_000_000_000_000_000_000n)).toBe("1");
    expect(formatEther(1_500_000_000_000_000_000n)).toBe("1.5");
    expect(formatEther(123_456_000_000_000_000_000n)).toBe("123.456");
    expect(formatEther(1n)).toBe("0.000000000000000001");
  });
});

describe("buildEvmAdapter identity and lifecycle", () => {
  it("uses rdns as the connector id and the EIP-6963 info as the name", () => {
    const adapter = buildEvmAdapter(INFO, createMockProvider());
    expect(adapter.id).toBe("io.mock.wallet");
    expect(adapter.name).toBe("Mock EIP-6963 Wallet");
    expect(adapter.chainPlatform).toBe("evm");
  });

  it("getSigner() hands back the EIP-1193 provider under the eip1193 kind", async () => {
    const provider = createMockProvider();
    const signer = await buildEvmAdapter(INFO, provider).getSigner();
    expect(signer.kind).toBe("eip1193");
    expect(signer.kind === "eip1193" && signer.provider).toBe(provider);
  });

  it("connect() calls eth_requestAccounts", async () => {
    const provider = createMockProvider();
    provider.setHandler("eth_requestAccounts", () => ["0xabc"]);
    await buildEvmAdapter(INFO, provider).connect();
    expect(provider.methods()).toEqual(["eth_requestAccounts"]);
  });

  it("connect({ silent: true }) reads eth_accounts and rejects without prompting when empty", async () => {
    const provider = createMockProvider();
    provider.setHandler("eth_accounts", () => []);
    await expect(buildEvmAdapter(INFO, provider).connect({ silent: true })).rejects.toThrow(
      /silent reconnect/v,
    );
    expect(provider.methods()).toEqual(["eth_accounts"]);
  });

  it("disconnect() ignores wallets that don't implement wallet_revokePermissions", async () => {
    const provider = createMockProvider();
    provider.setHandler("wallet_revokePermissions", () => {
      throw new Error("method not supported");
    });
    await expect(buildEvmAdapter(INFO, provider).disconnect?.()).resolves.toBeUndefined();
  });
});

describe("buildEvmAdapter getAccounts()", () => {
  it("resolves [] when no accounts are exposed", async () => {
    const provider = createMockProvider();
    provider.setHandler("eth_accounts", () => []);
    await expect(buildEvmAdapter(INFO, provider).getAccounts()).resolves.toEqual([]);
  });

  it("returns every exposed address, active first, on the registry chain", async () => {
    const provider = createMockProvider();
    provider.setHandler("eth_accounts", () => ["0xC0FFEE", "0xBBB"]);
    provider.setHandler("eth_chainId", () => "0x89");

    const accounts = await buildEvmAdapter(INFO, provider).getAccounts();

    expect(accounts).toEqual([
      buildAccount("0xC0FFEE", EVM_CHAINS.polygon),
      buildAccount("0xBBB", EVM_CHAINS.polygon),
    ]);
    // The address keeps the wallet's casing, and the chain is named after
    // the chain, not the wallet.
    expect(accounts[0]?.id).toBe("eip155:137:0xC0FFEE");
    expect(accounts[0]?.chain.name).toBe("Polygon");
  });

  it("names a chain outside the registry by its CAIP-2 id", async () => {
    const provider = createMockProvider();
    provider.setHandler("eth_accounts", () => ["0xAAA"]);
    provider.setHandler("eth_chainId", () => "0x1f");

    const [account] = await buildEvmAdapter(INFO, provider).getAccounts();

    expect(account?.chain).toEqual({
      id: "eip155:31",
      name: "eip155:31",
      namespace: "eip155",
      reference: "31",
    });
  });

  it("propagates a rejected eth_chainId", async () => {
    const provider = createMockProvider();
    provider.setHandler("eth_accounts", () => ["0xAAA"]);
    provider.setHandler("eth_chainId", () => {
      throw new Error("wallet unavailable");
    });
    await expect(buildEvmAdapter(INFO, provider).getAccounts()).rejects.toThrow(
      "wallet unavailable",
    );
  });

  it("throws instead of reporting chain 0 for a malformed eth_chainId", async () => {
    const provider = createMockProvider();
    provider.setHandler("eth_accounts", () => ["0xAAA"]);
    provider.setHandler("eth_chainId", () => 137);
    await expect(buildEvmAdapter(INFO, provider).getAccounts()).rejects.toThrow(
      "malformed eth_chainId",
    );
  });
});

describe("buildEvmAdapter switchChain()", () => {
  it("sends wallet_switchEthereumChain with the hex chain id", async () => {
    const provider = connectedProvider();
    await buildEvmAdapter(INFO, provider).switchChain?.(EVM_CHAINS.polygon);
    expect(provider.requests).toContainEqual({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x89" }],
    });
  });

  it("skips the request when already on the target chain", async () => {
    const provider = connectedProvider();
    await buildEvmAdapter(INFO, provider).switchChain?.(EVM_CHAINS.ethereum);
    expect(provider.methods()).not.toContain("wallet_switchEthereumChain");
  });

  it("rejects asynchronously for a chain outside eip155", async () => {
    const provider = connectedProvider();
    const pending = buildEvmAdapter(INFO, provider).switchChain?.(SOLANA_MAINNET);
    expect(pending).toBeInstanceOf(Promise);
    await expect(pending).rejects.toThrow(/non-EVM chain/v);
    expect(provider.methods()).toEqual([]);
  });

  it("rejects an eip155 chain with a non-numeric reference", async () => {
    const provider = connectedProvider();
    await expect(
      buildEvmAdapter(INFO, provider).switchChain?.({
        id: "eip155:mainnet",
        name: "Broken",
        namespace: "eip155",
        reference: "mainnet",
      }),
    ).rejects.toThrow(/numeric reference/v);
    expect(provider.methods()).toEqual([]);
  });
});

describe("buildEvmAdapter signMessage()", () => {
  it("signs with the active account through personal_sign", async () => {
    const provider = connectedProvider(["0xAAA", "0xBBB"]);
    provider.setHandler("personal_sign", () => "0xdeadbeef");

    const message = new Uint8Array([0x01, 0x02, 0x03]);
    const result = await buildEvmAdapter(INFO, provider).signMessage?.(message);

    expect(provider.requests).toContainEqual({
      method: "personal_sign",
      params: ["0x010203", "0xAAA"],
    });
    expect(result?.signature).toEqual(new Uint8Array([222, 173, 190, 239]));
    expect(result?.signedMessage).toBe(message);
  });

  it("signs as the requested account, matching hex addresses case-insensitively", async () => {
    const provider = connectedProvider(["0xAAA", "0xBbB"]);
    provider.setHandler("personal_sign", () => "0xdeadbeef");

    const account = buildAccount("0xbbb", EVM_CHAINS.ethereum);
    await buildEvmAdapter(INFO, provider).signMessage?.(new Uint8Array([1]), { account });

    expect(provider.requests).toContainEqual({
      method: "personal_sign",
      params: ["0x01", "0xBbB"],
    });
  });

  it("rejects an account the wallet does not expose instead of signing with another", async () => {
    const provider = connectedProvider(["0xAAA"]);
    provider.setHandler("personal_sign", () => "0xdeadbeef");

    const account = buildAccount("0xCCC", EVM_CHAINS.ethereum);
    await expect(
      buildEvmAdapter(INFO, provider).signMessage?.(new Uint8Array([1]), { account }),
    ).rejects.toThrow(/does not expose account 0xCCC/v);
    expect(provider.methods()).not.toContain("personal_sign");
  });

  it("rejects when the wallet exposes no account", async () => {
    const provider = connectedProvider([]);
    await expect(
      buildEvmAdapter(INFO, provider).signMessage?.(new Uint8Array([1])),
    ).rejects.toThrow(/no connected account/v);
  });

  it("throws when personal_sign returns a non-string", async () => {
    const provider = connectedProvider();
    provider.setHandler("personal_sign", () => ({ signature: "0xdeadbeef" }));
    await expect(
      buildEvmAdapter(INFO, provider).signMessage?.(new Uint8Array([0x01])),
    ).rejects.toThrow("malformed personal_sign");
  });
});

describe("buildEvmAdapter sendTx()", () => {
  it("sends from the active account and encodes bigint quantities as hex", async () => {
    const provider = connectedProvider(["0xAAA", "0xBBB"]);
    provider.setHandler("eth_sendTransaction", () => "0xtxhash");

    const hash = await buildEvmAdapter(INFO, provider).sendTx?.({
      accessList: [{ address: "0xDDD", storageKeys: [] }],
      gas: 21_000n,
      maxFeePerGas: undefined,
      to: "0xCCC",
      value: 1_000_000_000_000_000_000n,
    });

    expect(hash).toBe("0xtxhash");
    expect(provider.requests).toContainEqual({
      method: "eth_sendTransaction",
      params: [
        {
          accessList: [{ address: "0xDDD", storageKeys: [] }],
          from: "0xAAA",
          gas: "0x5208",
          maxFeePerGas: undefined,
          to: "0xCCC",
          value: "0xde0b6b3a7640000",
        },
      ],
    });
  });

  it("sends from the requested account, replacing any `from` in the request", async () => {
    const provider = connectedProvider(["0xAAA", "0xBBB"]);
    provider.setHandler("eth_sendTransaction", () => "0xtxhash");

    const account = buildAccount("0xBBB", EVM_CHAINS.ethereum);
    await buildEvmAdapter(INFO, provider).sendTx?.({ from: "0xAAA", to: "0xCCC" }, { account });

    expect(provider.requests).toContainEqual({
      method: "eth_sendTransaction",
      params: [{ from: "0xBBB", to: "0xCCC" }],
    });
  });

  it("rejects an account the wallet does not expose without sending", async () => {
    const provider = connectedProvider(["0xAAA"]);
    provider.setHandler("eth_sendTransaction", () => "0xtxhash");

    const account = buildAccount("0xCCC", EVM_CHAINS.ethereum);
    await expect(
      buildEvmAdapter(INFO, provider).sendTx?.({ to: "0xDDD" }, { account }),
    ).rejects.toThrow(/does not expose account/v);
    expect(provider.methods()).not.toContain("eth_sendTransaction");
  });

  it("switches the wallet's network first when `chain` differs from eth_chainId", async () => {
    const provider = connectedProvider();
    provider.setHandler("eth_sendTransaction", () => "0xtxhash");

    await buildEvmAdapter(INFO, provider).sendTx?.({ to: "0xCCC" }, { chain: EVM_CHAINS.polygon });

    const methods = provider.methods();
    expect(methods.indexOf("wallet_switchEthereumChain")).toBeGreaterThan(-1);
    expect(methods.indexOf("wallet_switchEthereumChain")).toBeLessThan(
      methods.indexOf("eth_sendTransaction"),
    );
    expect(provider.requests).toContainEqual({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x89" }],
    });
  });

  it("skips the switch when already on `chain`", async () => {
    const provider = connectedProvider();
    provider.setHandler("eth_sendTransaction", () => "0xtxhash");

    await buildEvmAdapter(INFO, provider).sendTx?.({ to: "0xCCC" }, { chain: EVM_CHAINS.ethereum });

    expect(provider.methods()).not.toContain("wallet_switchEthereumChain");
  });

  it("rejects a chain from another namespace without sending", async () => {
    const provider = connectedProvider();
    provider.setHandler("eth_sendTransaction", () => "0xtxhash");

    await expect(
      buildEvmAdapter(INFO, provider).sendTx?.({ to: "0xCCC" }, { chain: SOLANA_MAINNET }),
    ).rejects.toThrow(/non-EVM chain/v);
    expect(provider.methods()).not.toContain("eth_sendTransaction");
  });

  it("does not send when the network switch fails", async () => {
    const provider = connectedProvider();
    provider.setHandler("wallet_switchEthereumChain", () => {
      throw new Error("User rejected the request");
    });

    await expect(
      buildEvmAdapter(INFO, provider).sendTx?.({ to: "0xCCC" }, { chain: EVM_CHAINS.polygon }),
    ).rejects.toThrow(/User rejected/v);
    expect(provider.methods()).not.toContain("eth_sendTransaction");
  });

  it("throws when the wallet returns no transaction hash", async () => {
    const provider = connectedProvider();
    provider.setHandler("eth_sendTransaction", () => null);
    await expect(buildEvmAdapter(INFO, provider).sendTx?.({})).rejects.toThrow(
      "no transaction hash",
    );
  });
});

describe("buildEvmAdapter reads", () => {
  it("getTransactionReceipt() maps EIP-1193 status to butr's enum", async () => {
    const provider = createMockProvider();
    const adapter = buildEvmAdapter(INFO, provider);

    provider.setHandler("eth_getTransactionReceipt", () => null);
    const pending = await adapter.getTransactionReceipt?.("0x1");
    expect(pending).toEqual({ status: "Pending" });

    provider.setHandler("eth_getTransactionReceipt", () => ({ status: "0x1" }));
    const success = await adapter.getTransactionReceipt?.("0x1");
    expect(success).toEqual({ status: "Success" });

    provider.setHandler("eth_getTransactionReceipt", () => ({ status: "0x0" }));
    const failed = await adapter.getTransactionReceipt?.("0x1");
    expect(failed).toEqual({ status: "Error" });
  });

  it("getBalance() reads native ETH of the active account", async () => {
    const provider = connectedProvider(["0xAAA", "0xBBB"]);
    provider.setHandler("eth_getBalance", () => "0x0de0b6b3a7640000");

    const balance = await buildEvmAdapter(INFO, provider).getBalance?.();

    expect(provider.requests).toContainEqual({
      method: "eth_getBalance",
      params: ["0xAAA", "latest"],
    });
    expect(balance).toEqual({
      decimals: 18,
      formatted: "1",
      symbol: "ETH",
      value: 1_000_000_000_000_000_000n,
    });
  });

  it("getBalance({ account }) reads the requested account and rejects an unknown one", async () => {
    const provider = connectedProvider(["0xAAA", "0xBBB"]);
    provider.setHandler("eth_getBalance", () => "0x0");
    const adapter = buildEvmAdapter(INFO, provider);

    await adapter.getBalance?.({ account: buildAccount("0xBBB", EVM_CHAINS.ethereum) });
    expect(provider.requests).toContainEqual({
      method: "eth_getBalance",
      params: ["0xBBB", "latest"],
    });

    await expect(
      adapter.getBalance?.({ account: buildAccount("0xCCC", EVM_CHAINS.ethereum) }),
    ).rejects.toThrow(/does not expose account/v);
  });

  it("getBalance({ token }) reads ERC-20 balanceOf + decimals + symbol via eth_call", async () => {
    const holder = "0x1234567890aBCDEF1234567890ABCDef12345678";
    const usdc = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
    const provider = connectedProvider([holder]);
    provider.setHandler("eth_call", (params) => {
      const [call] = Array.isArray(params) ? params : [];
      const data =
        typeof call === "object" && call !== null && "data" in call ? String(call.data) : "";
      const selector = data.slice(0, 10);
      if (selector === "0x70a08231") {
        expect(data.endsWith(holder.slice(2).toLowerCase())).toBe(true);
        return "0x00000000000000000000000000000000000000000000000000000000002625a0";
      }
      if (selector === "0x313ce567") {
        return "0x0000000000000000000000000000000000000000000000000000000000000006";
      }
      return (
        "0x0000000000000000000000000000000000000000000000000000000000000020" +
        "0000000000000000000000000000000000000000000000000000000000000004" +
        "5553444300000000000000000000000000000000000000000000000000000000"
      );
    });

    const balance = await buildEvmAdapter(INFO, provider).getBalance?.({ token: usdc });

    expect(balance).toEqual({ decimals: 6, formatted: "2.5", symbol: "USDC", value: 2_500_000n });
  });
});

describe("buildEvmAdapter subscribe()", () => {
  const subscribe = (provider: MockProviderHandle) => {
    const listener = vi.fn<(event: ConnectorEvent) => void>();
    const unsubscribe = buildEvmAdapter(INFO, provider).subscribe?.(listener);
    return { listener, unsubscribe };
  };

  it("bridges accountsChanged into accountsChanged, active first, without reading accounts again", async () => {
    const provider = createMockProvider();
    provider.setHandler("eth_chainId", () => "0x89");
    const { listener, unsubscribe } = subscribe(provider);

    provider.emit("accountsChanged", ["0xAAA", 42, "0xBBB"]);
    await flush();

    expect(provider.methods()).toEqual(["eth_chainId"]);
    expect(listener).toHaveBeenCalledWith({
      accounts: [
        buildAccount("0xAAA", EVM_CHAINS.polygon),
        buildAccount("0xBBB", EVM_CHAINS.polygon),
      ],
      type: "accountsChanged",
    });
    unsubscribe?.();
  });

  it("uses the chainChanged payload without reading the chain again", async () => {
    const provider = createMockProvider();
    provider.setHandler("eth_accounts", () => ["0xAAA"]);
    const { listener, unsubscribe } = subscribe(provider);

    provider.emit("chainChanged", "0x89");
    await flush();

    expect(provider.methods()).toEqual(["eth_accounts"]);
    expect(listener).toHaveBeenCalledWith({
      accounts: [buildAccount("0xAAA", EVM_CHAINS.polygon)],
      type: "accountsChanged",
    });
    unsubscribe?.();
  });

  it("falls back to eth_chainId when chainChanged emits a number", async () => {
    const provider = createMockProvider();
    provider.setHandler("eth_accounts", () => ["0xAAA"]);
    provider.setHandler("eth_chainId", () => "0x89");
    const { listener, unsubscribe } = subscribe(provider);

    provider.emit("chainChanged", 137);
    await flush();

    expect(provider.methods().filter((method) => method === "eth_chainId")).toHaveLength(1);
    expect(listener).toHaveBeenCalledWith({
      accounts: [buildAccount("0xAAA", EVM_CHAINS.polygon)],
      type: "accountsChanged",
    });
    unsubscribe?.();
  });

  it("emits nothing when the chain stays unreadable", async () => {
    const provider = createMockProvider();
    provider.setHandler("eth_accounts", () => ["0xAAA"]);
    provider.setHandler("eth_chainId", () => 137);
    const { listener, unsubscribe } = subscribe(provider);

    provider.emit("chainChanged", 137);
    await flush();

    expect(listener).not.toHaveBeenCalled();
    unsubscribe?.();
  });

  it("ignores malformed and rejected synchronization reads", async () => {
    const provider = createMockProvider();
    provider.setHandler("eth_accounts", () => ({ address: "0xAAA" }));
    provider.setHandler("eth_chainId", () => {
      throw new Error("wallet unavailable");
    });
    const { listener, unsubscribe } = subscribe(provider);

    provider.emit("connect");
    await flush();

    expect(listener).not.toHaveBeenCalled();
    unsubscribe?.();
  });

  it("bridges empty accountsChanged and disconnect to disconnected", () => {
    const provider = createMockProvider();
    const { listener, unsubscribe } = subscribe(provider);

    provider.emit("accountsChanged", []);
    provider.emit("disconnect");

    expect(listener).toHaveBeenNthCalledWith(1, { type: "disconnected" });
    expect(listener).toHaveBeenNthCalledWith(2, { type: "disconnected" });
    unsubscribe?.();
  });

  it("returns an unsubscribe that detaches every listener", () => {
    const provider = createMockProvider();
    const { listener, unsubscribe } = subscribe(provider);

    unsubscribe?.();
    provider.emit("accountsChanged", ["0xNEW"]);
    provider.emit("chainChanged", "0x89");
    provider.emit("disconnect");

    expect(listener).not.toHaveBeenCalled();
  });
});
