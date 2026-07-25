/**
 * WalletConnectDialog: recommended modal connect pattern for apps that
 * want a dialog overlay UX rather than an inline list.
 *
 * Uses the native <dialog> element via `dialog.showModal()` for built-in:
 *   - focus trap (browser-native)
 *   - Escape-to-close (browser-native: `onClose` on the <dialog> syncs
 *     React state back when that happens)
 *   - aria-modal semantics
 *   - top-layer stacking (no z-index wars)
 *
 * `closedby="any"` (Chrome 133+) lets clicking the backdrop close the dialog.
 * The ::backdrop click handler provides a fallback for older browsers.
 *
 * Copy this component into your app and style it to match your design system.
 */
import type { WalletAdapter } from "@usebutr/core";
import { useConnectWallet, useConnectingConnectorId } from "@usebutr/react";
import { useEffect, useRef } from "react";

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
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-3">
        {brand.icon !== undefined && brand.icon !== "" ? (
          <img alt="" className="h-6 w-6 rounded" height={24} src={brand.icon} width={24} />
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

const WalletConnectDialog = ({
  available,
  onClose,
  open,
}: {
  available: ReadonlyArray<WalletAdapter>;
  onClose: () => void;
  open: boolean;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const connect = useConnectWallet();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const brands = groupByBrand(available);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, react-doctor/no-noninteractive-element-interactions
    <dialog
      aria-label="Connect wallet"
      aria-modal="true"
      className="m-auto w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-0 shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm open:flex open:flex-col"
      onClick={handleBackdropClick}
      onClose={onClose}
      ref={dialogRef}
    >
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <h2 className="font-semibold">Connect a wallet</h2>
        <button
          aria-label="Close dialog"
          className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
      </div>
      <ul className="divide-y divide-neutral-100">
        {brands.map((brand) => (
          <li key={brand.name}>
            <div className="px-4 py-3">
              <WalletBrandRow
                brand={brand}
                connect={(id) => {
                  void connect(id);
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </dialog>
  );
};

export { WalletConnectDialog };
