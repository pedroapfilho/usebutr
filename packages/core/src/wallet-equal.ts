import type { ConnectedWallet } from "./types";

/**
 * The adapter is compared by reference, not `connector.id`: hydration
 * swaps a shadow adapter for the live one under an unchanged id, and an
 * id check would strand consumers on the throwing placeholder.
 */
const walletEqual = (a: ConnectedWallet | undefined, b: ConnectedWallet | undefined): boolean => {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return (
    a.connector === b.connector &&
    a.account.walletAddress === b.account.walletAddress &&
    a.account.chain.id === b.account.chain.id
  );
};

export { walletEqual };
