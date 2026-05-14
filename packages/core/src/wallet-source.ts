import type { WalletAdapter } from "./types";

/**
 * A discovery seam. Implementations call `onAdapter(adapter)` each time
 * they find a wallet and return an unsubscribe handle. `@butr/wallets`
 * composes EVM + SVM into a single `WalletSource`; third parties can
 * implement this type without depending on `@butr/wallets`.
 */
type WalletSource = {
  subscribe(onAdapter: (adapter: WalletAdapter) => void): () => void;
};

export type { WalletSource };
