import { logWarn } from "../logger";
import type { ChainPlatform, ConnectedWallet } from "../types";

import { createBrowserStorageDriver } from "./browser-storage-driver";
import type {
  StorageDriver,
  StoredPoolEntry,
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletPersistence,
} from "./persistence";

const VALID_CHAIN_PLATFORMS = new Set<ChainPlatform>(["evm", "svm", "sui", "bitcoin"]);

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
 *    and dropped — legacy / cross-tab corruption shouldn't crash the
 *    consumer.
 *  - On write (`setPool`): the runtime's reducer state is the source
 *    of truth, and a malformed write would indicate a programming
 *    error inside butr. Throw rather than silently corrupt storage.
 *
 * Same validator either way — keeping the two paths symmetric means
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
  // `name` and `icon` are both optional; reject only when present
  // but wrong-typed. Legacy entries written before this field was
  // captured will lack `name`; consumers fall back to `connectorId`.
  if (entry.name !== undefined && typeof entry.name !== "string") {
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

  // ---- Pool ----

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

  async setPool(pool: Map<string, ConnectedWallet>): Promise<void> {
    try {
      const serializable: StoredPoolRecord = {};
      for (const [connectorId, wallet] of pool) {
        const entry: StoredPoolEntry = {
          account: wallet.account,
          accounts: wallet.accounts,
          chainPlatform: wallet.connector.chainPlatform,
          connectorId,
          icon: wallet.connector.icon,
          name: wallet.connector.name,
        };
        // The runtime's reducer state is the source of truth — a
        // malformed entry here means a programming error inside butr,
        // not data drift. Throw loudly so the bug surfaces at the
        // write site rather than silently corrupting storage and
        // re-emerging as a "wallet didn't restore" puzzle on the next
        // page load.
        if (!isValidPoolEntry(connectorId, entry)) {
          throw new Error(`[butr] refusing to persist invalid pool entry for ${connectorId}`);
        }
        serializable[connectorId] = entry;
      }
      await this.persistent.setItem(this.poolKey, JSON.stringify(serializable));
    } catch (error) {
      logWarn("[butr] failed to persist pool:", error);
    }
  }

  async removePoolEntry(connectorId: string): Promise<void> {
    try {
      const stored = await this.getPool();
      if (stored[connectorId]) {
        const { [connectorId]: _, ...remaining } = stored;
        await this.persistent.setItem(this.poolKey, JSON.stringify(remaining));
      }
    } catch (error) {
      logWarn(`[butr] failed to remove pool entry ${connectorId}:`, error);
    }
  }

  async clearPool(): Promise<void> {
    await this.persistent.removeItem(this.poolKey);
  }

  // ---- Selection ----

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

  // ---- Active connector ----

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

  // ---- Bulk clear ----

  async clearAll(): Promise<void> {
    // Three independent removeItem calls — run them concurrently
    // instead of awaiting in sequence. Drivers with async I/O
    // (AsyncStorage, MMKV, IndexedDB-wrapped) benefit; sync drivers
    // (localStorage, memory) just collapse to immediate resolves.
    await Promise.all([
      this.persistent.removeItem(this.poolKey),
      this.persistent.removeItem(this.selectionKey),
      this.persistent.removeItem(this.activeKey),
    ]);
  }

  // ---- Disconnect intent ----

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
      // ignore
    }
  }
}

export { WalletStorage };
