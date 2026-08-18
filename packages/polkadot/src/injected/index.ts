import type { WalletAdapter } from "@usebutr/core";

import { buildInjectedPolkadotAdapter } from "./adapter";
import type { InjectedWindow } from "./injected-web3";
import { readInjectedWindow } from "./injected-web3";

const knownDisplayNameFor = (key: string): string | undefined => {
  switch (key) {
    case "enkrypt": {
      return "Enkrypt";
    }
    case "nova-wallet": {
      return "Nova Wallet";
    }
    case "polkadot-js": {
      return "Polkadot{.js}";
    }
    case "subwallet-js": {
      return "SubWallet";
    }
    case "talisman": {
      return "Talisman";
    }
    default: {
      return undefined;
    }
  }
};

const displayNameFor = (key: string): string =>
  knownDisplayNameFor(key) ??
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
 * Adapters are built without calling `enable()`, which would raise the
 * extension's authorization prompt at discovery time. Extensions inject at
 * different points during page load, hence the poll schedule.
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
