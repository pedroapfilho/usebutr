import type { ConnectorEvent } from "@usebutr/core";
import type { Mock } from "vitest";
import { describe, expect, it, vi } from "vitest";

import { BITCOIN_CHAINS } from "../chains";
import type { UnisatProvider } from "../injected/unisat";
import { buildUnisatAdapter } from "../injected/unisat";

const ADDRESS = "bc1qaddr1";
const SECOND_ADDRESS = "bc1qaddr2";

type UnisatMock = {
  [K in keyof UnisatProvider]-?: Mock<NonNullable<UnisatProvider[K]>>;
};

const buildProvider = (): UnisatMock => ({
  getAccounts: vi.fn<UnisatProvider["getAccounts"]>().mockResolvedValue([ADDRESS]),
  getNetwork: vi.fn<NonNullable<UnisatProvider["getNetwork"]>>().mockResolvedValue("livenet"),
  on: vi.fn<NonNullable<UnisatProvider["on"]>>(),
  pushPsbt: vi.fn<NonNullable<UnisatProvider["pushPsbt"]>>().mockResolvedValue("pushed"),
  removeListener: vi.fn<NonNullable<UnisatProvider["removeListener"]>>(),
  requestAccounts: vi.fn<UnisatProvider["requestAccounts"]>().mockResolvedValue([ADDRESS]),
  sendBitcoin: vi.fn<NonNullable<UnisatProvider["sendBitcoin"]>>().mockResolvedValue("txid-1"),
  signMessage: vi.fn<UnisatProvider["signMessage"]>().mockResolvedValue("AQID"),
  signPsbt: vi.fn<UnisatProvider["signPsbt"]>().mockResolvedValue("0a0b0c"),
});

/** The minimum UniSat surface: no `getNetwork`, no `sendBitcoin`, no event
 *  methods. Legacy `window.btc` builds really do ship only these four. */
const buildBareProvider = (): UnisatProvider => ({
  getAccounts: vi.fn<UnisatProvider["getAccounts"]>().mockResolvedValue([ADDRESS]),
  requestAccounts: vi.fn<UnisatProvider["requestAccounts"]>().mockResolvedValue([ADDRESS]),
  signMessage: vi.fn<UnisatProvider["signMessage"]>().mockResolvedValue("AQID"),
  signPsbt: vi.fn<UnisatProvider["signPsbt"]>().mockResolvedValue("0a0b0c"),
});

const buildAdapter = (provider: UnisatProvider) => {
  const adapter = buildUnisatAdapter("injected:bitcoin:unisat", "Unisat", provider);
  if (adapter.chainPlatform !== "bitcoin") {
    throw new Error("expected a bitcoin adapter");
  }
  return adapter;
};

const chainIdOf = async (adapter: ReturnType<typeof buildAdapter>) => {
  const account = await adapter.getAccount();
  return account?.chain.id;
};

const listenerFor = (provider: UnisatMock, event: "accountsChanged" | "networkChanged") =>
  provider.on.mock.calls.find((call) => call[0] === event)?.[1];

const flushMicrotasks = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

const expectAccountChanged = (event: ConnectorEvent | undefined) => {
  if (event?.type !== "accountChanged") {
    throw new Error("expected an accountChanged event");
  }
  return event;
};

