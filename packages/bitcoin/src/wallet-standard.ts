import type { WalletAdapter } from "@usebutr/core";
import { discoverWalletStandard } from "@usebutr/wallet-standard-shared";

import { buildBitcoinAdapter } from "./wallet-standard-adapter";

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
 *
 * The discovery loop (dynamic import, dedupe, register / unregister
 * bridge) lives in `@usebutr/wallet-standard-shared`.
 */
const discoverBitcoinAdapters = (onAdapter: (adapter: WalletAdapter) => void): (() => void) =>
  discoverWalletStandard(onAdapter, (wallet, registerDisconnector) =>
    buildBitcoinAdapter(wallet, registerDisconnector),
  );

export { discoverBitcoinAdapters };
