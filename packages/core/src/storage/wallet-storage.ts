import { logWarn } from "../logger";
import { CHAIN_PLATFORMS } from "../types";
import type { ChainPlatform, ConnectedWallet } from "../types";

import { createBrowserStorageDriver } from "./browser-storage-driver";
import type {
  StorageDriver,
  StoredPoolEntry,
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletPersistence,
} from "./persistence";

const VALID_CHAIN_PLATFORMS = new Set<ChainPlatform>(CHAIN_PLATFORMS);

type StorageConfig = {
  keyPrefix: string;
  /** Survives app restart. Defaults to localStorage on web. */
  persistent?: StorageDriver;
  /** Cleared on session end. Defaults to sessionStorage on web. */
  session?: StorageDriver;
};

const isValidAccount = (value: unknown): boolean => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const account = value as Record<string, unknown>;
  if (typeof account.walletAddress !== "string" || typeof account.id !== "string") {
    return false;
  }
  if (!account.chain || typeof account.chain !== "object") {
    return false;
  }
  return true;
};

/**
 * Structural validator for a serialized pool entry.
 *
 * Used in two directions:
 *  - On read (`getPool`): malformed entries from storage are warned
 *    and dropped; legacy / cross-tab corruption shouldn't crash the
 *    consumer.
 *  - On write (`setPool`): the runtime's reducer state is the source
 *    of truth, and a malformed write would indicate a programming
 *    error inside butr. Throw rather than silently corrupt storage.
 *
 * Same validator either way; keeping the two paths symmetric means
 * "what's storable" is a single fact.
 */
const isValidPoolEntry = (key: string, value: unknown): value is StoredPoolEntry => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const entry = value as Record<string, unknown>;
  if (typeof entry.connectorId !== "string" || entry.connectorId !== key) {
    return false;
  }
  if (typeof entry.chainPlatform !== "string") {
    return false;
  }
  if (!VALID_CHAIN_PLATFORMS.has(entry.chainPlatform as ChainPlatform)) {
    return false;
  }
  if (typeof entry.name !== "string" || entry.name.length === 0) {
    return false;
  }
  if (entry.icon !== undefined && typeof entry.icon !== "string") {
    return false;
  }
  if (!isValidAccount(entry.account)) {
    return false;
  }
  if (!Array.isArray(entry.accounts) || !entry.accounts.every(isValidAccount)) {
    return false;
  }
  return true;
};

class WalletStorage implements WalletPersistence {
  private poolKey: string;
  private selectionKey: string;
  private activeKey: string;
  private userDisconnectedKey: string;
  private persistent: StorageDriver;
  private session: StorageDriver;
  /**
   * Serializes pool-key mutations so concurrent fire-and-forget
   * writes can't interleave their read-modify-write phases. Without
   * this, two simultaneous `setPool` calls both read the pre-write
   * state, each merge their own entries, and whichever finishes last
   * overwrites the other's additions. Reads (`getPool`) don't enter
   * the queue; they observe whatever's currently in the driver.
   */
  private poolMutationQueue: Promise<unknown> = Promise.resolve();

  constructor(config: StorageConfig) {
    this.poolKey = `${config.keyPrefix}-pool`;
    this.selectionKey = `${config.keyPrefix}-selection`;
    this.activeKey = `${config.keyPrefix}-active`;
    this.userDisconnectedKey = `${config.keyPrefix}-user-disconnected`;

    if (config.persistent && config.session) {
      this.persistent = config.persistent;
      this.session = config.session;
    } else {
      const defaults = createBrowserStorageDriver();
      this.persistent = config.persistent ?? defaults.persistent;
      this.session = config.session ?? defaults.session;
    }
  }

  /** Chain `fn` after the in-flight pool mutation. */
  private async serializePoolMutation<T>(fn: () => Promise<T>): Promise<T> {
    // Capture and advance the queue synchronously so concurrent
    // callers serialize against the same head; awaiting the queue
    const previous = this.poolMutationQueue;
    // oxlint-disable-next-line unicorn/consistent-function-scoping -- assigned by Promise constructor below
    let resolve: () => void = () => {};
    this.poolMutationQueue = new Promise<void>((r) => {
      resolve = r;
    });
    try {
      await previous;
    } catch {
      // Previous mutation's failure shouldn't jam the queue; each
    }
    try {
      return await fn();
    } finally {
      resolve();
    }
  }

