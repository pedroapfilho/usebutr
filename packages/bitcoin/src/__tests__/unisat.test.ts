import type { ConnectorEvent } from "@usebutr/core";
import { BITCOIN_CHAINS, ConnectionError, buildAccount } from "@usebutr/core";
import type { Mock } from "vitest";
import { describe, expect, it, vi } from "vitest";

import type { UnisatProvider } from "../injected/unisat";
import { buildUnisatAdapter } from "../injected/unisat";

const MAINNET_ADDRESS = "bc1qaddr1";
const SECOND_ADDRESS = "bc1qaddr2";
const TESTNET_ADDRESS = "tb1qaddr1";

type UnisatMock = {
  [K in keyof UnisatProvider]-?: Mock<NonNullable<UnisatProvider[K]>>;
};

/**
 * A UniSat wallet with one global network: switching it re-addresses the
 * active account, the way a real wallet derives `tb1…` on testnet.
 */
const buildProvider = (): UnisatMock => {
  let network: "livenet" | "testnet" = "livenet";
  const addresses = () => (network === "livenet" ? [MAINNET_ADDRESS] : [TESTNET_ADDRESS]);
  return {
    getAccounts: vi.fn<UnisatProvider["getAccounts"]>(() => Promise.resolve(addresses())),
    getNetwork: vi.fn<NonNullable<UnisatProvider["getNetwork"]>>(() => Promise.resolve(network)),
    on: vi.fn<NonNullable<UnisatProvider["on"]>>(),
    pushPsbt: vi.fn<NonNullable<UnisatProvider["pushPsbt"]>>().mockResolvedValue("pushed"),
    removeListener: vi.fn<NonNullable<UnisatProvider["removeListener"]>>(),
    requestAccounts: vi.fn<UnisatProvider["requestAccounts"]>(() => Promise.resolve(addresses())),
    sendBitcoin: vi.fn<NonNullable<UnisatProvider["sendBitcoin"]>>().mockResolvedValue("txid-1"),
    signMessage: vi.fn<UnisatProvider["signMessage"]>().mockResolvedValue("AQID"),
    signPsbt: vi.fn<UnisatProvider["signPsbt"]>().mockResolvedValue("0a0b0c"),
    switchNetwork: vi.fn<NonNullable<UnisatProvider["switchNetwork"]>>((next) => {
      network = next;
      return Promise.resolve();
    }),
  };
};

/** The minimum UniSat surface: no `getNetwork`, no `sendBitcoin`, no
 *  `switchNetwork`, no event methods. Legacy `window.btc` builds really do
 *  ship only these four. */
const buildBareProvider = (): UnisatProvider => ({
  getAccounts: vi.fn<UnisatProvider["getAccounts"]>().mockResolvedValue([MAINNET_ADDRESS]),
  requestAccounts: vi.fn<UnisatProvider["requestAccounts"]>().mockResolvedValue([MAINNET_ADDRESS]),
  signMessage: vi.fn<UnisatProvider["signMessage"]>().mockResolvedValue("AQID"),
  signPsbt: vi.fn<UnisatProvider["signPsbt"]>().mockResolvedValue("0a0b0c"),
});

/** OKX's `window.okxwallet.bitcoin`: reports its network and sends, but is
 *  pinned to mainnet, so it cannot switch. */
const buildPinnedProvider = (): UnisatProvider => {
  const { switchNetwork: _switchNetwork, ...rest } = buildProvider();
  return rest;
};

const buildAdapter = (provider: UnisatProvider) =>
  buildUnisatAdapter("injected:bitcoin:unisat", "Unisat", provider);

const chainIdOf = async (adapter: ReturnType<typeof buildAdapter>) => {
  const [account] = await adapter.getAccounts();
  return account?.chain.id;
};

const listenerFor = (provider: UnisatMock, event: "accountsChanged" | "networkChanged") =>
  provider.on.mock.calls.find((call) => call[0] === event)?.[1];

const flushMicrotasks = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

const expectAccountsChanged = (event: ConnectorEvent | undefined) => {
  if (event?.type !== "accountsChanged") {
    throw new Error("expected an accountsChanged event");
  }
  return event;
};

const TRANSFER = { amount: 12_345n, recipient: "bc1qto" };
const SUI_MAINNET = { id: "sui:mainnet", name: "Sui", namespace: "sui", reference: "mainnet" };

