import type { ConnectedWallet } from "./types";

/**
 * Two wallet snapshots are equivalent for selector purposes iff they
 * share connectorId, active account address, and active account chain
 * id. Used by `useStoreWithEqualityFn` consumers (active-wallet,
 * selected-wallet, useWalletEntry) to suppress spurious re-renders
 * when the underlying Map churns but the resolved entry hasn't changed.
 *
 * Hoisted to its own module so the equivalence rule lives in one place;
 * if we ever extend the snapshot (e.g. to consider `accounts.length`),
 * every selector hook picks up the new rule for free.
 */
const walletEqual = (a: ConnectedWallet | undefined, b: ConnectedWallet | undefined): boolean => {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return (
    a.connector.id === b.connector.id &&
    a.account.walletAddress === b.account.walletAddress &&
    a.account.chain.id === b.account.chain.id
  );
};

export { walletEqual };
