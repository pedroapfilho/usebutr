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

const hasMethod = <Feature extends object>(
  feature: WalletStandardFeature,
  method: keyof Feature & string,
): feature is WalletStandardFeature & Feature => typeof feature[method] === "function";

/**
 * The spec keys `features` by reverse-DNS name with no fixed shape, so the
 * caller names the feature type and the method that proves it:
 * `getFeature<SolanaSignMessageFeature>(wallet, "solana:signMessage", "signMessage")`.
 */
const getFeature = <Feature extends object>(
  wallet: WalletStandardWallet,
  name: string,
  method: keyof Feature & string,
): (WalletStandardFeature & Feature) | undefined => {
  const feature = wallet.features[name];
  return feature !== undefined && hasMethod<Feature>(feature, method) ? feature : undefined;
};

/** Wallet Standard account for a butr address. `undefined` for an address
 *  the wallet does not expose: never another account in its place. */
const findAccount = (
  accounts: ReadonlyArray<WalletStandardWalletAccount>,
  address: string,
): WalletStandardWalletAccount | undefined => accounts.find((a) => a.address === address);

export { findAccount, getFeature, slugify };
