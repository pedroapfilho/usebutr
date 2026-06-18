import type { WalletAdapter } from "@usebutr/core";
import { logWarn } from "@usebutr/core";

import type { WalletStandardAppModule, WalletStandardWallet } from "./types";

// Warn once per process: every platform calls this, so a missing optional peer
// dep would otherwise log one identical line per chain.
let warnedMissingApp = false;

/**
 * Callback supplied by per-platform discovery to build a `WalletAdapter`
 * out of a Wallet Standard wallet announcement.
 *
 * Returns `null` when the wallet doesn't advertise this platform — that
 * lets a multi-chain wallet (e.g. Phantom: SVM + EVM + Sui + Bitcoin)
 * produce one adapter per platform without each builder needing to know
 * about the others.
 *
 * The second argument is a hook the builder calls during construction
 * to wire a synthetic `disconnected` event into its subscriber set.
 * The discovery loop fires the registered emitter when Wallet Standard
 * announces `unregister` for that wallet.
 */
type WalletStandardAdapterBuilder = (
  wallet: WalletStandardWallet,
  registerDisconnector: (emit: () => void) => void,
) => WalletAdapter | null;

/**
 * Subscribe to Wallet Standard announcements and turn matching wallets
 * into butr `WalletAdapter`s using a per-platform `build` callback.
 *
 * **Shared machinery** every platform package needs:
 *  - Dynamic import of `@wallet-standard/app` (optional peer dep —
 *    failure to resolve quietly disables discovery so consumers who
 *    don't install it pay nothing).
 *  - Cancellation: the returned unsubscribe is safe to call before the
 *    dynamic import has resolved.
 *  - Dedupe by adapter id, so re-announcements don't double-emit.
 *  - `unregister` integration: when an extension is removed mid-session,
 *    fire the disconnector the builder registered so connected pool
 *    entries on the consumer side tear down cleanly.
 *
 * **What's platform-specific** lives entirely in `build`:
 *  - Which `wallet.chains` to accept.
 *  - Which features to gate on.
 *  - The `id` slug prefix (use `slugify(prefix, wallet.name)`).
 *  - The capability resolver, the feature decoding, the chain coercion.
 *
 * Disconnectors are keyed by the wallet object itself (identity equality),
 * not by adapter id — Wallet Standard's `register` / `unregister` emit
 * the same wallet object, so identity is the cheapest stable key.
 */
const discoverWalletStandard = (
  onAdapter: (adapter: WalletAdapter) => void,
  build: WalletStandardAdapterBuilder,
): (() => void) => {
  let cancelled = false;
  let internalUnsub: (() => void) | null = null;

  void (async () => {
    let mod: WalletStandardAppModule;
    try {
      mod = (await import("@wallet-standard/app")) as unknown as WalletStandardAppModule;
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
    // wallet object → emitter that pushes synthetic `disconnected` to
    // this wallet's adapter's subscribers. Identity-keyed so the
    // unregister handler can find the right emitter cheaply.
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
