import type { WalletExtension } from "./types";

/**
 * Build Chromium launch args that load a set of pre-unpacked wallet
 * extensions. The caller is responsible for fetching each wallet's
 * `.crx` archive from the Web Store (or building unpacked dirs) and
 * passing the resulting absolute paths.
 *
 * The returned flags are suitable for `chromium.launchPersistentContext(
 *   userDataDir, { args }
 * )`. Two flags are emitted in tandem:
 *
 *  - `--disable-extensions-except=…` prevents Chromium from auto-loading
 *    anything outside the supplied list, keeping tests deterministic.
 *  - `--load-extension=…` points at the unpacked extension directories.
 *
 * Extensions are only supported in **persistent contexts**, not the
 * fresh-per-test context Playwright uses by default. Tests must opt into
 * `launchPersistentContext` and accept that storage state is shared
 * across pages within the same browser session.
 *
 * Empty input returns `[]` so callers can unconditionally spread the
 * result into a Playwright `args` array.
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
 * Convenience helper: given a `(wallet) => path | null` resolver, split
 * the registry into the subset that has been unpacked on disk and the
 * subset that hasn't. Pair with `buildLoadExtensionArgs(paths.map(p => p.path))`.
 *
 * The actual `.crx`-fetching step lives outside this package — the
 * registry is the source of truth, the resolver is whatever the test
 * infrastructure uses (a CLI, a fixture, a Docker volume mount).
 */
const partitionResolvedExtensions = (
  wallets: ReadonlyArray<WalletExtension>,
  resolve: (wallet: WalletExtension) => string | null,
): ResolvedPaths => {
  const paths: Array<{ path: string; wallet: WalletExtension }> = [];
  const missing: Array<WalletExtension> = [];
  for (const wallet of wallets) {
    const path = resolve(wallet);
    if (path) {
      paths.push({ path, wallet });
    } else {
      missing.push(wallet);
    }
  }
  return { missing, paths };
};

export type { ResolvedPaths };
export { buildLoadExtensionArgs, partitionResolvedExtensions };
