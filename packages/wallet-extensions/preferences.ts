import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { WalletExtension } from "./types";

const WEB_STORE_UPDATE_URL = "https://clients2.google.com/service/update2/crx";

type WriteResult = {
  /** Absolute paths to every manifest file written. */
  manifestPaths: ReadonlyArray<string>;
  /** Wallets that were skipped because they had no `chromeWebStoreId`
   *  yet (TODO_VERIFY entries in the registry). */
  skipped: ReadonlyArray<WalletExtension>;
};

/**
 * Write Chrome's "External Extensions" preferences manifests into a user
 * data directory. On launch, Chrome reads each `<extension-id>.json`,
 * resolves the bundled `external_update_url`, and silently fetches the
 * `.crx` from the Web Store.
 *
 * Background:
 * https://developer.chrome.com/docs/extensions/how-to/distribute/install-extensions#preferences
 *
 * IMPORTANT: this method only works with **Google Chrome**. Chromium —
 * which Playwright bundles by default — does not honour
 * `external_update_url` pointing at `clients2.google.com`. To exercise
 * this strategy from Playwright, launch with `channel: 'chrome'`. For
 * Chromium-based runs, use the alternative `buildLoadExtensionArgs`
 * helper in `./playwright` (which expects pre-fetched, unpacked
 * extension directories).
 *
 * @param userDataDir  Absolute path to the Chrome user-data directory
 *                     Playwright will hand to `launchPersistentContext`.
 * @param wallets      Wallets to enroll. Entries with an empty
 *                     `chromeWebStoreId` are silently skipped (and
 *                     reported via `result.skipped`) so partially-filled
 *                     registries don't block the rest.
 */
const writeExternalExtensionsPrefs = async (
  userDataDir: string,
  wallets: ReadonlyArray<WalletExtension>,
): Promise<WriteResult> => {
  const dir = join(userDataDir, "External Extensions");
  await mkdir(dir, { recursive: true });

  const manifestPaths: Array<string> = [];
  const skipped: Array<WalletExtension> = [];
  const writes: Array<Promise<void>> = [];

  for (const wallet of wallets) {
    if (!wallet.chromeWebStoreId) {
      skipped.push(wallet);
      continue;
    }
    const manifestPath = join(dir, `${wallet.chromeWebStoreId}.json`);
    writes.push(
      writeFile(manifestPath, JSON.stringify({ external_update_url: WEB_STORE_UPDATE_URL })),
    );
    manifestPaths.push(manifestPath);
  }
  await Promise.all(writes);

  return { manifestPaths, skipped };
};

export type { WriteResult };
export { WEB_STORE_UPDATE_URL, writeExternalExtensionsPrefs };
