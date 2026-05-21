import type { WalletAdapter } from "@usebutr/core";

import { buildBitcoinAdapter, slugify } from "./wallet-standard-adapter";
import type { WalletStandardAppModule, WalletStandardWallet } from "./wallet-standard-types";

/**
 * Subscribe to Bitcoin Wallet Standard announcements.
 *
 * Phantom (Bitcoin), Magic Eden, OKX Wallet (Bitcoin), and Leather
 * advertise `bitcoin:*` features over the same `getWallets()` bus that
 * SVM and Sui consume. `buildBitcoinAdapter` returns `null` for wallets
 * that don't advertise any `bip122:` chain, so multi-chain wallets
 * (Phantom: EVM + SVM + Sui + Bitcoin) produce one adapter per platform.
 *
 * Requires the **optional peer dependency** `@wallet-standard/app`.
 * Discovery silently skips Bitcoin if the module isn't resolvable.
 *
 * Install for Bitcoin auto-discovery:
 *
 *     npm install @wallet-standard/app
 *
 * The function returns a synchronous unsubscribe that's safe to call
 * before the dynamic import has resolved.
 */
const discoverBitcoinAdapters = (onAdapter: (adapter: WalletAdapter) => void): (() => void) => {
  let cancelled = false;
  let internalUnsub: (() => void) | null = null;

  void (async () => {
    let mod: WalletStandardAppModule;
    try {
      mod = (await import("@wallet-standard/app")) as unknown as WalletStandardAppModule;
    } catch {
      return;
    }
    if (cancelled) {
      return;
    }

    const seen = new Set<string>();
    const disconnectors = new Map<string, () => void>();
    const tryAdd = (wallet: WalletStandardWallet) => {
      const adapter = buildBitcoinAdapter(wallet, (id, emit) => {
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

export { discoverBitcoinAdapters };
