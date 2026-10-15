import type { WalletExtension } from "./types";

/**
 * Chromium loads extensions only in a persistent context, so tests must use
 * `launchPersistentContext` and accept storage state shared across pages.
 * `--disable-extensions-except` blocks anything outside the supplied paths.
 */
const buildLoadExtensionArgs = (extensionPaths: ReadonlyArray<string>): ReadonlyArray<string> => {
  if (extensionPaths.length === 0) {
    return [];
  }
  const joined = extensionPaths.join(",");
  return [`--disable-extensions-except=${joined}`, `--load-extension=${joined}`];
};

type ResolvedPaths = {
  /** Wallets the caller skipped (for example because their `.crx` had
   *  not been fetched yet). Exposed so test setup can fail loudly when
   *  a wallet was expected but isn't available. */
  missing: ReadonlyArray<WalletExtension>;
  /** Path → wallet, in input order. Only contains entries that resolved
   *  to a real directory (resolved by the caller). */
  paths: ReadonlyArray<{ path: string; wallet: WalletExtension }>;
};

/**
 * The `.crx`-fetching step lives outside this package: the registry is the
 * source of truth and the resolver is whatever the test infrastructure uses
 * (a CLI, a fixture, a Docker volume mount).
 */
const partitionResolvedExtensions = (
  wallets: ReadonlyArray<WalletExtension>,
  resolve: (wallet: WalletExtension) => string | null,
): ResolvedPaths => {
  const paths: Array<{ path: string; wallet: WalletExtension }> = [];
  const missing: Array<WalletExtension> = [];
  for (const wallet of wallets) {
    const path = resolve(wallet);
    if (path !== null && path !== "") {
      paths.push({ path, wallet });
    } else {
      missing.push(wallet);
    }
  }
  return { missing, paths };
};

export type { ResolvedPaths };
export { buildLoadExtensionArgs, partitionResolvedExtensions };
