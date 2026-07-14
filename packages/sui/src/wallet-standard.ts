import type { WalletAdapter } from "@usebutr/core";
import { discoverWalletStandard } from "@usebutr/wallet-standard-shared";

import { buildSuiAdapter } from "./wallet-standard-adapter";

/**
 * Subscribe to Sui Wallet Standard announcements.
 * Spec: https://docs.sui.io/standards/wallet-standard
 *
 * Runtime requires the `@wallet-standard/app` package, which is an
 * **optional peer dependency** of butr.
 *
 * Sui wallets share the same `getWallets()` bus as SVM wallets; Phantom
 * advertises features for SVM, Sui, and Bitcoin from a single Wallet
 * Standard wallet object. `buildSuiAdapter` returns `null` for wallets
 * that don't advertise any `sui:*` features, so we cleanly end up with
 * one adapter per platform on multi-chain wallets.
 *
 * The discovery loop (dynamic import, dedupe, register / unregister
 * bridge) lives in `@usebutr/wallet-standard-shared`.
 */
const discoverSuiAdapters = (onAdapter: (adapter: WalletAdapter) => void): (() => void) =>
  discoverWalletStandard(onAdapter, (wallet, registerDisconnector) =>
    buildSuiAdapter(wallet, registerDisconnector),
  );

export { discoverSuiAdapters };
