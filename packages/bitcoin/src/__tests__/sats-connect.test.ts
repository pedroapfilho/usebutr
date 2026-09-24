import type { ChainBase, ConnectorEvent } from "@usebutr/core";
import { BITCOIN_CHAINS, ConnectionError, buildAccount } from "@usebutr/core";
import type { Mock } from "vitest";
import { describe, expect, it, vi } from "vitest";

import type { RpcValue, SatsConnectProvider } from "../injected/sats-connect";
import { buildSatsConnectAdapter } from "../injected/sats-connect";

const PAYMENT = { address: "bc1qpayment", purpose: "payment" };
const ORDINALS = { address: "bc1pordinals", purpose: "ordinals" };
const TESTNET_PAYMENT = { address: "tb1qpayment", purpose: "payment" };
const TESTNET_ORDINALS = { address: "tb1pordinals", purpose: "ordinals" };

type Params = Parameters<SatsConnectProvider["request"]>[1];
type Handler = RpcValue | ((params: Params) => RpcValue);
type MockProvider = { request: Mock<SatsConnectProvider["request"]> };

/** Unknown methods answer with the JSON-RPC error a wallet returns. */
const buildProvider = (handlers: Record<string, Handler>): MockProvider => ({
  request: vi.fn<SatsConnectProvider["request"]>((method, params) => {
    const handler = handlers[method];
    if (handler === undefined) {
      return Promise.resolve({ error: { message: `unsupported method: ${method}` } });
    }
    return Promise.resolve({ result: typeof handler === "function" ? handler(params) : handler });
  }),
});

/**
 * An Xverse wallet with one global network: `wallet_changeNetwork` moves it
 * and re-addresses both accounts, the way a real wallet derives `tb1…` on
 * testnet.
 */
const buildXverse = (handlers: Record<string, Handler> = {}): MockProvider => {
  let network = "Mainnet";
  const addresses = () =>
    network === "Mainnet" ? [PAYMENT, ORDINALS] : [TESTNET_PAYMENT, TESTNET_ORDINALS];
  return buildProvider({
    getAccounts: () => addresses(),
    sendTransfer: { txid: "abcd" },
    signMessage: { signature: "AQID" },
    signPsbt: { psbt: "CgsM" },
    wallet_changeNetwork: (params) => {
      if (typeof params?.name === "string") {
        network = params.name;
      }
      return null;
    },
    wallet_getAccount: () => ({ addresses: addresses() }),
    wallet_getNetwork: () => ({ bitcoin: { name: network } }),
    ...handlers,
  });
};

const buildAdapter = (provider: MockProvider) =>
  buildSatsConnectAdapter("injected:bitcoin:xverse", "Xverse", provider);

const connected = async (provider: MockProvider = buildXverse()) => {
  const adapter = buildAdapter(provider);
  await adapter.connect();
  provider.request.mockClear();
  return adapter;
};

const methodsCalled = (provider: MockProvider): Array<string> =>
  provider.request.mock.calls.map((call) => call[0]);

const onMainnet = (address: string) => buildAccount(address, BITCOIN_CHAINS.mainnet);

const TRANSFER = { amount: 1000n, recipient: "bc1qto" };
const SUI_MAINNET = { id: "sui:mainnet", name: "Sui", namespace: "sui", reference: "mainnet" };

