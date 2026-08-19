import type { WalletAdapter } from "@usebutr/core";
import { logWarn } from "@usebutr/core";
import type { Wallets as ImportedWallets } from "@wallet-standard/app";

import type {
  WalletStandardAppModule,
  WalletStandardModuleLoader,
  WalletStandardWallet,
} from "./types";

type ImportedWallet = ReturnType<ImportedWallets["get"]>[number];

const mapWallet = (wallet: ImportedWallet): WalletStandardWallet => {
  const features: Record<string, WalletStandardWallet["features"][string]> = {};
  for (const [name, value] of Object.entries(wallet.features)) {
    if (typeof value !== "object" || value === null) {
      continue;
    }
    const version =
      "version" in value && typeof value.version === "string" ? value.version : undefined;
    features[name] = { ...value, version };
  }
  return {
    accounts: wallet.accounts,
    chains: wallet.chains,
    features,
    icon: wallet.icon,
    name: wallet.name,
    version: wallet.version,
  };
};

let warnedMissingApp = false;

/**
 * Returns `null` when the wallet doesn't advertise this platform, so a
 * multi-chain wallet yields one adapter per platform. `registerDisconnector`
 * wires the synthetic `disconnected` fired on Wallet Standard `unregister`.
 */
type WalletStandardAdapterBuilder = (
  wallet: WalletStandardWallet,
  registerDisconnector: (emit: () => void) => void,
) => WalletAdapter | null;

const loadWalletStandardModule = async (): Promise<WalletStandardAppModule> => {
  const imported = await import("@wallet-standard/app");
  if (
    typeof imported !== "object" ||
    imported === null ||
    !("getWallets" in imported) ||
    typeof imported.getWallets !== "function"
  ) {
    throw new Error("@wallet-standard/app has no getWallets export");
  }
  const source = imported.getWallets();
  return {
    getWallets: () => ({
      get: () => source.get().map(mapWallet),
      on: (event, listener) =>
        source.on(event, (...wallets) => {
          listener(...wallets.map(mapWallet));
        }),
    }),
  };
};

/**
 * `@wallet-standard/app` is an optional peer dep: a failed import quietly
 * disables discovery. Disconnectors are keyed by wallet identity rather
 * than adapter id because `register` / `unregister` emit the same object.
 */
const discoverWalletStandard = (
  onAdapter: (adapter: WalletAdapter) => void,
  build: WalletStandardAdapterBuilder,
  loadModule: WalletStandardModuleLoader = loadWalletStandardModule,
): (() => void) => {
  let cancelled = false;
  let internalUnsub: (() => void) | null = null;

  void (async () => {
    let mod: WalletStandardAppModule;
    try {
      mod = await loadModule();
    } catch (error) {
      if (!warnedMissingApp) {
        warnedMissingApp = true;
        logWarn(
          "[butr] Wallet Standard wallet discovery is disabled: `@wallet-standard/app` could not be loaded. Install it (`npm i @wallet-standard/app`) to detect Wallet Standard wallets.",
          error,
        );
      }
      return;
    }
    if (cancelled) {
      return;
    }

    const seenIds = new Set<string>();
    const disconnectors = new Map<WalletStandardWallet, () => void>();

    const tryAdd = (wallet: WalletStandardWallet) => {
      const adapter = build(wallet, (emit) => {
        disconnectors.set(wallet, emit);
      });
      if (!adapter || seenIds.has(adapter.id)) {
        return;
      }
      seenIds.add(adapter.id);
      onAdapter(adapter);
    };

    const app = mod.getWallets();
    for (const wallet of app.get()) {
      tryAdd(wallet);
    }

    const offRegister = app.on("register", (...wallets) => {
      for (const wallet of wallets) {
        tryAdd(wallet);
      }
    });
    const offUnregister = app.on("unregister", (...wallets) => {
      for (const wallet of wallets) {
        const emit = disconnectors.get(wallet);
        if (emit) {
          emit();
          disconnectors.delete(wallet);
        }
      }
    });
    internalUnsub = () => {
      offRegister();
      offUnregister();
    };
  })();

  return () => {
    cancelled = true;
    internalUnsub?.();
    internalUnsub = null;
  };
};

export type { WalletStandardAdapterBuilder };
export { discoverWalletStandard };
