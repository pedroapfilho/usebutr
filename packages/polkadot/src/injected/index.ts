import type { WalletAdapter } from "@usebutr/core";

import { buildInjectedPolkadotAdapter } from "./adapter";
import type { InjectedWindow } from "./injected-web3";
import { readInjectedWindow } from "./injected-web3";

// Display-name overrides for known registry keys. Unknown keys fall back
// to a title-cased version of the key.
const KNOWN_NAMES: Readonly<Record<string, string>> = {
  enkrypt: "Enkrypt",
  "nova-wallet": "Nova Wallet",
  "polkadot-js": "Polkadot{.js}",
  "subwallet-js": "SubWallet",
  talisman: "Talisman",
};

const displayNameFor = (key: string): string =>
  KNOWN_NAMES[key] ??
  key
    .split(/[\-_]/v)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

type InjectedPolkadotDiscoveryOptions = {
  /** Poll schedule (ms offsets) for late-injecting extensions. Defaults
   *  to a few short polls; pass `[]` in tests for a single sync read. */
  pollMs?: ReadonlyArray<number>;
  /** Override the global host (tests, iframes). */
  target?: InjectedWindow | null;
};

const DEFAULT_POLLS: ReadonlyArray<number> = [250, 750];

/**
 * Primary Polkadot discovery: enumerate `window.injectedWeb3` keys and
 * emit one `PolkadotAdapter` per extension. Adapters are built WITHOUT
 * calling `enable()` (no prompt at discovery time); `connect()` enables
 * lazily.
 *
 * Extensions inject at different times during page load, so we read
 * immediately and re-check on a short poll schedule, deduping by key.
 */
const discoverInjectedPolkadotAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
  options: InjectedPolkadotDiscoveryOptions = {},
): (() => void) => {
  const polls = options.pollMs ?? DEFAULT_POLLS;
  const seen = new Set<string>();
  const timers: Array<ReturnType<typeof setTimeout>> = [];
  let cancelled = false;

  const scan = () => {
    if (cancelled) {
      return;
    }
    const host = readInjectedWindow(options.target);
    const registry = host?.injectedWeb3;
    if (!registry) {
      return;
    }
    for (const [key, provider] of Object.entries(registry)) {
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      onAdapter(buildInjectedPolkadotAdapter(key, displayNameFor(key), provider));
    }
  };

  // Always do one synchronous read so tests (and fast extensions) don't
  // wait for a timer.
  scan();
  for (const offset of polls) {
    if (offset === 0) {
      continue;
    }
    timers.push(setTimeout(scan, offset));
  }

  return () => {
    cancelled = true;
    for (const timer of timers) {
      clearTimeout(timer);
    }
  };
};

export type { InjectedPolkadotDiscoveryOptions };
export { discoverInjectedPolkadotAdapters };
