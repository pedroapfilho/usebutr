import type { WalletAdapter } from "@usebutr/core";
import { useConnectWallet, useConnectingConnectorId } from "@usebutr/react";

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

const WalletBrandRow = ({
  brand,
  connect,
}: {
  brand: WalletBrand;
  connect: (id: string) => void;
}) => {
  const connectingId = useConnectingConnectorId();
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          {brand.icon ? (
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
                className="min-h-[44px] rounded-md border border-neutral-300 px-2 py-1 font-mono text-xs uppercase hover:bg-neutral-50 disabled:opacity-50"
                disabled={isConnecting}
                key={adapter.id}
                onClick={() => connect(adapter.id)}
                type="button"
              >
                {adapter.chainPlatform}
              </button>
            );
          })}
        </span>
      </div>
    </div>
  );
};

const WalletPicker = ({
  available,
  hasConnected,
}: {
  available: ReadonlyArray<WalletAdapter>;
  hasConnected: boolean;
}) => {
  const connect = useConnectWallet();

  if (available.length === 0 && !hasConnected) {
    return (
      <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="font-semibold">No wallets detected</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Install a browser wallet to get started. Try{" "}
          <a
            className="text-blue-600 underline"
            href="https://metamask.io/download"
            rel="noopener noreferrer"
            target="_blank"
          >
            MetaMask
          </a>{" "}
          (EVM) or{" "}
          <a
            className="text-blue-600 underline"
            href="https://phantom.app/download"
            rel="noopener noreferrer"
            target="_blank"
          >
            Phantom
          </a>{" "}
          (Solana).
        </p>
      </section>
    );
  }
  if (available.length === 0) {
    return null;
  }

  const brands = groupByBrand(available);

  return (
    <section>
      <h2 className="mb-3 font-semibold">
        {hasConnected ? "Connect another" : "Available wallets"}
      </h2>
      <ul className="space-y-2">
        {brands.map((brand) => (
          <li key={brand.name}>
            <WalletBrandRow brand={brand} connect={connect} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export { WalletPicker };
