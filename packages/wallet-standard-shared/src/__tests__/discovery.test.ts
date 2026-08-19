import type { WalletAdapter, WalletCapabilities } from "@usebutr/core";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { WalletStandardAdapterBuilder } from "../discovery";
import { discoverWalletStandard } from "../discovery";
import type { WalletsApp, WalletStandardModuleLoader, WalletStandardWallet } from "../types";

const capabilities: WalletCapabilities = {
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: false,
  signIn: false,
  signMessage: false,
  signTransaction: false,
  subscribe: false,
  switchAccount: false,
  switchChain: false,
};

const adapter = (id: string): WalletAdapter => ({
  capabilities,
  chainPlatform: "evm",
  connect: () => Promise.resolve(),
  getAccount: () => Promise.resolve(null),
  getBalance: () => Promise.resolve({ decimals: 18, formatted: "0", symbol: "ETH", value: 0n }),
  getSigner: () => Promise.resolve({}),
  getTransactionReceipt: () => Promise.resolve({ status: "Success" }),
  id,
  name: id,
  sendTx: () => Promise.resolve("0x0"),
  sendTxToChain: () => Promise.resolve("0x0"),
  signMessage: (message) => Promise.resolve({ signature: message, signedMessage: message }),
  switchChain: () => Promise.resolve(),
});

const wallet = (name: string): WalletStandardWallet => ({
  accounts: [],
  chains: [],
  features: {},
  icon: "",
  name,
  version: "1.0.0",
});

const walletApp = (initialWallets: ReadonlyArray<WalletStandardWallet>) => {
  const listeners: Partial<
    Record<"register" | "unregister", (...wallets: ReadonlyArray<WalletStandardWallet>) => void>
  > = {};
  const offRegister = vi.fn();
  const offUnregister = vi.fn();
  const app: WalletsApp = {
    get: vi.fn(() => initialWallets),
    on: vi.fn(
      (
        event: "register" | "unregister",
        listener: (...wallets: ReadonlyArray<WalletStandardWallet>) => void,
      ) => {
        listeners[event] = listener;
        return event === "register" ? offRegister : offUnregister;
      },
    ),
  };
  const loadModule: WalletStandardModuleLoader = () => Promise.resolve({ getWallets: () => app });

  return {
    app,
    emit: (event: "register" | "unregister", ...wallets: ReadonlyArray<WalletStandardWallet>) =>
      listeners[event]?.(...wallets),
    loadModule,
    offRegister,
    offUnregister,
  };
};

const loadMissingModule = () =>
  Promise.reject(new Error("Cannot find module '@wallet-standard/app'"));

describe("discoverWalletStandard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("warns once when @wallet-standard/app is not installed", async () => {
    const warn = vi.spyOn(console, "warn").mockReturnValue(undefined);
    const onAdapter = vi.fn<() => void>();
    const unsubscribeA = discoverWalletStandard(onAdapter, () => null, loadMissingModule);
    const unsubscribeB = discoverWalletStandard(onAdapter, () => null, loadMissingModule);

    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalled();
    });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain("@wallet-standard/app");
    expect(warn.mock.calls[0]?.[1]).toBeInstanceOf(Error);
    expect(onAdapter).not.toHaveBeenCalled();

    unsubscribeA();
    unsubscribeB();
  });

  it("discovers initial and registered wallets once and disconnects unregistered wallets", async () => {
    const first = wallet("first");
    const unsupported = wallet("unsupported");
    const duplicate = wallet("duplicate");
    const second = wallet("second");
    const unknown = wallet("unknown");
    const source = walletApp([first, unsupported]);
    const disconnectFirst = vi.fn();
    const disconnectSecond = vi.fn();
    const emitDisconnectFirst = () => {
      disconnectFirst();
    };
    const emitDisconnectSecond = () => {
      disconnectSecond();
    };
    const build: WalletStandardAdapterBuilder = (candidate, registerDisconnector) => {
      if (candidate === unsupported) {
        return null;
      }
      const id = candidate === duplicate ? "first" : candidate.name;
      registerDisconnector(candidate === first ? emitDisconnectFirst : emitDisconnectSecond);
      return adapter(id);
    };
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const unsubscribe = discoverWalletStandard(onAdapter, build, source.loadModule);

    await vi.waitFor(() => {
      expect(onAdapter).toHaveBeenCalledTimes(1);
    });

    source.emit("register", duplicate, second);
    expect(onAdapter.mock.calls.map(([registered]) => registered.id)).toEqual(["first", "second"]);

    source.emit("unregister", first, unknown);
    expect(disconnectFirst).toHaveBeenCalledTimes(1);
    expect(disconnectSecond).not.toHaveBeenCalled();

    source.emit("unregister", first);
    expect(disconnectFirst).toHaveBeenCalledTimes(1);

    unsubscribe();
    unsubscribe();
    expect(source.offRegister).toHaveBeenCalledTimes(1);
    expect(source.offUnregister).toHaveBeenCalledTimes(1);
  });

  it("does not subscribe when discovery is cancelled before the module loads", async () => {
    let resolveModule:
      | ((module: Awaited<ReturnType<WalletStandardModuleLoader>>) => void)
      | undefined;
    const source = walletApp([wallet("first")]);
    const loadModule: WalletStandardModuleLoader = () =>
      new Promise((resolve) => {
        resolveModule = resolve;
      });
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const unsubscribe = discoverWalletStandard(onAdapter, () => adapter("first"), loadModule);

    unsubscribe();
    resolveModule?.(await source.loadModule());

    await vi.waitFor(() => {
      expect(source.app.get).not.toHaveBeenCalled();
    });
    expect(source.app.on).not.toHaveBeenCalled();
    expect(onAdapter).not.toHaveBeenCalled();
  });
});
