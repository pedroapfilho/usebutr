import type {
  Account,
  ChainPlatform,
  ConnectedWallet,
  Connector,
  WalletManagerConfig,
} from "../types";
import type { WalletPersistence } from "../storage";

/**
 * Pick the right `accounts` list for a hydrated wallet entry: prefer fresh
 * data from `connector.getAccounts()`, otherwise fall back to whatever was
 * persisted, otherwise just the active account. Extracted so the hydration
 * loop can stay readable (and to avoid nested ternaries).
 */
const resolveHydratedAccounts = async (
  connector: Connector,
  storedAccounts: ReadonlyArray<Account>,
  fallbackAccount: Account,
): Promise<Array<Account>> => {
  if (connector.getAccounts) {
    const fresh = await connector.getAccounts().catch(() => null);
    if (fresh && fresh.length > 0) {
      return fresh;
    }
  }
  if (storedAccounts.length > 0) {
    return [...storedAccounts];
  }
  return [fallbackAccount];
};

type HydrateResult = {
  activeConnectorId: string | null;
  isUserDisconnected: boolean;
  pool: Map<string, ConnectedWallet>;
  selection: Map<ChainPlatform, string>;
};

const logStorageError = (context: string) => (error: unknown) => {
  console.warn(`[butr] ${context}:`, error);
};

/** Run an async operation fire-and-forget, calling onError if it throws. */
const run = async (fn: () => Promise<void>, onError: (e: unknown) => void): Promise<void> => {
  try {
    await fn();
  } catch (error) {
    onError(error);
  }
};

const isProduction = (): boolean => {
  try {
    const proc = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process;
    return proc?.env?.NODE_ENV === "production";
  } catch {
    return false;
  }
};

/** Restores persisted wallets (pool + selection + active) from storage.
 *  Drops entries whose connector cannot be re-instantiated or fails to connect. */
const hydrateFromStorage = async (
  storage: WalletPersistence,
  createConnector: WalletManagerConfig["createConnector"],
): Promise<HydrateResult> => {
  const [storedPool, storedSelection, storedActive, userDisconnected] = await Promise.all([
    storage.getPool(),
    storage.getSelection(),
    storage.getActiveConnectorId(),
    storage.isUserDisconnected(),
  ]);

  const pool = new Map<string, ConnectedWallet>();

  for (const [connectorId, entry] of Object.entries(storedPool)) {
    if (!entry) {
      continue;
    }
    const connector = createConnector(connectorId);
    if (!connector) {
      console.warn(`[butr] could not instantiate connector ${connectorId}`);
      continue;
    }
    try {
      // oxlint-disable-next-line no-await-in-loop -- wallets must restore sequentially; each may fail independently
      await connector.connect();
      // oxlint-disable-next-line no-await-in-loop -- wallets must restore sequentially; each may fail independently
      const freshAccount = await connector.getAccount();
      const accountToUse = freshAccount || entry.account;
      // Pull the full known-accounts list when the connector supports it,
      // otherwise fall back to the stored list (or the active account alone).
      // oxlint-disable-next-line no-await-in-loop -- wallets must restore sequentially; each may fail independently
      const accounts = await resolveHydratedAccounts(connector, entry.accounts, accountToUse);
      pool.set(connectorId, {
        account: accountToUse,
        accounts,
        connector,
      });
    } catch (error) {
      console.warn(`[butr] failed to restore connector ${connectorId}:`, error);
      // oxlint-disable-next-line no-await-in-loop -- wallets must restore sequentially; each may fail independently
      await storage
        .removePoolEntry(connectorId)
        .catch(logStorageError("failed to remove broken entry"));
    }
  }

  // Reconcile selection: drop stale entries.
  const selection = new Map<ChainPlatform, string>();
  for (const [platform, connectorId] of Object.entries(storedSelection)) {
    if (connectorId && pool.has(connectorId)) {
      selection.set(platform as ChainPlatform, connectorId);
    }
  }
  // For platforms with a wallet in the pool but no stored selection, pick any.
  for (const [connectorId, wallet] of pool) {
    const platform = wallet.connector.chainPlatform;
    if (!selection.has(platform)) {
      selection.set(platform, connectorId);
    }
  }

  // Reconcile active connector: must point to a wallet in the pool, otherwise pick any.
  let activeConnectorId: string | null = null;
  if (storedActive && pool.has(storedActive)) {
    activeConnectorId = storedActive;
  } else if (pool.size > 0) {
    activeConnectorId = pool.keys().next().value ?? null;
  }

  return {
    activeConnectorId,
    isUserDisconnected: userDisconnected,
    pool,
    selection,
  };
};

export type { HydrateResult };
export { hydrateFromStorage, isProduction, logStorageError, run };
