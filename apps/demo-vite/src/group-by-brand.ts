import type { WalletAdapter } from "@usebutr/core";

type WalletBrand = {
  adapters: Array<WalletAdapter>;
  icon: string | undefined;
  name: string;
};

const groupByBrand = (wallets: ReadonlyArray<WalletAdapter>): Array<WalletBrand> => {
  const byName = new Map<string, WalletBrand>();

  for (const wallet of wallets) {
    const key = wallet.name.toLowerCase();
    const existing = byName.get(key);

    if (existing) {
      existing.adapters.push(wallet);
      existing.icon ??= wallet.icon;
    } else {
      byName.set(key, { adapters: [wallet], icon: wallet.icon, name: wallet.name });
    }
  }

  return [...byName.values()];
};

export { groupByBrand };

export type { WalletBrand };
