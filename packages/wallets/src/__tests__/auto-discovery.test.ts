import type { WalletAdapter } from "@usebutr/core";
import { BITCOIN_CHAINS, POLKADOT_CHAINS } from "@usebutr/core";
import type {
  WalletsApp,
  WalletStandardModuleLoader,
  WalletStandardWallet,
} from "@usebutr/wallet-standard-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AutoDiscoveryOptions } from "../auto-discovery";
import { autoDiscovery } from "../auto-discovery";
import { SETTLE_MS } from "../discovery-bus";

/** A Wallet Standard registry whose module takes `loadMs` to import. */
const fakeRegistry = (loadMs = 0) => {
  const wallets: Array<WalletStandardWallet> = [];
  const listeners = new Set<(...registered: ReadonlyArray<WalletStandardWallet>) => void>();

  const app: WalletsApp = {
    get: () => wallets,
    on: (event, listener) => {
      if (event !== "register") {
        return () => {};
      }

      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };

  const loadModule: WalletStandardModuleLoader = () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({ getWallets: () => app });
      }, loadMs);
    });

  const register = (wallet: WalletStandardWallet) => {
    wallets.push(wallet);

    for (const listener of listeners) {
      listener(wallet);
    }
  };

  return { loadModule, register };
};

const standardWallet = (name: string, chain: string): WalletStandardWallet => ({
  accounts: [],
  chains: [chain],
  features: {
    "standard:connect": { connect: () => Promise.resolve({ accounts: [] }), version: "1.0.0" },
  },
  icon: "",
  name,
  version: "1.0.0",
});

const unisatProvider = () => ({
  getAccounts: () => Promise.resolve([]),
  requestAccounts: () => Promise.resolve([]),
  signMessage: () => Promise.resolve(""),
  signPsbt: () => Promise.resolve(""),
});

const eip1193Provider = () => ({
  on() {},
  removeListener() {},
  request: () => Promise.resolve(null),
});

const polkadotExtension = () => ({ enable: () => Promise.reject(new Error("not used")) });

/** A browser window with EIP-6963 events and whatever globals a test injects. */
const fakeWindow = () => {
  const host = new EventTarget();
  vi.stubGlobal("window", host);

  return host;
};

const announceOnRequest = (host: EventTarget, name: string, rdns: string) => {
  host.addEventListener("eip6963:requestProvider", () => {
    host.dispatchEvent(
      new CustomEvent("eip6963:announceProvider", {
        detail: { info: { icon: "", name, rdns, uuid: rdns }, provider: eip1193Provider() },
      }),
    );
  });
};

const start = (
  registry: ReturnType<typeof fakeRegistry>,
  platforms?: Parameters<typeof autoDiscovery>[0],
  options: AutoDiscoveryOptions = {},
) => {
  const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
  const stop = autoDiscovery(platforms, { ...options, loadModule: registry.loadModule })(onAdapter);
  const listed = () => onAdapter.mock.calls.map(([adapter]) => adapter.id);

  return { listed, stop };
};

