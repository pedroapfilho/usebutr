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
 * Chrome reads each `<extension-id>.json` at launch and fetches the `.crx`
 * from the Web Store. Google Chrome only: the Chromium build Playwright
 * bundles ignores `external_update_url`, so launch with `channel: 'chrome'`.
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
