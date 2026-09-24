import { logWarn } from "./logger";
import type { MaybePromise } from "./storage/persistence";
import type { WalletAdapter } from "./types/wallet";

/**
 * The discovery seam: a function that announces adapters and returns its
 * unsubscribe. Every `discover*Adapters` export already has this shape, so
 * it goes into `sources` as-is.
 */
type WalletSource = (onAdapter: (adapter: WalletAdapter) => void) => () => void;

const isIterable = (
  value: WalletAdapter | Iterable<WalletAdapter>,
): value is Iterable<WalletAdapter> => Symbol.iterator in value;

/**
 * For adapters that are built rather than discovered: WalletConnect, Ledger,
 * hand-rolled ones. Takes one adapter or several, or a promise of either; a
 * rejected promise is logged and contributes nothing.
 */
const fromAdapters =
  (adapters: MaybePromise<WalletAdapter | Iterable<WalletAdapter>>): WalletSource =>
  (onAdapter) => {
    let active = true;
    void (async () => {
      try {
        const resolved = await adapters;
        for (const adapter of isIterable(resolved) ? resolved : [resolved]) {
          if (!active) {
            return;
          }
          onAdapter(adapter);
        }
      } catch (error) {
        logWarn("[butr] fromAdapters: adapters failed to load:", error);
      }
    })();
    return () => {
      active = false;
    };
  };

export type { WalletSource };
export { fromAdapters };
