import type { Account, ConnectedWallet } from "./types";

/** Account ids are canonical (`buildAccount`), so identity is the id. */
const accountsEqual = (a: ReadonlyArray<Account>, b: ReadonlyArray<Account>): boolean =>
  a === b || (a.length === b.length && a.every((account, i) => account.id === b[i]?.id));

/**
 * The adapter is compared by reference, not `connector.id`: hydration
 * swaps a shadow adapter for the live one under an unchanged id, and an
 * id check would strand consumers on the placeholder.
 */
const walletEqual = (a: ConnectedWallet | undefined, b: ConnectedWallet | undefined): boolean =>
  a === b ||
  (a !== undefined &&
    b !== undefined &&
    a.connector === b.connector &&
    a.account.id === b.account.id &&
    accountsEqual(a.accounts, b.accounts));

export { accountsEqual, walletEqual };
