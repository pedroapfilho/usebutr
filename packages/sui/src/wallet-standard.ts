import type { WalletAdapter } from "@usebutr/core";

import { buildSuiAdapter, slugify } from "./wallet-standard-adapter";
import type { WalletStandardAppModule, WalletStandardWallet } from "./wallet-standard-types";

/**
 * Subscribe to Sui Wallet Standard announcements.
 * Spec: https://docs.sui.io/standards/wallet-standard
 *
 * Runtime requires the `@wallet-standard/app` package, which is an
 * **optional peer dependency** of butr. EVM-only / SVM-only / Bitcoin-only
 * consumers don't need to install it — discovery will silently skip the
 * Sui side if the module isn't resolvable.
 *
 * Install for Sui auto-discovery:
 *
 *     npm install @wallet-standard/app
 *
 * Sui wallets share the same `getWallets()` bus as SVM wallets — Phantom
 * advertises features for SVM, EVM (via embedded), Sui, and Bitcoin from
 * a single Wallet Standard wallet object. `buildSuiAdapter` returns
 * `null` for wallets that don't advertise any `sui:*` features, so we
 * cleanly end up with one adapter per platform on multi-chain wallets.
 *
 * The function returns a synchronous unsubscribe that's safe to call
 * before the dynamic import has resolved.
 */
const discoverSuiAdapters = (onAdapter: (adapter: WalletAdapter) => void): (() => void) => {
  let cancelled = false;
  let internalUnsub: (() => void) | null = null;

  void (async () => {
    let mod: WalletStandardAppModule;
    try {
      mod = (await import("@wallet-standard/app")) as unknown as WalletStandardAppModule;
    } catch {
      // @wallet-standard/app not installed. Sui discovery is disabled;
      // other platforms still work. Consumers can wire Sui wallets
      // manually via WalletManagerConfig.createConnector if they skipped
      // the optional peer dep on purpose.
      return;
    }
    if (cancelled) {
      return;
    }

    const seen = new Set<string>();
    const disconnectors = new Map<string, () => void>();
    const tryAdd = (wallet: WalletStandardWallet) => {
      const adapter = buildSuiAdapter(wallet, (id, emit) => {
        disconnectors.set(id, emit);
      });
      if (!adapter || seen.has(adapter.id)) {
        return;
      }
      seen.add(adapter.id);
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
        const id = slugify(wallet.name);
        disconnectors.get(id)?.();
        disconnectors.delete(id);
        seen.delete(id);
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

export { discoverSuiAdapters };
