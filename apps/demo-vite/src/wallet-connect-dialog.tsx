import type { WalletAdapter } from "@usebutr/core";

import { groupByBrand } from "./group-by-brand";
import { useModalDialog } from "./use-modal-dialog";
import { WalletBrandRow } from "./wallet-brand-row";

const WalletConnectDialog = ({
  available,
  onClose,
  open,
}: {
  available: ReadonlyArray<WalletAdapter>;
  onClose: () => void;
  open: boolean;
}) => {
  const dialogRef = useModalDialog(open);

  const brands = groupByBrand(available);

  return (
    <dialog
      aria-label="Connect wallet"
      aria-modal="true"
      className="border-border-default bg-surface-base m-auto w-full max-w-sm rounded-xl border p-0 shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm open:flex open:flex-col"
      closedby="any"
      onClose={onClose}
      ref={dialogRef}
    >
      <div className="border-border-faint flex items-center justify-between border-b px-5 py-4">
        <h2 className="font-semibold">Connect a wallet</h2>
        <button
          aria-label="Close dialog"
          className="text-foreground-disabled hover:bg-surface-muted hover:text-foreground-secondary rounded p-1"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
      </div>
      <ul className="divide-divider divide-y">
        {brands.map((brand) => (
          <li key={brand.name}>
            <div className="px-4 py-3">
              <WalletBrandRow brand={brand} />
            </div>
          </li>
        ))}
      </ul>
    </dialog>
  );
};

export { WalletConnectDialog };
