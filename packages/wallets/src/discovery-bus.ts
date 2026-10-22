import type { ChainPlatform, WalletAdapter } from "@usebutr/core";

/**
 * Most wallets announce within the first frame once the primary channels
 * listen; 150ms leaves room for slow ones without stalling the picker.
 */
const SETTLE_MS = 150;

type Lane = "anonymousFallback" | "fallback" | "primary";

/**
 * Case, punctuation, a parenthesised suffix and the word "wallet" are
 * ignored, so "OKX Wallet (Bitcoin)" on one channel matches "OKX Wallet" on
 * another.
 */
const walletKey = ({ chainPlatform, name }: WalletAdapter): string =>
  `${chainPlatform}:${name.toLowerCase().replaceAll(/\(.*\)|\bwallet\b|[^a-z\d]/gv, "")}`;

type DiscoveryBus = Readonly<Record<Lane, (adapter: WalletAdapter) => void>> & {
  /** Opens the settle window. Call once every primary channel has read the
   *  wallets already present. */
  ready: () => void;
  /** Drops the fallbacks still held. */
  stop: () => void;
};

/**
 * Primary adapters list as announced. Fallbacks wait for the settle window and
 * list unless the same wallet did; anonymous ones only when the platform is empty.
 */
const createDiscoveryBus = (onAdapter: (adapter: WalletAdapter) => void): DiscoveryBus => {
  const ids = new Set<string>();
  const platforms = new Set<ChainPlatform>();
  const primaryWallets = new Set<string>();
  const fallbackWallets = new Set<string>();
  let held: Array<() => void> | null = [];
  let timer: ReturnType<typeof setTimeout> | undefined;

  const list = (adapter: WalletAdapter) => {
    ids.add(adapter.id);
    platforms.add(adapter.chainPlatform);
    onAdapter(adapter);
  };

  const afterSettle =
    (lane: (adapter: WalletAdapter) => void) =>
    (adapter: WalletAdapter): void => {
      if (held === null) {
        lane(adapter);
      } else {
        held.push(() => {
          lane(adapter);
        });
      }
    };

  return {
    anonymousFallback: afterSettle((adapter) => {
      if (!ids.has(adapter.id) && !platforms.has(adapter.chainPlatform)) {
        list(adapter);
      }
    }),
    fallback: afterSettle((adapter) => {
      const key = walletKey(adapter);

      if (!ids.has(adapter.id) && !primaryWallets.has(key) && !fallbackWallets.has(key)) {
        fallbackWallets.add(key);
        list(adapter);
      }
    }),
    primary: (adapter) => {
      const key = walletKey(adapter);

      if (!ids.has(adapter.id) && !fallbackWallets.has(key)) {
        primaryWallets.add(key);
        list(adapter);
      }
    },
    ready: () => {
      timer ??= setTimeout(() => {
        const queue = held ?? [];
        held = null;

        for (const run of queue) {
          run();
        }
      }, SETTLE_MS);
    },
    stop: () => {
      clearTimeout(timer);
    },
  };
};

export type { Lane };

export { SETTLE_MS, createDiscoveryBus };
