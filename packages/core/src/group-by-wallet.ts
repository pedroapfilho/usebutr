import type { WalletAdapter } from "./types/wallet";

/** Every adapter of one wallet, one per platform it speaks. `name` and
 *  `icon` come from the first adapter that carries them. */
type WalletGroup = {
  adapters: Array<WalletAdapter>;
  icon: string | undefined;
  name: string;
  walletKey: string;
};

/**
 * A multi-chain wallet announces one adapter per platform; this lists each
 * wallet once, in announcement order, by the `walletKey` its adapters share.
 */
const groupByWallet = (adapters: ReadonlyArray<WalletAdapter>): Array<WalletGroup> => {
  const groups = new Map<string, WalletGroup>();

  for (const adapter of adapters) {
    const group = groups.get(adapter.walletKey);

    if (group === undefined) {
      groups.set(adapter.walletKey, {
        adapters: [adapter],
        icon: adapter.icon,
        name: adapter.name,
        walletKey: adapter.walletKey,
      });
    } else {
      group.adapters.push(adapter);
      group.icon ??= adapter.icon;
    }
  }

  return [...groups.values()];
};

export type { WalletGroup };

export { groupByWallet };