describe("buildUnisatAdapter", () => {
  it("exposes the supplied id/name and the Bitcoin platform discriminant", () => {
    const adapter = buildAdapter(buildProvider());

    expect(adapter.id).toBe("injected:bitcoin:unisat");
    expect(adapter.name).toBe("Unisat");
    expect(adapter.chainPlatform).toBe("bitcoin");
    expect(adapter.icon).toMatch(/^data:image\/svg\+xml/v);
    expect(adapter.capabilities.signTransaction).toBe(true);
    expect(adapter.capabilities.switchChain).toBe(false);
  });

  describe("connect", () => {
    it("silent reconnect reads getAccounts and never prompts", async () => {
      const provider = buildProvider();
      const adapter = buildAdapter(provider);

      await adapter.connect({ silent: true });

      expect(provider.getAccounts).toHaveBeenCalledTimes(1);
      expect(provider.requestAccounts).not.toHaveBeenCalled();
    });

    it("silent reconnect rejects when no account is authorized", async () => {
      const provider = buildProvider();
      provider.getAccounts.mockResolvedValue([]);
      const adapter = buildAdapter(provider);

      await expect(adapter.connect({ silent: true })).rejects.toThrow(/No authorized accounts/v);
      expect(provider.requestAccounts).not.toHaveBeenCalled();
    });

    it("interactive connect prompts through requestAccounts", async () => {
      const provider = buildProvider();
      const adapter = buildAdapter(provider);

      await adapter.connect();

      expect(provider.requestAccounts).toHaveBeenCalledTimes(1);
      expect(provider.getNetwork).toHaveBeenCalledTimes(1);
    });

    it("resolves on a provider that exposes no getNetwork", async () => {
      const adapter = buildAdapter(buildBareProvider());

      await expect(adapter.connect()).resolves.toBeUndefined();
      expect(await chainIdOf(adapter)).toBe(BITCOIN_CHAINS.mainnet.id);
    });

    it("leaves the chain on mainnet when getNetwork rejects", async () => {
      const provider = buildProvider();
      provider.getNetwork.mockRejectedValue(new Error("wallet locked"));
      const adapter = buildAdapter(provider);

      await expect(adapter.connect()).resolves.toBeUndefined();
      expect(await chainIdOf(adapter)).toBe(BITCOIN_CHAINS.mainnet.id);
    });
  });

  describe("network mapping", () => {
    it.each([
      ["testnet", BITCOIN_CHAINS.testnet.id],
      ["signet", BITCOIN_CHAINS.signet.id],
      ["livenet", BITCOIN_CHAINS.mainnet.id],
      ["mainnet", BITCOIN_CHAINS.mainnet.id],
    ] as const)("maps %s onto the matching CAIP-2 chain", async (network, expected) => {
      const provider = buildProvider();
      provider.getNetwork.mockResolvedValue(network);
      const adapter = buildAdapter(provider);

      const account = await adapter.getAccount();

      expect(account?.chain.id).toBe(expected);
    });
  });

  describe("accounts", () => {
    it("getAccount returns null when the wallet exposes nothing", async () => {
      const provider = buildProvider();
      provider.getAccounts.mockResolvedValue([]);
      const adapter = buildAdapter(provider);

      expect(await adapter.getAccount()).toBeNull();
      expect(provider.getNetwork).not.toHaveBeenCalled();
    });

    it("getAccount returns the first address with the resolved chain", async () => {
      const provider = buildProvider();
      provider.getAccounts.mockResolvedValue([ADDRESS, SECOND_ADDRESS]);
      const adapter = buildAdapter(provider);

      const account = await adapter.getAccount();

      expect(account?.walletAddress).toBe(ADDRESS);
      expect(account?.chain.namespace).toBe("bip122");
    });

    it("getAccounts maps every exposed address", async () => {
      const provider = buildProvider();
      provider.getAccounts.mockResolvedValue([ADDRESS, SECOND_ADDRESS]);
      const adapter = buildAdapter(provider);

      const accounts = await adapter.getAccounts?.();

      expect(accounts?.map((a) => a.walletAddress)).toEqual([ADDRESS, SECOND_ADDRESS]);
    });

    it("getAccounts returns an empty list without reading the network", async () => {
      const provider = buildProvider();
      provider.getAccounts.mockResolvedValue([]);
      const adapter = buildAdapter(provider);

      expect(await adapter.getAccounts?.()).toEqual([]);
      expect(provider.getNetwork).not.toHaveBeenCalled();
    });

    it("requestAccounts prompts and refreshes the chain", async () => {
      const provider = buildProvider();
      provider.getNetwork.mockResolvedValue("testnet");
      const adapter = buildAdapter(provider);

      await adapter.requestAccounts?.();

      expect(provider.requestAccounts).toHaveBeenCalledTimes(1);
      expect(await chainIdOf(adapter)).toBe(BITCOIN_CHAINS.testnet.id);
    });
  });

  describe("reads without an RPC client", () => {
    it("getBalance returns the zero-BTC placeholder", async () => {
      const adapter = buildAdapter(buildProvider());

      expect(await adapter.getBalance()).toEqual({
        decimals: 8,
        formatted: "0",
        symbol: "BTC",
        value: 0n,
      });
    });

    it("getSigner hands back the raw provider", async () => {
      const provider = buildProvider();
      const adapter = buildAdapter(provider);

      expect(await adapter.getSigner()).toBe(provider);
    });

    it("getTransactionReceipt is always Pending", async () => {
      const adapter = buildAdapter(buildProvider());

      expect(await adapter.getTransactionReceipt("txid-1")).toEqual({ status: "Pending" });
    });

    it("disconnect resolves without touching the provider", async () => {
      const provider = buildProvider();
      const adapter = buildAdapter(provider);

      await expect(adapter.disconnect?.()).resolves.toBeUndefined();
      expect(provider.removeListener).not.toHaveBeenCalled();
    });
  });

  it("signMessage decodes the message and base64-decodes the signature", async () => {
    const provider = buildProvider();
    const adapter = buildAdapter(provider);
    const msg = new TextEncoder().encode("hello");

    const result = await adapter.signMessage(msg);

    expect(provider.signMessage).toHaveBeenCalledWith("hello");
    expect(result.signature).toEqual(new Uint8Array([1, 2, 3]));
    expect(result.signedMessage).toBe(msg);
  });

  describe("signTransaction", () => {
    it("hex-encodes the PSBT and decodes the signed result", async () => {
      const provider = buildProvider();
      const adapter = buildAdapter(provider);

      const signed = await adapter.signTransaction?.(new Uint8Array([1, 2, 255]));

      expect(provider.signPsbt).toHaveBeenCalledWith("0102ff");
      expect(signed).toEqual(new Uint8Array([10, 11, 12]));
    });

    it("rejects anything that isn't PSBT bytes", async () => {
      const adapter = buildAdapter(buildProvider());

      await expect(adapter.signTransaction?.("not-a-psbt")).rejects.toThrow(TypeError);
    });
  });

  describe("sendTx", () => {
    it("forwards recipient and satoshi amount to sendBitcoin", async () => {
      const provider = buildProvider();
      const adapter = buildAdapter(provider);

      const txid = await adapter.sendTx({ amount: 12_345n, recipient: "bc1qto" });

      expect(provider.sendBitcoin).toHaveBeenCalledWith("bc1qto", 12_345);
      expect(txid).toBe("txid-1");
    });

    it("rejects when the payload isn't { amount: bigint, recipient: string }", async () => {
      const adapter = buildAdapter(buildProvider());

      await expect(adapter.sendTx({ amount: 1, recipient: "bc1qto" })).rejects.toThrow(TypeError);
      await expect(adapter.sendTx({ recipient: "bc1qto" })).rejects.toThrow(TypeError);
      await expect(adapter.sendTx(42)).rejects.toThrow(TypeError);
    });

    it("rejects when the provider has no sendBitcoin", async () => {
      const adapter = buildAdapter(buildBareProvider());

      await expect(adapter.sendTx({ amount: 1n, recipient: "bc1qto" })).rejects.toThrow(
        /does not expose sendBitcoin/v,
      );
    });

    it("sendTxToChain fires the switched callback and sends", async () => {
      const provider = buildProvider();
      const adapter = buildAdapter(provider);
      const cb = vi.fn<() => void>();

      const txid = await adapter.sendTxToChain(
        { amount: 1n, recipient: "bc1qto" },
        BITCOIN_CHAINS.testnet.id,
        undefined,
        cb,
      );

      expect(cb).toHaveBeenCalledTimes(1);
      expect(provider.sendBitcoin).toHaveBeenCalledWith("bc1qto", 1);
      expect(txid).toBe("txid-1");
    });
  });

  describe("subscribe", () => {
    it("registers both provider events and removes both on teardown", () => {
      const provider = buildProvider();
      const adapter = buildAdapter(provider);

      const unsubscribe = adapter.subscribe?.(vi.fn<(event: ConnectorEvent) => void>());

      expect(provider.on.mock.calls.map((call) => call[0])).toEqual([
        "accountsChanged",
        "networkChanged",
      ]);
      unsubscribe?.();
      expect(provider.removeListener.mock.calls.map((call) => call[0])).toEqual([
        "accountsChanged",
        "networkChanged",
      ]);
    });

    it("emits accountChanged with every exposed address", () => {
      const provider = buildProvider();
      const adapter = buildAdapter(provider);
      const listener = vi.fn<(event: ConnectorEvent) => void>();
      adapter.subscribe?.(listener);

      listenerFor(provider, "accountsChanged")?.([ADDRESS, SECOND_ADDRESS]);

      const event = expectAccountChanged(listener.mock.calls[0]?.[0]);
      expect(event.account.walletAddress).toBe(ADDRESS);
      expect(event.accounts.map((a) => a.walletAddress)).toEqual([ADDRESS, SECOND_ADDRESS]);
    });

    it("drops non-string entries the wallet may emit", () => {
      const provider = buildProvider();
      const adapter = buildAdapter(provider);
      const listener = vi.fn<(event: ConnectorEvent) => void>();
      adapter.subscribe?.(listener);

      listenerFor(provider, "accountsChanged")?.([ADDRESS, 42, null]);

      const event = expectAccountChanged(listener.mock.calls[0]?.[0]);
      expect(event.accounts.map((a) => a.walletAddress)).toEqual([ADDRESS]);
    });

    it("emits disconnected for an empty or non-array payload", () => {
      const provider = buildProvider();
      const adapter = buildAdapter(provider);
      const listener = vi.fn<(event: ConnectorEvent) => void>();
      adapter.subscribe?.(listener);
      const emit = listenerFor(provider, "accountsChanged");

      emit?.([]);
      emit?.(undefined);
      emit?.("not-an-array");

      expect(listener.mock.calls).toEqual([
        [{ type: "disconnected" }],
        [{ type: "disconnected" }],
        [{ type: "disconnected" }],
      ]);
    });

    it("networkChanged refreshes the chain later events are built with", async () => {
      const provider = buildProvider();
      const adapter = buildAdapter(provider);
      const listener = vi.fn<(event: ConnectorEvent) => void>();
      adapter.subscribe?.(listener);
      provider.getNetwork.mockResolvedValue("signet");

      listenerFor(provider, "networkChanged")?.();
      await flushMicrotasks();
      listenerFor(provider, "accountsChanged")?.([ADDRESS]);

      expect(provider.getNetwork).toHaveBeenCalledTimes(1);
      const event = expectAccountChanged(listener.mock.calls[0]?.[0]);
      expect(event.account.chain.id).toBe(BITCOIN_CHAINS.signet.id);
    });

    it("is a no-op teardown on a provider without event methods", () => {
      const adapter = buildAdapter(buildBareProvider());

      const unsubscribe = adapter.subscribe?.(vi.fn<(event: ConnectorEvent) => void>());

      expect(() => {
        unsubscribe?.();
      }).not.toThrow();
    });
  });

  describe("switchChain", () => {
    it("adopts a bip122 target on a provider that reports no network", async () => {
      const adapter = buildAdapter(buildBareProvider());

      await adapter.switchChain(BITCOIN_CHAINS.testnet);

      expect(await chainIdOf(adapter)).toBe(BITCOIN_CHAINS.testnet.id);
    });

    // The wallet's network is authoritative: UniSat exposes no switch RPC, and
    // every account read re-reads it. switchChain must therefore report what
    // the wallet says rather than the requested target, or the next read
    // silently contradicts it.
    it("reports the wallet's network, not the requested one, when they differ", async () => {
      const provider = buildProvider();
      provider.getNetwork.mockResolvedValue("livenet");
      const adapter = buildAdapter(provider);

      await adapter.switchChain(BITCOIN_CHAINS.testnet);

      expect(await chainIdOf(adapter)).toBe(BITCOIN_CHAINS.mainnet.id);
    });

    it("adopts the target once the wallet confirms it", async () => {
      const provider = buildProvider();
      provider.getNetwork.mockResolvedValue("testnet");
      const adapter = buildAdapter(provider);

      await adapter.switchChain(BITCOIN_CHAINS.testnet);

      expect(await chainIdOf(adapter)).toBe(BITCOIN_CHAINS.testnet.id);
    });

    it("rejects a non-Bitcoin namespace", async () => {
      const adapter = buildAdapter(buildProvider());

      await expect(
        adapter.switchChain({
          id: "sui:mainnet",
          name: "Sui",
          namespace: "sui",
          reference: "mainnet",
        }),
      ).rejects.toThrow(/non-Bitcoin/v);
    });
  });
});
