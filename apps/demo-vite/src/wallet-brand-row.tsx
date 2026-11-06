import type { WalletAdapter } from "@usebutr/core";
import { useConnect } from "@usebutr/react";

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

const WalletBrandRow = ({ brand }: { brand: WalletBrand }) => {
  const { connect, connectingId } = useConnect();

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-3">
        {brand.icon !== undefined && brand.icon !== "" ? (
          <img alt="" className="size-6 rounded" height={24} src={brand.icon} width={24} />
        ) : null}
        <span className="font-medium">{brand.name}</span>
      </span>
      <span className="flex gap-2">
        {brand.adapters.map((adapter) => {
          const isConnecting = connectingId === adapter.id;

          return (
            <button
              aria-busy={isConnecting}
              aria-label={`${brand.name} (${adapter.chainPlatform})`}
              className="hover:border-brand hover:bg-brand/10 hover:text-brand-accent border-border-strong min-h-11 rounded-md border px-2 py-1 font-mono text-xs uppercase transition-colors disabled:opacity-50 motion-reduce:transition-none"
              disabled={isConnecting}
              key={adapter.id}
              onClick={() => {
                connect(adapter.id);
              }}
              type="button"
            >
              {adapter.chainPlatform}
            </button>
          );
        })}
      </span>
    </div>
  );
};

export { groupByBrand, WalletBrandRow };