describe("buildUnisatAdapter", () => {
  it("exposes the supplied id/name and the Bitcoin platform discriminant", () => {
    const adapter = buildAdapter(buildProvider());

    expect(adapter.id).toBe("injected:bitcoin:unisat");
    expect(adapter.name).toBe("Unisat");
    expect(adapter.chainPlatform).toBe("bitcoin");
    expect(adapter.icon).toMatch(/^data:image\/svg\+xml/v);
  });

  it("defines the optional methods the provider backs", () => {
    const adapter = buildAdapter(buildProvider());

    expect(adapter.sendTx).toBeTypeOf("function");
    expect(adapter.subscribe).toBeTypeOf("function");
    expect(adapter.switchChain).toBeTypeOf("function");
  });

  it("defines no placeholder a bare provider cannot back", () => {
    const adapter = buildAdapter(buildBareProvider());

    expect(adapter.sendTx).toBeUndefined();
    expect(adapter.subscribe).toBeUndefined();
    expect(adapter.switchChain).toBeUndefined();
    expect(adapter.getBalance).toBeUndefined();
    expect(adapter.getTransactionReceipt).toBeUndefined();
    expect(adapter.requestAccounts).toBeUndefined();
    expect(adapter.disconnect).toBeUndefined();
  });

  it("getSigner hands back the raw provider, tagged unisat", async () => {
    const provider = buildProvider();

    expect(await buildAdapter(provider).getSigner()).toEqual({ kind: "unisat", provider });
  });

  describe("connect", () => {
    it("silent reconnect reads getAccounts and never prompts", async () => {
      const provider = buildProvider();

      await buildAdapter(provider).connect({ silent: true });

      expect(provider.getAccounts).toHaveBeenCalledTimes(1);
      expect(provider.requestAccounts).not.toHaveBeenCalled();
    });

    it("silent reconnect rejects when no account is authorized", async () => {
      const provider = buildProvider();
      provider.getAccounts.mockResolvedValue([]);

      await expect(buildAdapter(provider).connect({ silent: true })).rejects.toThrow(
        /No authorized accounts/v,
      );
      expect(provider.requestAccounts).not.toHaveBeenCalled();
    });

    it("interactive connect prompts through requestAccounts", async () => {
      const provider = buildProvider();

      await buildAdapter(provider).connect();

      expect(provider.requestAccounts).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAccounts", () => {
    it.each([
      ["testnet", BITCOIN_CHAINS.testnet],
      ["signet", BITCOIN_CHAINS.signet],
      ["livenet", BITCOIN_CHAINS.mainnet],
      ["mainnet", BITCOIN_CHAINS.mainnet],
    ] as const)("labels a %s wallet with the registry chain", async (network, expected) => {
      const provider = buildProvider();
      provider.getNetwork.mockResolvedValue(network);

      const [account] = await buildAdapter(provider).getAccounts();

      expect(account?.chain).toBe(expected);
    });

    it("maps every exposed address, active first", async () => {
      const provider = buildProvider();
      provider.getAccounts.mockResolvedValue([MAINNET_ADDRESS, SECOND_ADDRESS]);

      const accounts = await buildAdapter(provider).getAccounts();

      expect(accounts).toEqual([
        buildAccount(MAINNET_ADDRESS, BITCOIN_CHAINS.mainnet),
        buildAccount(SECOND_ADDRESS, BITCOIN_CHAINS.mainnet),
      ]);
    });

    it("returns an empty list without reading the network", async () => {
      const provider = buildProvider();
      provider.getAccounts.mockResolvedValue([]);

      expect(await buildAdapter(provider).getAccounts()).toEqual([]);
      expect(provider.getNetwork).not.toHaveBeenCalled();
    });

    it("assumes mainnet on a provider that reports no network", async () => {
      const adapter = buildAdapter(buildBareProvider());

      expect(await chainIdOf(adapter)).toBe(BITCOIN_CHAINS.mainnet.id);
    });

    it("keeps the last known chain when getNetwork rejects", async () => {
      const provider = buildProvider();
      provider.getNetwork.mockRejectedValue(new Error("wallet locked"));

      expect(await chainIdOf(buildAdapter(provider))).toBe(BITCOIN_CHAINS.mainnet.id);
    });
  });

  describe("signMessage", () => {
    it("decodes the message and base64-decodes the signature", async () => {
      const provider = buildProvider();
      const message = new TextEncoder().encode("hello");

      const result = await buildAdapter(provider).signMessage?.(message);

      expect(provider.signMessage).toHaveBeenCalledWith("hello");
      expect(result?.signature).toEqual(new Uint8Array([1, 2, 3]));
      expect(result?.signedMessage).toBe(message);
    });

    it("accepts the active account", async () => {
      const provider = buildProvider();

      await buildAdapter(provider).signMessage?.(new Uint8Array([1]), {
        account: buildAccount(MAINNET_ADDRESS, BITCOIN_CHAINS.mainnet),
      });

      expect(provider.signMessage).toHaveBeenCalledTimes(1);
    });

    it("rejects any other account instead of signing with the active one", async () => {
      const provider = buildProvider();
      provider.getAccounts.mockResolvedValue([MAINNET_ADDRESS, SECOND_ADDRESS]);

      await expect(
        buildAdapter(provider).signMessage?.(new Uint8Array([1]), {
          account: buildAccount(SECOND_ADDRESS, BITCOIN_CHAINS.mainnet),
        }),
      ).rejects.toThrow(/signs only with its active account/v);
      expect(provider.signMessage).not.toHaveBeenCalled();
    });
  });

  describe("signTransaction", () => {
    it("hex-encodes the PSBT and decodes the signed result", async () => {
      const provider = buildProvider();

      const signed = await buildAdapter(provider).signTransaction?.(new Uint8Array([1, 2, 255]));

      expect(provider.signPsbt).toHaveBeenCalledWith("0102ff");
      expect(signed).toEqual(new Uint8Array([10, 11, 12]));
    });

    it("switches the network before signing for another chain", async () => {
      const provider = buildProvider();

      await buildAdapter(provider).signTransaction?.(new Uint8Array([1]), {
        chain: BITCOIN_CHAINS.testnet,
      });

      expect(provider.switchNetwork).toHaveBeenCalledWith("testnet");
      expect(provider.switchNetwork.mock.invocationCallOrder[0]).toBeLessThan(
        provider.signPsbt.mock.invocationCallOrder[0] ?? 0,
      );
    });

    it("rejects an account that is not the active one", async () => {
      const provider = buildProvider();

      await expect(
        buildAdapter(provider).signTransaction?.(new Uint8Array([1]), {
          account: buildAccount("bc1qstranger", BITCOIN_CHAINS.mainnet),
        }),
      ).rejects.toThrow(/signs only with its active account/v);
      expect(provider.signPsbt).not.toHaveBeenCalled();
    });
  });

  describe("sendTx", () => {
    it("forwards recipient and satoshi amount to sendBitcoin", async () => {
      const provider = buildProvider();

      const txid = await buildAdapter(provider).sendTx?.(TRANSFER);

      expect(provider.sendBitcoin).toHaveBeenCalledWith("bc1qto", 12_345);
      expect(txid).toBe("txid-1");
    });

    it("does not switch when the wallet is already on the target chain", async () => {
      const provider = buildProvider();

      await buildAdapter(provider).sendTx?.(TRANSFER, { chain: BITCOIN_CHAINS.mainnet });

      expect(provider.switchNetwork).not.toHaveBeenCalled();
      expect(provider.sendBitcoin).toHaveBeenCalledTimes(1);
    });

    it("switches the network first, then matches the account on it", async () => {
      const provider = buildProvider();

      await buildAdapter(provider).sendTx?.(TRANSFER, {
        account: buildAccount(TESTNET_ADDRESS, BITCOIN_CHAINS.testnet),
        chain: BITCOIN_CHAINS.testnet,
      });

      expect(provider.switchNetwork).toHaveBeenCalledWith("testnet");
      expect(provider.sendBitcoin).toHaveBeenCalledTimes(1);
    });

    it("rejects a chain a pinned wallet cannot switch to, without sending", async () => {
      const provider = buildPinnedProvider();

      const sending = buildAdapter(provider).sendTx?.(TRANSFER, { chain: BITCOIN_CHAINS.testnet });

      await expect(sending).rejects.toBeInstanceOf(ConnectionError);
      await expect(sending).rejects.toMatchObject({ kind: "ChainMismatch" });
      expect(provider.sendBitcoin).not.toHaveBeenCalled();
    });

    it("rejects a network switchNetwork does not know", async () => {
      const provider = buildProvider();

      await expect(
        buildAdapter(provider).sendTx?.(TRANSFER, { chain: BITCOIN_CHAINS.signet }),
      ).rejects.toThrow(/cannot switch to Bitcoin Signet/v);
      expect(provider.switchNetwork).not.toHaveBeenCalled();
      expect(provider.sendBitcoin).not.toHaveBeenCalled();
    });

    it("rejects a chain from another namespace", async () => {
      const provider = buildProvider();

      await expect(
        buildAdapter(provider).sendTx?.(TRANSFER, { chain: SUI_MAINNET }),
      ).rejects.toThrow(/non-Bitcoin/v);
      expect(provider.sendBitcoin).not.toHaveBeenCalled();
    });

    it("rejects an account that is not the active one, without sending", async () => {
      const provider = buildProvider();

      await expect(
        buildAdapter(provider).sendTx?.(TRANSFER, {
          account: buildAccount("bc1qstranger", BITCOIN_CHAINS.mainnet),
        }),
      ).rejects.toThrow(/signs only with its active account/v);
      expect(provider.sendBitcoin).not.toHaveBeenCalled();
    });
  });

  describe("switchChain", () => {
    it("switches the wallet's network and relabels its accounts", async () => {
      const provider = buildProvider();
      const adapter = buildAdapter(provider);

      await adapter.switchChain?.(BITCOIN_CHAINS.testnet);

      expect(provider.switchNetwork).toHaveBeenCalledWith("testnet");
      expect(await adapter.getAccounts()).toEqual([
        buildAccount(TESTNET_ADDRESS, BITCOIN_CHAINS.testnet),
      ]);
    });

    it("skips the wallet prompt when it is already there", async () => {
      const provider = buildProvider();

      await buildAdapter(provider).switchChain?.(BITCOIN_CHAINS.mainnet);

      expect(provider.switchNetwork).not.toHaveBeenCalled();
    });

    it("rejects a non-Bitcoin namespace asynchronously", async () => {
      const adapter = buildAdapter(buildProvider());

      const switching = adapter.switchChain?.(SUI_MAINNET);

      await expect(switching).rejects.toThrow(/non-Bitcoin/v);
    });
  });

  describe("subscribe", () => {
    it("registers both provider events and removes both on teardown", () => {
      const provider = buildProvider();

      const unsubscribe = buildAdapter(provider).subscribe?.(
        vi.fn<(event: ConnectorEvent) => void>(),
      );

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

    it("emits accountsChanged with every exposed address, active first", () => {
      const provider = buildProvider();
      const listener = vi.fn<(event: ConnectorEvent) => void>();
      buildAdapter(provider).subscribe?.(listener);

      listenerFor(provider, "accountsChanged")?.([MAINNET_ADDRESS, SECOND_ADDRESS]);

      const event = expectAccountsChanged(listener.mock.calls[0]?.[0]);
      expect(event.accounts.map((a) => a.walletAddress)).toEqual([MAINNET_ADDRESS, SECOND_ADDRESS]);
    });

    it("drops non-string entries the wallet may emit", () => {
      const provider = buildProvider();
      const listener = vi.fn<(event: ConnectorEvent) => void>();
      buildAdapter(provider).subscribe?.(listener);

      listenerFor(provider, "accountsChanged")?.([MAINNET_ADDRESS, 42, null]);

      const event = expectAccountsChanged(listener.mock.calls[0]?.[0]);
      expect(event.accounts.map((a) => a.walletAddress)).toEqual([MAINNET_ADDRESS]);
    });

    it("emits disconnected for an empty or non-array payload", () => {
      const provider = buildProvider();
      const listener = vi.fn<(event: ConnectorEvent) => void>();
      buildAdapter(provider).subscribe?.(listener);
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

    it("networkChanged re-reads the accounts on the wallet's new chain", async () => {
      const provider = buildProvider();
      const listener = vi.fn<(event: ConnectorEvent) => void>();
      buildAdapter(provider).subscribe?.(listener);
      provider.getNetwork.mockResolvedValue("signet");

      listenerFor(provider, "networkChanged")?.();
      await flushMicrotasks();

      const event = expectAccountsChanged(listener.mock.calls[0]?.[0]);
      expect(event.accounts).toEqual([buildAccount(MAINNET_ADDRESS, BITCOIN_CHAINS.signet)]);
    });
  });
});