describe("buildSatsConnectAdapter", () => {
  it("defines no placeholder the wallet cannot back", () => {
    const adapter = buildAdapter(buildXverse());

    expect(adapter.getBalance).toBeUndefined();
    expect(adapter.getTransactionReceipt).toBeUndefined();
    expect(adapter.requestAccounts).toBeUndefined();
  });

  it("getSigner hands back the raw provider, tagged sats-connect", async () => {
    const provider = buildXverse();

    expect(await buildAdapter(provider).getSigner()).toEqual({ kind: "sats-connect", provider });
  });

  describe("connect", () => {
    it("silent connect reads wallet_getAccount and never prompts via getAccounts", async () => {
      const provider = buildXverse();
      const adapter = buildAdapter(provider);

      await adapter.connect({ silent: true });

      expect(methodsCalled(provider)).toEqual(["wallet_getAccount", "wallet_getNetwork"]);
      expect(await adapter.getAccounts()).toEqual([onMainnet(PAYMENT.address)]);
    });

    it("silent connect rejects when wallet_getAccount is unavailable", async () => {
      const provider = buildProvider({ getAccounts: [PAYMENT] });
      const adapter = buildAdapter(provider);

      await expect(adapter.connect({ silent: true })).rejects.toThrow(/wallet_getAccount/v);
      expect(methodsCalled(provider)).not.toContain("getAccounts");
      expect(await adapter.getAccounts()).toEqual([]);
    });

    it("interactive connect prompts through getAccounts and exposes one account", async () => {
      const provider = buildXverse();
      const adapter = buildAdapter(provider);

      await adapter.connect();

      expect(provider.request).toHaveBeenCalledWith("getAccounts", {
        message: "Connect to butr",
        purposes: ["payment", "ordinals"],
      });
      expect(await adapter.getAccounts()).toEqual([onMainnet(PAYMENT.address)]);
    });

    it("accepts an address list wrapped in { addresses }", async () => {
      const adapter = buildAdapter(buildProvider({ getAccounts: { addresses: [PAYMENT] } }));

      await adapter.connect();

      expect(await adapter.getAccounts()).toEqual([onMainnet(PAYMENT.address)]);
    });

    it("exposes the payment address even when the wallet lists ordinals first", async () => {
      const adapter = buildAdapter(buildProvider({ getAccounts: [ORDINALS, PAYMENT] }));

      await adapter.connect();

      await expect(adapter.getAccounts()).resolves.toEqual([onMainnet(PAYMENT.address)]);
    });

    it("labels accounts with the wallet's network", async () => {
      const adapter = buildAdapter(
        buildXverse({ wallet_getNetwork: { bitcoin: { name: "Testnet4" } } }),
      );

      await adapter.connect();

      await expect(adapter.getAccounts()).resolves.toMatchObject([
        { chain: BITCOIN_CHAINS.testnet4 },
      ]);
    });

    it("keeps the mainnet label on builds without wallet_getNetwork", async () => {
      const adapter = buildAdapter(buildProvider({ getAccounts: [PAYMENT] }));

      await adapter.connect();

      await expect(adapter.getAccounts()).resolves.toEqual([onMainnet(PAYMENT.address)]);
    });

    it("rejects when the wallet returns no addresses", async () => {
      const adapter = buildAdapter(buildProvider({ getAccounts: [] }));

      await expect(adapter.connect()).rejects.toThrow(/returned no addresses/v);
    });

    it("surfaces the provider's error message", async () => {
      await expect(buildAdapter(buildProvider({})).connect()).rejects.toThrow(
        /sats-connect getAccounts failed/v,
      );
    });
  });

  it("getAccounts() after disconnect() is empty without hitting the provider", async () => {
    const provider = buildXverse();
    const adapter = await connected(provider);

    await adapter.disconnect?.();

    expect(await adapter.getAccounts()).toEqual([]);
    expect(provider.request).not.toHaveBeenCalled();
  });

  describe("signMessage", () => {
    it("forwards the requested account's address", async () => {
      const provider = buildXverse();
      const adapter = await connected(provider);
      const message = new TextEncoder().encode("hello");

      const result = await adapter.signMessage?.(message, {
        account: onMainnet(ORDINALS.address),
      });

      expect(provider.request).toHaveBeenLastCalledWith("signMessage", {
        address: ORDINALS.address,
        message: "hello",
      });
      expect(result?.signature).toEqual(new Uint8Array([1, 2, 3]));
      expect(result?.signedMessage).toBe(message);
    });

    it("defaults to the payment address", async () => {
      const provider = buildXverse();
      const adapter = await connected(provider);

      await adapter.signMessage?.(new TextEncoder().encode("hello"));

      expect(provider.request).toHaveBeenLastCalledWith("signMessage", {
        address: PAYMENT.address,
        message: "hello",
      });
    });

    it("rejects an account the wallet never exposed", async () => {
      const provider = buildXverse();
      const adapter = await connected(provider);

      await expect(
        adapter.signMessage?.(new Uint8Array([1]), { account: onMainnet("bc1qsomeoneelse") }),
      ).rejects.toThrow(/not exposed/v);
      expect(provider.request).not.toHaveBeenCalled();
    });

    it("rejects while disconnected", async () => {
      await expect(buildAdapter(buildXverse()).signMessage?.(new Uint8Array([1]))).rejects.toThrow(
        /No connected account/v,
      );
    });
  });

  describe("sendTx", () => {
    it("sends a satoshi amount from the payment address", async () => {
      const provider = buildXverse();
      const adapter = await connected(provider);

      const txid = await adapter.sendTx?.(TRANSFER);

      expect(provider.request).toHaveBeenLastCalledWith("sendTransfer", {
        recipients: [{ address: "bc1qto", amount: 1000 }],
      });
      expect(txid).toBe("abcd");
    });

    it("rejects an account that isn't the payment address", async () => {
      const provider = buildXverse();
      const adapter = await connected(provider);

      await expect(
        adapter.sendTx?.(TRANSFER, { account: onMainnet(ORDINALS.address) }),
      ).rejects.toThrow(/payment address/v);
      expect(methodsCalled(provider)).not.toContain("sendTransfer");
    });

    it("does not move the wallet when it is already on the target chain", async () => {
      const provider = buildXverse();
      const adapter = await connected(provider);

      await adapter.sendTx?.(TRANSFER, { chain: BITCOIN_CHAINS.mainnet });

      expect(methodsCalled(provider)).toEqual(["wallet_getNetwork", "sendTransfer"]);
    });

    it("moves the wallet first, then matches the account on the new network", async () => {
      const provider = buildXverse();
      const adapter = await connected(provider);

      const txid = await adapter.sendTx?.(TRANSFER, {
        account: buildAccount(TESTNET_PAYMENT.address, BITCOIN_CHAINS.testnet),
        chain: BITCOIN_CHAINS.testnet,
      });

      expect(methodsCalled(provider)).toEqual([
        "wallet_getNetwork",
        "wallet_changeNetwork",
        "wallet_getAccount",
        "sendTransfer",
      ]);
      expect(provider.request).toHaveBeenCalledWith("wallet_changeNetwork", { name: "Testnet" });
      expect(txid).toBe("abcd");
    });

    it("rejects a chain sats-connect has no network for, without sending", async () => {
      const provider = buildXverse();
      const adapter = await connected(provider);
      const unknown: ChainBase = {
        id: "bip122:ffffffffffffffffffffffffffffffff",
        name: "Elsewhere",
        namespace: "bip122",
        reference: "ffffffffffffffffffffffffffffffff",
      };

      const sending = adapter.sendTx?.(TRANSFER, { chain: unknown });

      await expect(sending).rejects.toBeInstanceOf(ConnectionError);
      await expect(sending).rejects.toMatchObject({ kind: "ChainMismatch" });
      expect(methodsCalled(provider)).not.toContain("sendTransfer");
    });

    it("rejects a chain from another namespace", async () => {
      const provider = buildXverse();
      const adapter = await connected(provider);

      await expect(adapter.sendTx?.(TRANSFER, { chain: SUI_MAINNET })).rejects.toThrow(
        /non-Bitcoin/v,
      );
      expect(provider.request).not.toHaveBeenCalled();
    });
  });

  describe("signTransaction", () => {
    it("base64-bridges the PSBT through signPsbt", async () => {
      const provider = buildXverse();
      const adapter = await connected(provider);

      const signed = await adapter.signTransaction?.(new Uint8Array([1, 2, 3]));

      expect(provider.request).toHaveBeenCalledWith("signPsbt", { psbt: "AQID" });
      expect(signed).toEqual(new Uint8Array([10, 11, 12]));
    });

    it("moves the wallet before signing for another chain", async () => {
      const provider = buildXverse();
      const adapter = await connected(provider);

      await adapter.signTransaction?.(new Uint8Array([1]), { chain: BITCOIN_CHAINS.signet });

      expect(methodsCalled(provider)).toEqual([
        "wallet_getNetwork",
        "wallet_changeNetwork",
        "wallet_getAccount",
        "signPsbt",
      ]);
    });

    it("rejects an account the wallet never exposed", async () => {
      const provider = buildXverse();
      const adapter = await connected(provider);

      await expect(
        adapter.signTransaction?.(new Uint8Array([1]), { account: onMainnet("bc1qsomeoneelse") }),
      ).rejects.toThrow(/not exposed/v);
      expect(provider.request).not.toHaveBeenCalled();
    });
  });

  describe("switchChain", () => {
    it("moves the wallet and re-reads its addresses on the new network", async () => {
      const provider = buildXverse();
      const adapter = await connected(provider);

      await adapter.switchChain?.(BITCOIN_CHAINS.testnet);

      expect(provider.request).toHaveBeenCalledWith("wallet_changeNetwork", { name: "Testnet" });
      expect(await adapter.getAccounts()).toEqual([
        buildAccount(TESTNET_PAYMENT.address, BITCOIN_CHAINS.testnet),
      ]);
    });

    it("tells subscribers about the moved account", async () => {
      const adapter = await connected();
      const listener = vi.fn<(event: ConnectorEvent) => void>();
      const unsubscribe = adapter.subscribe?.(listener);

      await adapter.switchChain?.(BITCOIN_CHAINS.testnet);
      unsubscribe?.();
      await adapter.switchChain?.(BITCOIN_CHAINS.mainnet);

      expect(listener.mock.calls).toEqual([
        [
          {
            accounts: [buildAccount(TESTNET_PAYMENT.address, BITCOIN_CHAINS.testnet)],
            type: "accountsChanged",
          },
        ],
      ]);
    });

    it("skips the wallet prompt when it is already there", async () => {
      const provider = buildXverse();
      const adapter = await connected(provider);

      await adapter.switchChain?.(BITCOIN_CHAINS.mainnet);

      expect(methodsCalled(provider)).toEqual(["wallet_getNetwork"]);
    });

    it("rejects a non-Bitcoin namespace asynchronously", async () => {
      const adapter = await connected();

      const switching = adapter.switchChain?.(SUI_MAINNET);

      await expect(switching).rejects.toThrow(/non-Bitcoin/v);
    });

    it("surfaces a wallet that refuses the switch", async () => {
      const provider = buildXverse();
      const adapter = await connected(provider);
      provider.request
        .mockResolvedValueOnce({ result: { bitcoin: { name: "Mainnet" } } })
        .mockResolvedValueOnce({ error: { message: "User rejected the request" } });

      await expect(adapter.switchChain?.(BITCOIN_CHAINS.testnet)).rejects.toThrow(
        /wallet_changeNetwork failed: User rejected/v,
      );
      await expect(adapter.getAccounts()).resolves.toEqual([onMainnet(PAYMENT.address)]);
    });
  });
});
