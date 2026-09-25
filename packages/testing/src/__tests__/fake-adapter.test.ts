import "./signer-registry";

import type {
  BitcoinAdapter,
  ChainPlatform,
  ConnectorEvent,
  EvmAdapter,
  PolkadotAdapter,
  SuiAdapter,
  SvmAdapter,
  WalletSigner,
} from "@usebutr/core";
import {
  base58ToBytes,
  buildAccount,
  ConnectionError,
  EVM_CHAINS,
  SUI_CHAINS,
  SVM_CHAINS,
} from "@usebutr/core";
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import type { FakeAdapter } from "../fake-adapter";
import { createFakeAdapter } from "../fake-adapter";

const message = new TextEncoder().encode("hello");

const members = (adapter: FakeAdapter<ChainPlatform>) => Object.keys(adapter).toSorted();

const REQUIRED = ["chainPlatform", "connect", "disconnect", "emit", "getAccounts", "getSigner"];
const IDENTITY = ["icon", "id", "listenerCount", "name"];

describe("createFakeAdapter", () => {
  it("defaults to an EVM wallet with an injected wallet's members", () => {
    const adapter = createFakeAdapter();
    expect(adapter).toMatchObject({ chainPlatform: "evm", id: "fake", name: "Fake Wallet" });
    expect(members(adapter)).toEqual(
      [
        ...REQUIRED,
        ...IDENTITY,
        "getBalance",
        "getTransactionReceipt",
        "requestAccounts",
        "sendTx",
        "signMessage",
        "subscribe",
        "switchChain",
      ].toSorted(),
    );
  });

  it.each([
    ["svm", ["sendTx", "signIn", "signMessage", "signTransaction", "subscribe"]],
    ["sui", ["sendTx", "signMessage", "signTransaction", "subscribe"]],
    ["bitcoin", ["sendTx", "signMessage", "signTransaction", "subscribe"]],
    ["polkadot", ["signMessage", "subscribe"]],
  ] as const)("gives a %s wallet only what such wallets have", (chainPlatform, optional) => {
    const adapter = createFakeAdapter({ chainPlatform });
    expect(members(adapter)).toEqual([...REQUIRED, ...IDENTITY, ...optional].toSorted());
  });

  it("types each platform's adapter", () => {
    expectTypeOf(createFakeAdapter()).toExtend<EvmAdapter>();
    expectTypeOf(createFakeAdapter({ chainPlatform: "svm" })).toExtend<SvmAdapter>();
    expectTypeOf(createFakeAdapter({ chainPlatform: "sui" })).toExtend<SuiAdapter>();
    expectTypeOf(createFakeAdapter({ chainPlatform: "bitcoin" })).toExtend<BitcoinAdapter>();
    expectTypeOf(createFakeAdapter({ chainPlatform: "polkadot" })).toExtend<PolkadotAdapter>();
  });

  it("takes an identity and exposes one plausible account by default", async () => {
    const adapter = createFakeAdapter({
      chainPlatform: "svm",
      icon: "data:image/svg+xml,x",
      id: "phantom",
      name: "Phantom",
    });
    expect(adapter).toMatchObject({ icon: "data:image/svg+xml,x", id: "phantom", name: "Phantom" });
    expect(await adapter.getAccounts()).toEqual([
      buildAccount("So11111111111111111111111111111111111111112", SVM_CHAINS.mainnet),
    ]);
  });

  it("resolves a fake signer naming the wallet", async () => {
    const signer: WalletSigner = { connectorId: "metamask", kind: "test" };
    await expect(createFakeAdapter({ id: "metamask", signer }).getSigner()).resolves.toBe(signer);
    await expect(createFakeAdapter().getSigner()).rejects.toThrow(/no signer/v);
  });

  describe("balances", () => {
    it.each([
      ["evm", "ETH", 18],
      ["svm", "SOL", 9],
      ["sui", "SUI", 9],
      ["bitcoin", "BTC", 8],
      ["polkadot", "DOT", 10],
    ] as const)(
      "reports %s balances in %s with %i decimals",
      async (chainPlatform, symbol, decimals) => {
        const adapter = createFakeAdapter({
          balance: 15n * 10n ** BigInt(decimals - 1),
          chainPlatform,
        });
        expect(await adapter.getBalance?.()).toEqual({
          decimals,
          formatted: "1.5",
          symbol,
          value: 15n * 10n ** BigInt(decimals - 1),
        });
      },
    );

    it("defaults an EVM balance to one ETH and leaves other platforms without getBalance", async () => {
      const balance = await createFakeAdapter().getBalance?.();
      expect(balance?.formatted).toBe("1");
      expect(createFakeAdapter({ chainPlatform: "svm" }).getBalance).toBeUndefined();
    });

    it("rejects token balances, which a fake cannot know", async () => {
      await expect(createFakeAdapter().getBalance?.({ token: "0xusdc" })).rejects.toThrow(
        "override getBalance",
      );
    });
  });

  describe("accounts", () => {
    const first = buildAccount("0xfirst", EVM_CHAINS.ethereum);
    const second = buildAccount("0xsecond", EVM_CHAINS.ethereum);

    it("signs as the active account, or as another exposed one", async () => {
      const adapter = createFakeAdapter({ accounts: [first, second] });
      const signed = await adapter.signMessage?.(message);
      expect(signed?.signedMessage).toEqual(message);
      await expect(adapter.signMessage?.(message, { account: second })).resolves.toBeDefined();
    });

    it("rejects an account it does not expose instead of using another", async () => {
      const adapter = createFakeAdapter({ accounts: [first] });
      const stranger = { account: second };
      await expect(adapter.signMessage?.(message, stranger)).rejects.toThrow("does not expose");
      await expect(adapter.sendTx?.({}, stranger)).rejects.toThrow("does not expose");
      await expect(adapter.getBalance?.(stranger)).rejects.toThrow("does not expose");
    });

    it("rejects NotConnected once disconnected, until connect", async () => {
      const adapter = createFakeAdapter();
      await adapter.disconnect?.();
      expect(await adapter.getAccounts()).toEqual([]);
      await expect(adapter.signMessage?.(message)).rejects.toBeInstanceOf(ConnectionError);
      await expect(adapter.sendTx?.({})).rejects.toMatchObject({ kind: "NotConnected" });

      await adapter.connect();
      expect(await adapter.getAccounts()).toHaveLength(1);
    });

    it("rejects asynchronously rather than throwing", () => {
      const adapter = createFakeAdapter({ accounts: [first] });
      const attempt = adapter.signMessage?.(message, { account: second });
      expect(attempt).toBeInstanceOf(Promise);
      return expect(attempt).rejects.toThrow();
    });
  });

  describe("chains", () => {
    it("switches an EVM wallet before sending to another chain", async () => {
      const adapter = createFakeAdapter();
      const listener = vi.fn<(event: ConnectorEvent) => void>();
      adapter.subscribe?.(listener);

      await adapter.sendTx?.({ to: "0x2", value: 1n }, { chain: EVM_CHAINS.base });

      const [account] = await adapter.getAccounts();
      expect(account?.chain).toBe(EVM_CHAINS.base);
      expect(listener).toHaveBeenCalledWith({ accounts: [account], type: "accountsChanged" });
    });

    it("routes a Wallet Standard call per chain without moving the wallet", async () => {
      const adapter = createFakeAdapter({ chainPlatform: "svm" });
      await adapter.sendTx?.(new Uint8Array([1]), { chain: SVM_CHAINS.devnet });
      const [account] = await adapter.getAccounts();
      expect(account?.chain).toBe(SVM_CHAINS.mainnet);
    });

    it("rejects a chain from another namespace", async () => {
      await expect(createFakeAdapter().switchChain?.(SUI_CHAINS.mainnet)).rejects.toThrow(
        "not a eip155 chain",
      );
      await expect(createFakeAdapter().sendTx?.({}, { chain: SVM_CHAINS.mainnet })).rejects.toThrow(
        "not a eip155 chain",
      );
      const sui = createFakeAdapter({ chainPlatform: "sui" });
      await expect(sui.signTransaction?.("{}", { chain: EVM_CHAINS.ethereum })).rejects.toThrow(
        "not a sui chain",
      );
    });
  });

  describe("transactions", () => {
    it("resolves distinct, well-formed hashes per platform", async () => {
      const evm = createFakeAdapter();
      const first = await evm.sendTx?.({});
      expect(first).toMatch(/^0x[\da-f]{64}$/v);
      expect(await evm.sendTx?.({})).not.toBe(first);

      const bitcoin = createFakeAdapter({ chainPlatform: "bitcoin" });
      expect(await bitcoin.sendTx?.({ amount: 1000n, recipient: "bc1qrecipient" })).toMatch(
        /^[\da-f]{64}$/v,
      );

      const svm = createFakeAdapter({ chainPlatform: "svm" });
      const signature = (await svm.sendTx?.(new Uint8Array([1]))) ?? "";
      expect(base58ToBytes(signature)).toHaveLength(64);
      expect(await evm.getTransactionReceipt?.(first ?? "")).toEqual({ status: "Success" });
    });

    it("signs without broadcasting", async () => {
      const psbt = new Uint8Array([7, 7]);
      const bitcoin = createFakeAdapter({ chainPlatform: "bitcoin" });
      expect(await bitcoin.signTransaction?.(psbt)).toBe(psbt);

      const sui = createFakeAdapter({ chainPlatform: "sui" });
      const fromJson = await sui.signTransaction?.({ toJSON: () => Promise.resolve('{"v":1}') });
      expect(new TextDecoder().decode(fromJson?.bytes)).toBe('{"v":1}');
      expect(fromJson?.signature).toHaveLength(64);
      const fromBytes = await sui.signTransaction?.(psbt);
      expect(fromBytes?.bytes).toBe(psbt);
    });

    it("rejects a Bitcoin transfer of nothing", async () => {
      const bitcoin = createFakeAdapter({ chainPlatform: "bitcoin" });
      await expect(bitcoin.sendTx?.({ amount: 0n, recipient: "bc1q" })).rejects.toThrow(
        "0 satoshis",
      );
    });

    it("signs in with Solana as the active account", async () => {
      const adapter = createFakeAdapter({ chainPlatform: "svm" });
      const output = await adapter.signIn?.({ domain: "app.example", nonce: "n-1" });
      const [active] = await adapter.getAccounts();
      expect(output?.account).toEqual(active);
      expect(new TextDecoder().decode(output?.signedMessage)).toBe(
        "app.example wants you to sign in with your Solana account:\nSo11111111111111111111111111111111111111112\n\nNonce: n-1",
      );
    });
  });

  describe("events", () => {
    it("delivers events to subscribers and mirrors them in getAccounts", async () => {
      const adapter = createFakeAdapter();
      const listener = vi.fn<(event: ConnectorEvent) => void>();
      const unsubscribe = adapter.subscribe?.(listener);
      const next = [buildAccount("0xnext", EVM_CHAINS.ethereum)];

      adapter.emit({ accounts: next, type: "accountsChanged" });
      expect(listener).toHaveBeenLastCalledWith({ accounts: next, type: "accountsChanged" });
      expect(await adapter.getAccounts()).toBe(next);

      adapter.emit({ type: "disconnected" });
      expect(await adapter.getAccounts()).toEqual([]);
      await adapter.connect({ silent: true });
      expect(await adapter.getAccounts()).toBe(next);

      expect(adapter.listenerCount()).toBe(1);
      unsubscribe?.();
      expect(adapter.listenerCount()).toBe(0);
    });

    it("treats an empty account list as a disconnect", async () => {
      const adapter = createFakeAdapter();
      adapter.emit({ accounts: [], type: "accountsChanged" });
      expect(await adapter.getAccounts()).toEqual([]);
    });
  });

  describe("omit and overrides", () => {
    it("omits members so presence checks take the unsupported path", () => {
      const adapter = createFakeAdapter({ omit: ["signMessage", "subscribe"] });
      expect("signMessage" in adapter).toBe(false);
      expect(adapter.subscribe).toBeUndefined();
      expect(() => {
        adapter.emit({ type: "disconnected" });
      }).not.toThrow();
    });

    it("replaces members with overrides", async () => {
      const rejected = new Error("user rejected");
      const adapter = createFakeAdapter({
        chainPlatform: "svm",
        overrides: { connect: () => Promise.reject(rejected) },
      });
      await expect(adapter.connect()).rejects.toBe(rejected);
    });

    it.each<ChainPlatform>(["evm", "svm", "sui", "bitcoin", "polkadot"])(
      "builds any platform from a union-typed option (%s)",
      (chainPlatform) => {
        expect(createFakeAdapter({ chainPlatform }).chainPlatform).toBe(chainPlatform);
      },
    );
  });
});
