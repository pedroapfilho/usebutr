import type { WalletSource } from "@usebutr/core";

import { buildInjectedPolkadotAdapter } from "./adapter";

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

/** Extensions inject at different points during page load, so discovery
 *  reads `window.injectedWeb3` now and again after these delays (ms). */
const RESCAN_DELAYS: ReadonlyArray<number> = [250, 750];

/**
 * Adapters are built without calling `enable()`, which would raise the
 * extension's authorization prompt at discovery time.
 */
const discoverInjectedPolkadotAdapters: WalletSource = (onAdapter) => {
  const seen = new Set<string>();
  let cancelled = false;

  const scan = () => {
    if (cancelled) {
      return;
    }

    const registry = typeof window === "undefined" ? undefined : window.injectedWeb3;

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
  const timers = RESCAN_DELAYS.map((delay) => setTimeout(scan, delay));

  return () => {
    cancelled = true;

    for (const timer of timers) {
      clearTimeout(timer);
    }
  };
};

export { discoverInjectedPolkadotAdapters };