describe("autoDiscovery", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("lists a wallet on both Bitcoin channels once", async () => {
    const registry = fakeRegistry();
    Object.assign(fakeWindow(), {
      XverseProviders: { BitcoinProvider: { request: () => Promise.resolve({}) } },
    });
    registry.register(standardWallet("Xverse", BITCOIN_CHAINS.mainnet.id));

    const { listed, stop } = start(registry, ["bitcoin"]);
    await vi.advanceTimersByTimeAsync(SETTLE_MS);

    expect(listed()).toEqual(["wallet-standard:btc-xverse"]);
    stop();
  });

  it("keeps fallback wallets that no primary channel announced", async () => {
    const registry = fakeRegistry();
    Object.assign(fakeWindow(), {
      okxwallet: { bitcoin: unisatProvider() },
      unisat: unisatProvider(),
    });
    registry.register(standardWallet("Phantom", BITCOIN_CHAINS.mainnet.id));
    registry.register(standardWallet("OKX Wallet", BITCOIN_CHAINS.mainnet.id));

    const { listed, stop } = start(registry, ["bitcoin"]);
    await vi.advanceTimersByTimeAsync(SETTLE_MS);

    expect(listed()).toEqual([
      "wallet-standard:btc-phantom",
      "wallet-standard:btc-okx-wallet",
      "injected:bitcoin:unisat",
    ]);
    stop();
  });

  it("waits for a slow Wallet Standard import before settling the fallbacks", async () => {
    const registry = fakeRegistry(SETTLE_MS * 4);
    Object.assign(fakeWindow(), {
      XverseProviders: { BitcoinProvider: { request: () => Promise.resolve({}) } },
    });
    registry.register(standardWallet("Xverse", BITCOIN_CHAINS.mainnet.id));

    const { listed, stop } = start(registry, ["bitcoin"]);
    await vi.advanceTimersByTimeAsync(SETTLE_MS * 2);
    expect(listed()).toEqual([]);
    await vi.advanceTimersByTimeAsync(SETTLE_MS * 3);

    expect(listed()).toEqual(["wallet-standard:btc-xverse"]);
    stop();
  });

  it("lists a late Polkadot extension on both channels once", async () => {
    const registry = fakeRegistry();
    const host = fakeWindow();
    registry.register(standardWallet("Talisman", POLKADOT_CHAINS.polkadot.id));

    const { listed, stop } = start(registry, ["polkadot"]);
    await vi.advanceTimersByTimeAsync(SETTLE_MS);
    Object.assign(host, { injectedWeb3: { talisman: polkadotExtension() } });
    await vi.advanceTimersByTimeAsync(1000);

    expect(listed()).toEqual(["wallet-standard:polkadot-talisman"]);
    stop();
  });

  it("lists a Wallet Standard Polkadot wallet next to an unrelated injected extension", async () => {
    const registry = fakeRegistry();
    Object.assign(fakeWindow(), { injectedWeb3: { "polkadot-js": polkadotExtension() } });
    registry.register(standardWallet("Talisman", POLKADOT_CHAINS.polkadot.id));
    registry.register(standardWallet("Polkadot{.js}", POLKADOT_CHAINS.polkadot.id));

    const { listed, stop } = start(registry, ["polkadot"]);
    await vi.advanceTimersByTimeAsync(SETTLE_MS);

    expect(listed()).toEqual([
      "injected:polkadot:polkadot-js",
      "wallet-standard:polkadot-talisman",
    ]);
    stop();
  });

  it("lists window.ethereum only when no EIP-6963 wallet announced", async () => {
    const registry = fakeRegistry();
    const announcing = fakeWindow();
    Object.assign(announcing, { ethereum: eip1193Provider() });
    announceOnRequest(announcing, "MetaMask", "io.metamask");
    const withWallet = start(registry, ["evm"]);
    await vi.advanceTimersByTimeAsync(SETTLE_MS);
    expect(withWallet.listed()).toEqual(["io.metamask"]);
    withWallet.stop();

    Object.assign(fakeWindow(), { ethereum: eip1193Provider() });
    const legacyOnly = start(registry, ["evm"]);
    await vi.advanceTimersByTimeAsync(SETTLE_MS);
    expect(legacyOnly.listed()).toEqual(["injected:legacy"]);
    legacyOnly.stop();
  });

  it("skips every fallback channel when fallbacks are off", async () => {
    const registry = fakeRegistry();
    Object.assign(fakeWindow(), { ethereum: eip1193Provider(), unisat: unisatProvider() });
    registry.register(standardWallet("Talisman", POLKADOT_CHAINS.polkadot.id));

    const { listed, stop } = start(registry, undefined, { fallbacks: false });
    await vi.advanceTimersByTimeAsync(SETTLE_MS);

    expect(listed()).toEqual([]);
    stop();
  });

  it("drops held fallbacks when unsubscribed before the settle window closes", async () => {
    const registry = fakeRegistry();
    Object.assign(fakeWindow(), { unisat: unisatProvider() });

    const { listed, stop } = start(registry, ["bitcoin"]);
    stop();
    await vi.advanceTimersByTimeAsync(SETTLE_MS * 2);

    expect(listed()).toEqual([]);
  });

  it("warns and finds nothing for an empty platform list", () => {
    const registry = fakeRegistry();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { listed, stop } = start(registry, []);
    stop();

    expect(listed()).toEqual([]);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
