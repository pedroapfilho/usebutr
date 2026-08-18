import type { WalletSigner } from "@usebutr/core";

import type {
  WalletStandardFeature,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "./types";

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
type FeatureGuard<Feature> = (
  feature: WalletStandardFeature,
) => feature is WalletStandardFeature & Feature;

const getFeature = <Feature>(
  wallet: WalletStandardWallet,
  name: string,
  isFeature: FeatureGuard<Feature>,
): (WalletStandardFeature & Feature) | undefined => {
  const feature = wallet.features[name];
  if (feature === undefined || !isFeature(feature)) {
    return undefined;
  }
  return feature;
};

const isWalletStandardWallet = (value: WalletSigner): value is WalletStandardWallet =>
  "accounts" in value &&
  Array.isArray(value.accounts) &&
  "chains" in value &&
  Array.isArray(value.chains) &&
  "features" in value &&
  typeof value.features === "object" &&
  value.features !== null &&
  "icon" in value &&
  typeof value.icon === "string" &&
  "name" in value &&
  typeof value.name === "string" &&
  "version" in value &&
  typeof value.version === "string";

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
export { getFeature, isWalletStandardWallet, pickAccountByAddress, pickFirstAddress, slugify };
