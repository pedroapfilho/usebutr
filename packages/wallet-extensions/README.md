# @repo/wallet-extensions

Registry + install helpers for the wallet browser extensions butr's
end-to-end tests need.

This package is **infrastructure-only**. It does not download, install,
or launch browsers itself; it gives you (a) a typed registry of the
wallets we care about and (b) two helpers that map the registry into
the two install methods Chromium and Chrome support. The actual
download-and-unpack step plus the Playwright fixtures live in
`tests/e2e/` (still to be wired).

## Wallets covered

| Slug              | Name            | Platforms |
| ----------------- | --------------- | --------- |
| `backpack`        | Backpack        | evm, svm  |
| `binance-wallet`  | Binance Wallet  | evm       |
| `coinbase-wallet` | Coinbase Wallet | evm, svm  |
| `jupiter-wallet`  | Jupiter Wallet  | svm       |
| `metamask`        | MetaMask        | evm       |
| `okx-wallet`      | OKX Wallet      | evm, svm  |
| `phantom`         | Phantom         | evm, svm  |
| `rabby`           | Rabby Wallet    | evm       |
| `solflare`        | Solflare Wallet | svm       |
| `trust-wallet`    | Trust Wallet    | evm, svm  |

Each entry carries a Chrome Web Store ID, a Web Store URL, and the
butr `ChainPlatform`s the wallet serves. Entries marked `TODO_VERIFY`
(Binance Wallet, Jupiter Wallet) need a manual ID lookup before they
can be enrolled: open the URL, copy the 32-character path segment,
and update `registry.ts`.

## Two install strategies

Chrome and Chromium take different paths to "pre-install these
extensions for a browser session." Both helpers ship in this package
so a test can pick the right one for its runner.

### Strategy A: Chrome's external-preferences method

Reference:
[Distribute extensions → Preferences](https://developer.chrome.com/docs/extensions/how-to/distribute/install-extensions#preferences).

Chrome reads a per-profile `External Extensions/<id>.json` manifest and
silently fetches the `.crx` from the Web Store on first launch.

```ts
import { writeExternalExtensionsPrefs, ALL_WALLETS } from "@repo/wallet-extensions";

const userDataDir = "/tmp/playwright-chrome-profile";
const { manifestPaths, skipped } = writeExternalExtensionsPrefs(userDataDir, ALL_WALLETS);

console.log(`Wrote ${manifestPaths.length} manifests; skipped ${skipped.length}.`);
```

Then in Playwright:

```ts
import { chromium } from "@playwright/test";

const context = await chromium.launchPersistentContext(userDataDir, {
  channel: "chrome", // <-- required; Chromium ignores external_update_url
  headless: false, // Chrome's extension UI doesn't render in headless
});
```

**Constraints**

- Requires real Chrome on the host (Chromium does not contact the Web
  Store). On CI, install Chrome alongside Playwright.
- Requires network access to `clients2.google.com/service/update2/crx`.
- Cold-launch is slow on first run because Chrome fetches every
  extension before the test starts.

### Strategy B: Chromium's `--load-extension=` method

Pre-download each `.crx` (a ZIP under the hood), unpack to a known
directory, and pass the path list to Chromium.

```ts
import { chromium } from "@playwright/test";
import {
  ALL_WALLETS,
  buildLoadExtensionArgs,
  partitionResolvedExtensions,
} from "@repo/wallet-extensions";

const { paths, missing } = partitionResolvedExtensions(ALL_WALLETS, (wallet) => {
  // Whatever your fixture uses; `tests/e2e/.cache/<slug>/` is a
  // reasonable convention.
  const candidate = `/path/to/cache/${wallet.slug}`;
  return existsSync(candidate) ? candidate : null;
});

if (missing.length > 0) {
  throw new Error(`Missing unpacked extensions: ${missing.map((w) => w.slug).join(", ")}`);
}

const context = await chromium.launchPersistentContext(userDataDir, {
  args: [...buildLoadExtensionArgs(paths.map((p) => p.path))],
  headless: false,
});
```

**Constraints**

- Works with the Chromium Playwright bundles by default.
- Caller owns the download/unpack step. The simplest implementation is
  a one-off script that fetches each wallet's `.crx` from
  `https://clients2.google.com/service/update2/crx?response=redirect&os=mac&arch=x64&os_arch=x86_64&nacl_arch=x86-64&prod=chromiumcrx&prodchannel=unknown&prodversion=130.0.0.0&acceptformat=crx2,crx3&x=id%3D<EXT_ID>%26uc`
  and `unzip`s it. (We'll add a `fetch-crx` script here when we wire
  the Playwright fixtures.)
- Persistent context only: incognito disables extensions unless they
  opt in.

## Choosing between A and B

|                                 | Strategy A (Preferences)                    | Strategy B (--load-extension)                    |
| ------------------------------- | ------------------------------------------- | ------------------------------------------------ |
| Runner                          | Chrome (channel: 'chrome')                  | Chromium (default Playwright)                    |
| Network at test time            | Yes, every cold launch                      | No, after first fetch                            |
| Determinism (extension version) | Whatever the Web Store serves today         | Pinned to the `.crx` you fetched                 |
| Setup complexity                | Low (write JSON files)                      | Higher (fetch + unpack pipeline)                 |
| CI friendliness                 | Brittle (depends on Web Store reachability) | Strong (cache the unpacked dirs in CI artifacts) |

For local exploration: Strategy A is fine. For CI: Strategy B is what
you want.

## Verifying extension IDs

The Web Store URL for an extension always has the form
`https://chromewebstore.google.com/detail/<slug>/<id>`; the trailing
32-character lowercase string is the ID.

To verify an entry:

1. Open the entry's `webStoreUrl` in `registry.ts`.
2. Copy the last URL segment.
3. Confirm it matches `chromeWebStoreId`.

If you're updating an ID, also update the URL so it points at the new
listing (the URL changes when an extension is delisted and republished).

## What's not here

- Actual `.crx` fetching. Pure data flows through this package; the
  fetcher will be a small Node script under `tests/e2e/scripts/` when
  we wire it.
- Playwright fixtures (`test.extend({ context })`). Those compose this
  package's helpers and belong in `tests/e2e/` alongside the
  test files.
- Wallet seed-phrase automation. Each wallet has its own onboarding
  flow; that's deliberately scoped to a future iteration where we
  decide whether to test wallets in isolation or in combination.