  async getPool(): Promise<StoredPoolRecord> {
    try {
      const stored = await this.persistent.getItem(this.poolKey);
      if (!stored) {
        return {};
      }
      const parsed: unknown = JSON.parse(stored);
      if (!parsed || typeof parsed !== "object") {
        await this.clearPool();
        return {};
      }
      const result: StoredPoolRecord = {};
      for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
        if (isValidPoolEntry(key, value)) {
          result[key] = value;
        } else {
          logWarn(`[butr] dropping invalid pool entry for ${key}`);
        }
      }
      return result;
    } catch (error) {
      logWarn("[butr] failed to parse pool from storage:", error);
      await this.clearPool();
      return {};
    }
  }

  /**
   * Upsert the in-memory pool into storage. Additive: entries in
   * `pool` are written; entries already in storage that aren't in
   * `pool` are kept. The in-memory pool reflects "what's live right
   * now", not "the complete list of remembered connections"; a
   * silent reconnect that fails on reload leaves the entry out of
   * the pool but the saved entry stays so the next load can retry.
   * Use `removePoolEntry` for explicit eviction (the user clicked
   * Disconnect) and `clearAll` for a full wipe (reset).
   */
  setPool(pool: Map<string, ConnectedWallet>): Promise<void> {
    return this.serializePoolMutation(async () => {
      try {
        const existing = await this.getPool();
        const serializable: StoredPoolRecord = { ...existing };
        for (const [connectorId, wallet] of pool) {
          const entry: StoredPoolEntry = {
            account: wallet.account,
            accounts: wallet.accounts,
            chainPlatform: wallet.connector.chainPlatform,
            connectorId,
            icon: wallet.connector.icon,
            name: wallet.connector.name,
          };
          // The runtime's reducer state is the source of truth; a
          // malformed entry here means a programming error inside butr,
          // write site rather than silently corrupting storage and
          // re-emerging as a "wallet didn't restore" puzzle on the next
          if (!isValidPoolEntry(connectorId, entry)) {
            throw new Error(`[butr] refusing to persist invalid pool entry for ${connectorId}`);
          }
          serializable[connectorId] = entry;
        }
        await this.persistent.setItem(this.poolKey, JSON.stringify(serializable));
      } catch (error) {
        logWarn("[butr] failed to persist pool:", error);
      }
    });
  }

  removePoolEntry(connectorId: string): Promise<void> {
    return this.serializePoolMutation(async () => {
      try {
        const stored = await this.getPool();
        if (stored[connectorId]) {
          const { [connectorId]: _, ...remaining } = stored;
          await this.persistent.setItem(this.poolKey, JSON.stringify(remaining));
        }
      } catch (error) {
        logWarn(`[butr] failed to remove pool entry ${connectorId}:`, error);
      }
    });
  }

  clearPool(): Promise<void> {
    return this.serializePoolMutation(async () => {
      await this.persistent.removeItem(this.poolKey);
    });
  }

  async getSelection(): Promise<StoredSelectionRecord> {
    try {
      const stored = await this.persistent.getItem(this.selectionKey);
      if (!stored) {
        return {};
      }
      const parsed: unknown = JSON.parse(stored);
      if (!parsed || typeof parsed !== "object") {
        return {};
      }
      const result: StoredSelectionRecord = {};
      for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
        if (
          VALID_CHAIN_PLATFORMS.has(key as ChainPlatform) &&
          typeof value === "string" &&
          value.length > 0
        ) {
          result[key as ChainPlatform] = value;
        }
      }
      return result;
    } catch (error) {
      logWarn("[butr] failed to parse selection from storage:", error);
      return {};
    }
  }

  async setSelection(selection: Map<ChainPlatform, string>): Promise<void> {
    try {
      const serializable: StoredSelectionRecord = {};
      for (const [platform, connectorId] of selection) {
        serializable[platform] = connectorId;
      }
      await this.persistent.setItem(this.selectionKey, JSON.stringify(serializable));
    } catch (error) {
      logWarn("[butr] failed to persist selection:", error);
    }
  }

  async getActiveConnectorId(): Promise<string | null> {
    try {
      const value = await this.persistent.getItem(this.activeKey);
      return value && value.length > 0 ? value : null;
    } catch {
      return null;
    }
  }

  async setActiveConnectorId(connectorId: string | null): Promise<void> {
    try {
      await (connectorId === null
        ? this.persistent.removeItem(this.activeKey)
        : this.persistent.setItem(this.activeKey, connectorId));
    } catch (error) {
      logWarn("[butr] failed to persist active connector id:", error);
    }
  }

  async clearAll(): Promise<void> {
    // Pool removal goes through the mutation queue so it can't race
    await Promise.all([
      this.clearPool(),
      this.persistent.removeItem(this.selectionKey),
      this.persistent.removeItem(this.activeKey),
    ]);
  }

  /**
   * Disconnect-intent tracking.
   *
   * Lives in the session driver: survives component remounts (unlike refs)
   * but clears when the session ends (unlike the persistent driver).
   * Prevents auto-connect from firing immediately after a manual disconnect,
   * while still allowing auto-connect on fresh sessions.
   */
  async isUserDisconnected(): Promise<boolean> {
    try {
      const value = await this.session.getItem(this.userDisconnectedKey);
      return value === "true";
    } catch {
      return false;
    }
  }

  async markUserDisconnected(value: boolean): Promise<void> {
    try {
      await (value
        ? this.session.setItem(this.userDisconnectedKey, "true")
        : this.session.removeItem(this.userDisconnectedKey));
    } catch {
      void 0;
    }
  }
}

export { WalletStorage };
