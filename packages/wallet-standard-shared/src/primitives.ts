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
 * when absent. `features` is a reverse-DNS-keyed registry typed
 * `Record<string, unknown>` by the spec, so the caller declares the
 * concrete feature shape it expects; this accessor is the single
 * boundary where that dynamism is acknowledged. The `T` parameter is
 * intentionally caller-supplied (not inferable) and the assertion is
 * unavoidable for an untyped registry.
 */
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- caller-supplied feature shape; not inferable from args
const getFeature = <T>(wallet: WalletStandardWallet, name: string): T | undefined => {
  const feature: unknown = wallet.features[name];
  if (typeof feature !== "object" || feature === null) {
    return undefined;
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- untyped Wallet Standard feature registry; caller declares the shape
  return feature as T;
};

/**
 * Pick the first address out of a wallet's accounts array, returning
 * `null` when the wallet currently exposes none.
 */
const pickFirstAddress = (accounts: ReadonlyArray<WalletStandardWalletAccount>): string | null => {
  const first = accounts[0];
  return first === undefined ? null : first.address;
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
