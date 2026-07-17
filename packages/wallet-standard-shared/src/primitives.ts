import type { WalletStandardWallet, WalletStandardWalletAccount } from "./types";

/**
 * Convert a wallet name into a stable kebab-case adapter id, scoped by
 * a platform prefix so adapters from different platforms (Phantom SVM,
 * Phantom Sui, Phantom BTC) coexist in the pool without colliding on
 * the shared `getWallets()` bus.
 *
 * @example
 * slugify("svm", "Phantom")    // "wallet-standard:svm-phantom"
 * slugify("sui", "Sui Wallet") // "wallet-standard:sui-sui-wallet"
 * slugify("btc", "Phantom")    // "wallet-standard:btc-phantom"
 */
const slugify = (platformPrefix: string, name: string): string => {
  const slug = name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gv, "-");
  return `wallet-standard:${platformPrefix}-${slug}`;
};

/**
 * Read a Wallet Standard feature off a wallet, returning `undefined`
 * when absent. The caller narrows the unknown payload to the
 * platform-specific feature shape at use sites.
 */
const getFeature = <T>(wallet: WalletStandardWallet, name: string): T | undefined => {
  const feature = wallet.features[name];
  return feature ? (feature as T) : undefined;
};

/**
 * Pick the first address out of a wallet's accounts array, returning
 * `null` when the wallet currently exposes none.
 */
const pickFirstAddress = (accounts: ReadonlyArray<WalletStandardWalletAccount>): string | null => {
  const first = accounts[0];
  return first ? first.address : null;
};

/**
 * Look up a wallet account by address, falling back to the first
 * exposed account when the requested address isn't present.
 *
 * Used by per-call routing in `sendTx` / `signMessage`: callers pass
 * an `account` from `ConnectedWallet.accounts` to sign with a non-
 * active address; the wallet's `accounts[]` is the source of truth.
 */
const pickAccountByAddress = (
  accounts: ReadonlyArray<WalletStandardWalletAccount>,
  address: string,
): WalletStandardWalletAccount | undefined =>
  accounts.find((a) => a.address === address) ?? accounts[0];

// Re-exported so this package's public surface keeps offering the shared
// account builder now that the implementation lives in @usebutr/core
// (next to `Account` and the reducer that relies on its id format).
export { buildAccount } from "@usebutr/core";
export { getFeature, pickAccountByAddress, pickFirstAddress, slugify };
