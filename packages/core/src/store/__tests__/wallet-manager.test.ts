import { afterEach, describe, expect, it, vi } from "vitest";

import type { Callbacks } from "../../__tests__/helpers";
import {
  createGate,
  createManualSource,
  createMemoryPersistence,
  ETHEREUM,
  evmAdapter,
  flush,
  rejectionOf,
  staticSource,
  svmAdapter,
} from "../../__tests__/helpers";
import { EVM_CHAINS } from "../../chains";
import type { WalletPersistence } from "../../storage/persistence";
import type { Account, WalletAdapter, WalletManagerConfig } from "../../types";
import { buildAccount, ConnectionError } from "../../types";
import type { WalletSource } from "../../wallet-source";
import { createWalletManager } from "../wallet-manager";

type Setup = {
  adapters?: ReadonlyArray<WalletAdapter>;
  config?: WalletManagerConfig;
  storage?: WalletPersistence;
};

/** A started manager whose adapters are announced before hydration runs. */
const startManager = async ({ adapters = [], config = {}, storage }: Setup = {}) => {
  const persistence = storage ?? createMemoryPersistence();
  const manager = createWalletManager({
    sources: [staticSource(...adapters)],
    storage: persistence,
    ...config,
  });
  const stop = manager.start();
  await flush();
  return { manager, stop };
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("createWalletManager", () => {
  describe("sources and start", () => {
    it("does nothing until started", () => {
      const source = vi.fn<WalletSource>(() => () => {});
      const storage = createMemoryPersistence();
      const manager = createWalletManager({ sources: [source], storage });

      expect(source).not.toHaveBeenCalled();
      expect(storage.load).not.toHaveBeenCalled();
      expect(manager.getState()).toBe(manager.getInitialState());
      expect(manager.getState().isHydrated).toBe(false);
    });

    it("registers every announced adapter once, the first announcement winning", async () => {
      const first = evmAdapter("metamask");
      const phantom = svmAdapter("phantom");
      const { manager } = await startManager({
        adapters: [first, phantom, evmAdapter("metamask")],
      });

      expect(manager.getState().adapters).toEqual([first, phantom]);
    });

    it("unsubscribes every source and wallet listener on stop", async () => {
      const manual = createManualSource();
      const adapter = evmAdapter("metamask");
      const manager = createWalletManager({
        sources: [manual.source],
        storage: createMemoryPersistence(),
      });
      const stop = manager.start();
      manual.announce(adapter);
      await manager.connect("metamask");
      expect(adapter.listenerCount()).toBe(1);

      stop();
      expect(manual.unsubscribe).toHaveBeenCalledOnce();
      expect(adapter.listenerCount()).toBe(0);
      adapter.emit({ type: "disconnected" });
      expect(manager.getState().pool.has("metamask")).toBe(true);
    });

    it("survives a StrictMode start, stop, start without hydrating twice", async () => {
      const adapter = evmAdapter("metamask");
      const source = vi.fn(staticSource(adapter));
      const storage = createMemoryPersistence({
        pool: {
          metamask: {
            account: buildAccount("0xmetamask", ETHEREUM),
            accounts: [buildAccount("0xmetamask", ETHEREUM)],
            chainPlatform: "evm",
            connectorId: "metamask",
            name: "MetaMask",
          },
        },
      });
      const manager = createWalletManager({ sources: [source], storage });

      manager.start()();
      manager.start();
      await flush();

      expect(source).toHaveBeenCalledTimes(2);
      expect(storage.load).toHaveBeenCalledOnce();
      expect(adapter.connect).toHaveBeenCalledOnce();
      expect(manager.getState().adapters).toHaveLength(1);
      expect(adapter.listenerCount()).toBe(1);
    });

    it("logs a source that throws on subscribe or unsubscribe and keeps the others", () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const adapter = evmAdapter("metamask");
      const manager = createWalletManager({
        sources: [
          () => {
            throw new Error("subscribe");
          },
          () => () => {
            throw new Error("unsubscribe");
          },
          staticSource(adapter),
        ],
        storage: createMemoryPersistence(),
      });

      const stop = manager.start();
      expect(manager.getState().adapters).toEqual([adapter]);
      expect(error).toHaveBeenCalledWith(
        expect.stringContaining("threw on subscribe"),
        expect.any(Error),
      );
      stop();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("threw on unsubscribe"),
        expect.any(Error),
      );
    });
  });

  describe("connect", () => {
    it("resolves the connected wallet and makes it active and selected", async () => {
      const onConnect = vi.fn<Callbacks["onConnect"]>();
      const adapter = evmAdapter("metamask");
      const { manager } = await startManager({ adapters: [adapter], config: { onConnect } });

      const wallet = await manager.connect("metamask");

      expect(wallet.connector).toBe(adapter);
      expect(wallet.account).toEqual(buildAccount("0xmetamask", ETHEREUM));
      const state = manager.getState();
      expect(state.pool.get("metamask")).toBe(wallet);
      expect(state.activeConnectorId).toBe("metamask");
      expect(state.selection.get("evm")).toBe("metamask");
      expect(state.connectionStatus).toBe("success");
      expect(onConnect).toHaveBeenCalledExactlyOnceWith(wallet, { reconnected: false });
      expect(adapter.connect).toHaveBeenCalledWith();
    });

    it("rejects WalletNotFound for an id no source announced", async () => {
      const onConnectError = vi.fn<Callbacks["onConnectError"]>();
      const { manager } = await startManager({ config: { onConnectError } });

      const error = await rejectionOf(manager.connect("nope"));

      expect(error).toBeInstanceOf(ConnectionError);
      expect(error).toMatchObject({ kind: "WalletNotFound" });
      expect(manager.getState().connectionError).toBe(error);
      expect(manager.getState().connectionStatus).toBe("error");
      expect(onConnectError).toHaveBeenCalledExactlyOnceWith(error, "nope");
    });

    it("rejects NotConnected and tears down when the wallet exposes no accounts", async () => {
      const adapter = evmAdapter("metamask", { accounts: [] });
      const { manager } = await startManager({ adapters: [adapter] });

      await expect(manager.connect("metamask")).rejects.toMatchObject({ kind: "NotConnected" });
      expect(adapter.disconnect).toHaveBeenCalledOnce();
      expect(manager.getState().pool.size).toBe(0);
    });

    it("classifies the wallet's own error and keeps it as the cause", async () => {
      const raw = Object.assign(new Error("User rejected the request"), { code: 4001 });
      const adapter = evmAdapter("metamask", { connect: () => Promise.reject(raw) });
      const { manager } = await startManager({ adapters: [adapter] });

      const error = await rejectionOf(manager.connect("metamask"));
      expect(error).toMatchObject({ cause: raw, kind: "UserRejected" });
    });

    it("rejects Timeout when the wallet never answers", async () => {
      vi.useFakeTimers();
      const adapter = evmAdapter("metamask", { connect: () => new Promise(() => {}) });
      const manager = createWalletManager({
        sources: [staticSource(adapter)],
        storage: createMemoryPersistence(),
      });
      manager.start();

      const attempt = rejectionOf(manager.connect("metamask"));
      await vi.advanceTimersByTimeAsync(90_000);

      expect(await attempt).toMatchObject({ kind: "Timeout" });
      expect(adapter.disconnect).toHaveBeenCalledOnce();
    });

    it("reports a slow attempt once, and not one that settles in time", async () => {
      vi.useFakeTimers();
      const onSlowConnect = vi.fn<Callbacks["onSlowConnect"]>();
      const gate = createGate();
      const slow = evmAdapter("slow", { connect: () => gate.promise });
      const manager = createWalletManager({
        onSlowConnect,
        slowConnectThresholdMs: 1000,
        sources: [staticSource(slow, evmAdapter("fast"))],
        storage: createMemoryPersistence(),
      });
      manager.start();

      await manager.connect("fast");
      const attempt = manager.connect("slow");
      await vi.advanceTimersByTimeAsync(5000);
      gate.open();
      await attempt;

      expect(onSlowConnect).toHaveBeenCalledExactlyOnceWith("slow");
    });

    it("does not tear down a live wallet whose reconnect fails", async () => {
      const adapter = evmAdapter("metamask");
      const { manager } = await startManager({ adapters: [adapter] });
      const wallet = await manager.connect("metamask");

      adapter.connect = () => Promise.reject(new Error("user rejected"));
      await expect(manager.connect("metamask")).rejects.toMatchObject({ kind: "UserRejected" });

      expect(adapter.disconnect).not.toHaveBeenCalled();
      expect(manager.getState().pool.get("metamask")).toBe(wallet);
    });

    it("survives callbacks that throw", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { manager } = await startManager({
        adapters: [evmAdapter("metamask")],
        config: {
          onConnect: () => {
            throw new Error("consumer bug");
          },
          onConnectError: () => {
            throw new Error("consumer bug");
          },
        },
      });

      await expect(manager.connect("metamask")).resolves.toBeDefined();
      await expect(manager.connect("nope")).rejects.toMatchObject({ kind: "WalletNotFound" });
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("onConnect threw"),
        expect.any(Error),
      );
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("onConnectError threw"),
        expect.any(Error),
      );
    });

    it("clearConnectionError returns the attempt state to idle", async () => {
      const { manager } = await startManager();
      await manager.connect("nope").catch(() => {});

      manager.clearConnectionError();
      expect(manager.getState()).toMatchObject({
        connectionError: null,
        connectionStatus: "idle",
      });
    });
  });

  describe("disconnect", () => {
    it("by the user tears the wallet down and forgets it", async () => {
      const onDisconnect = vi.fn<Callbacks["onDisconnect"]>();
      const adapter = evmAdapter("metamask");
      const { manager } = await startManager({
        adapters: [adapter, evmAdapter("rabby")],
        config: { onDisconnect },
      });
      const wallet = await manager.connect("metamask");
      await manager.connect("rabby");

      manager.disconnect("metamask");

      expect(adapter.disconnect).toHaveBeenCalledOnce();
      expect(onDisconnect).toHaveBeenCalledExactlyOnceWith(wallet, { byUser: true });
      const state = manager.getState();
      expect([...state.pool.keys()]).toEqual(["rabby"]);
      expect(state.dormant.has("metamask")).toBe(false);
      expect(state.isUserDisconnected).toBe(true);
      expect(adapter.listenerCount()).toBe(0);
    });

    it("of an unknown wallet calls nothing", async () => {
      const onDisconnect = vi.fn<Callbacks["onDisconnect"]>();
      const { manager } = await startManager({ config: { onDisconnect } });
      manager.disconnect("nope");
      expect(onDisconnect).not.toHaveBeenCalled();
    });

    it.each([
      ["a disconnected event", { type: "disconnected" as const }],
      ["an empty accountsChanged", { accounts: [], type: "accountsChanged" as const }],
    ])("by the wallet (%s) keeps the connection dormant", async (_label, event) => {
      const onDisconnect = vi.fn<Callbacks["onDisconnect"]>();
      const adapter = evmAdapter("metamask");
      const { manager } = await startManager({ adapters: [adapter], config: { onDisconnect } });
      const wallet = await manager.connect("metamask");

      adapter.emit(event);

      expect(adapter.disconnect).toHaveBeenCalledOnce();
      expect(onDisconnect).toHaveBeenCalledExactlyOnceWith(wallet, { byUser: false });
      const state = manager.getState();
      expect(state.pool.size).toBe(0);
      expect(state.dormant.get("metamask")?.account).toEqual(wallet.account);
      expect(state.isUserDisconnected).toBe(false);
    });

    it("disconnectAll tears every wallet down and forgets every connection", async () => {
      const onDisconnect = vi.fn<Callbacks["onDisconnect"]>();
      const metamask = evmAdapter("metamask");
      const phantom = svmAdapter("phantom");
      const { manager } = await startManager({
        adapters: [metamask, phantom],
        config: { onDisconnect },
      });
      await manager.connect("metamask");
      await manager.connect("phantom");

      manager.disconnectAll();

      expect(metamask.disconnect).toHaveBeenCalledOnce();
      expect(phantom.disconnect).toHaveBeenCalledOnce();
      expect(onDisconnect).toHaveBeenCalledTimes(2);
      expect(manager.getState()).toMatchObject({
        activeConnectorId: null,
        isUserDisconnected: true,
      });
      expect(manager.getState().pool.size).toBe(0);
      expect(manager.getState().adapters).toHaveLength(2);
    });

    it("logs a teardown that rejects", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const adapter = evmAdapter("metamask", {
        disconnect: () => Promise.reject(new Error("gone")),
      });
      const { manager } = await startManager({ adapters: [adapter] });
      await manager.connect("metamask");

      manager.disconnect("metamask");
      await flush();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("disconnect of metamask failed"),
        expect.any(Error),
      );
    });
  });

  describe("accounts", () => {
    const first = buildAccount("0xfirst", ETHEREUM);
    const second = buildAccount("0xsecond", ETHEREUM);

    it("mirrors an accountsChanged event, active account first", async () => {
      const adapter = evmAdapter("metamask", { accounts: [first] });
      const { manager } = await startManager({ adapters: [adapter] });
      await manager.connect("metamask");

      adapter.emit({ accounts: [second, first], type: "accountsChanged" });

      const wallet = manager.getState().pool.get("metamask");
      expect(wallet?.account).toBe(second);
      expect(wallet?.accounts).toEqual([second, first]);
    });

    it("requestAccounts opens the picker, then refreshes the entry", async () => {
      let exposed: ReadonlyArray<Account> = [first];
      const requestAccounts = vi.fn(() => {
        exposed = [first, second];
        return Promise.resolve();
      });
      const adapter = evmAdapter("metamask", {
        getAccounts: () => Promise.resolve(exposed),
        requestAccounts,
      });
      const { manager } = await startManager({ adapters: [adapter] });
      await manager.connect("metamask");

      await manager.requestAccounts("metamask");

      expect(requestAccounts).toHaveBeenCalledOnce();
      expect(manager.getState().pool.get("metamask")?.accounts).toEqual([first, second]);
      expect(manager.getState().pool.get("metamask")?.account).toBe(first);
    });

    it("requestAccounts is a no-op for a wallet without it", async () => {
      const adapter = evmAdapter("metamask");
      const { manager } = await startManager({ adapters: [adapter] });
      await manager.connect("metamask");
      const before = manager.getState();

      await manager.requestAccounts("metamask");
      await manager.requestAccounts("nope");

      expect(adapter.getAccounts).toHaveBeenCalledOnce();
      expect(manager.getState()).toBe(before);
    });

    it("setAccount makes an exposed account active", async () => {
      const { manager } = await startManager({
        adapters: [evmAdapter("metamask", { accounts: [first, second] })],
      });
      await manager.connect("metamask");

      manager.setAccount("metamask", second);

      const wallet = manager.getState().pool.get("metamask");
      expect(wallet?.account).toBe(second);
      expect(wallet?.accounts).toEqual([first, second]);
    });

    it("setAccount on another chain moves every account to that chain", async () => {
      const { manager } = await startManager({
        adapters: [evmAdapter("metamask", { accounts: [first, second] })],
      });
      await manager.connect("metamask");
      const onBase = buildAccount("0xsecond", EVM_CHAINS.base);

      manager.setAccount("metamask", onBase);

      const wallet = manager.getState().pool.get("metamask");
      expect(wallet?.account).toBe(onBase);
      expect(wallet?.accounts.map((account) => account.id)).toEqual([
        "eip155:8453:0xfirst",
        "eip155:8453:0xsecond",
      ]);
    });

    it("setAccount appends an account the entry did not list, and ignores unknown wallets", async () => {
      const { manager } = await startManager({
        adapters: [evmAdapter("metamask", { accounts: [first] })],
      });
      await manager.connect("metamask");

      manager.setAccount("metamask", second);
      manager.setAccount("nope", second);

      expect(manager.getState().pool.get("metamask")?.accounts).toEqual([first, second]);
      expect(manager.getState().pool.has("nope")).toBe(false);
    });
  });

  describe("setActive and setSelection", () => {
    it("switch between pooled wallets and ignore anything else", async () => {
      const { manager } = await startManager({
        adapters: [evmAdapter("metamask"), evmAdapter("rabby"), svmAdapter("phantom")],
      });
      await manager.connect("metamask");
      await manager.connect("rabby");
      await manager.connect("phantom");

      manager.setActive("metamask");
      manager.setSelection("evm", "metamask");
      manager.setSelection("svm", "metamask");
      manager.setActive("nope");

      const state = manager.getState();
      expect(state.activeConnectorId).toBe("metamask");
      expect(state.selection.get("evm")).toBe("metamask");
      expect(state.selection.get("svm")).toBe("phantom");
    });
  });
});
