import type { WalletStandardWallet, WalletStandardWalletAccount } from "./types";

/**
 * The platform prefix scopes the id so one multi-chain wallet (Phantom
 * SVM, Sui, BTC) yields distinct adapters on the shared `getWallets()` bus.
 */
const slugify = (platformPrefix: string, name: string): string => {
  const slug = name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gv, "-");
  return `wallet-standard:${platformPrefix}-${slug}`;
};

/**
 * The spec types `features` as a reverse-DNS-keyed `Record<string,
 * unknown>`, so the caller declares the shape it expects. This accessor is
 * the single boundary where that dynamism is acknowledged.
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

const pickFirstAddress = (accounts: ReadonlyArray<WalletStandardWalletAccount>): string | null => {
  const first = accounts[0];
  return first === undefined ? null : first.address;
};

/**
 * Per-call routing for `sendTx` / `signMessage`: callers pass an `account`
 * from `ConnectedWallet.accounts` to sign with a non-active address, but
 * the wallet's own `accounts[]` stays the source of truth.
 */
const pickAccountByAddress = (
  accounts: ReadonlyArray<WalletStandardWalletAccount>,
  address: string,
): WalletStandardWalletAccount | undefined =>
  accounts.find((a) => a.address === address) ?? accounts[0];

export { buildAccount } from "@usebutr/core";
export { getFeature, pickAccountByAddress, pickFirstAddress, slugify };
