"use client";

import type { DiscoveredWallet } from "@/lib/use-eip6963";
import { useEip6963Wallets } from "@/lib/use-eip6963";
import { useHydrated } from "@/lib/use-hydrated";

const CELL_COUNT = 8;
const HOLES = [0, 1, 2, 3];

const captionFor = (hydrated: boolean, wallets: Array<DiscoveredWallet>) => {
  if (!hydrated || wallets.length === 0) {
    return "Listening for wallets in this browser — via EIP-6963";
  }

  const names = wallets.map((wallet) => wallet.info.name).join(" · ");
  const plural = wallets.length === 1 ? "wallet" : "wallets";

  return `${wallets.length} ${plural} announced: ${names}`;
};

/**
 * The pierced discovery strip: eight square cells, idle pierced open. Each
 * wallet the browser announces (EIP-6963) fills one cell solid black — the
 * Hoffmann active-cell grammar carrying the product's live mechanism.
 */
const DiscoveryLattice = () => {
  const wallets = useEip6963Wallets();
  const hydrated = useHydrated();

  return (
    <figure>
      <div aria-hidden className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
        {Array.from({ length: CELL_COUNT }, (unusedCell, cell) => {
          const wallet = wallets[cell];

          if (wallet === undefined) {
            return (
              <span
                className="border-foreground flex size-9 items-center justify-center border sm:size-12"
                // A fixed strip of positional cells.
                // eslint-disable-next-line react/no-array-index-key
                key={cell}
              >
                <span className="grid grid-cols-2 gap-1">
                  {HOLES.map((hole) => (
                    <span className="border-foreground/50 size-1.5 border" key={hole} />
                  ))}
                </span>
              </span>
            );
          }

          return (
            <span
              className="border-foreground flex size-9 items-center justify-center border sm:size-12"
              key={wallet.info.rdns}
            >
              <span className="lattice-fill bg-foreground text-background lattice-display flex size-full items-center justify-center text-lg">
                {wallet.info.name.charAt(0).toUpperCase()}
              </span>
            </span>
          );
        })}
      </div>
      <figcaption aria-live="polite" className="text-muted-foreground mt-4 text-center text-sm">
        {captionFor(hydrated, wallets)}
      </figcaption>
    </figure>
  );
};

export { DiscoveryLattice };
