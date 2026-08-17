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
import { decodePool, decodeSelection, parseStoredPoolEntry, storageKeys } from "./validation";

type StorageConfig = {
  /** Defaults to `"butr"`, matching `readWalletSnapshot`. */
  keyPrefix?: string;
  /** Survives app restart. Defaults to localStorage on web. */
  persistent?: StorageDriver;
  /** Cleared on session end. Defaults to sessionStorage on web. */
  session?: StorageDriver;
};

class WalletStorage implements WalletPersistence {
  private readonly poolKey: string;
  private readonly selectionKey: string;
  private readonly activeKey: string;
  private readonly userDisconnectedKey: string;
  private readonly persistent: StorageDriver;
  private readonly session: StorageDriver;
  /**
   * Serializes pool-key mutations so concurrent fire-and-forget
   * writes can't interleave their read-modify-write phases. Without
   * this, two simultaneous `setPool` calls both read the pre-write
   * state, each merge their own entries, and whichever finishes last
   * overwrites the other's additions.
   *
   * Nothing reachable from inside a queued mutation may re-enter this queue:
   * it is not reentrant, so a nested acquire self-deadlocks and leaves the
   * queue permanently pending. Queued mutations therefore read through
   * `readPool`, never through the public `getPool`, which can repair.
   */
  private poolMutationQueue: Promise<unknown> = Promise.resolve();

  constructor(config: StorageConfig) {
    const keys = storageKeys(config.keyPrefix);
    this.poolKey = keys.pool;
    this.selectionKey = keys.selection;
    this.activeKey = keys.active;
    this.userDisconnectedKey = keys.userDisconnected;

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
      // call site already observes its own rejection.
    }
    try {
      return await fn();
    } finally {
      resolve();
    }
  }

  /** Read and decode the pool without touching the mutation queue. Safe to
   *  call from inside a queued mutation, unlike `getPool`. */
  private async readPool(): Promise<{ corrupt: boolean; decoded: StoredPoolRecord }> {
    let stored: string | null;
    try {
      stored = await this.persistent.getItem(this.poolKey);
    } catch (error) {
      logWarn("[butr] failed to read pool from storage:", error);
      return { corrupt: false, decoded: {} };
    }
    if (stored === null || stored === "") {
      return { corrupt: false, decoded: {} };
    }
    const decoded = decodePool(stored);
    // An empty decode from a non-empty payload means the whole record was
    // unreadable, not that the user has no wallets.
    return { corrupt: Object.keys(decoded).length === 0, decoded };
  }

  async getPool(): Promise<StoredPoolRecord> {
    const { corrupt, decoded } = await this.readPool();
    if (corrupt) {
      // Evict the unreadable key directly. Going through `clearPool` would
      // acquire the mutation queue, which self-deadlocks when a queued
      // mutation is what triggered this read.
      try {
        await this.persistent.removeItem(this.poolKey);
      } catch (error) {
        logWarn("[butr] failed to clear corrupt pool:", error);
      }
    }
    return decoded;
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
  async setPool(pool: Map<string, ConnectedWallet>): Promise<void> {
    await this.serializePoolMutation(async () => {
      try {
        const { decoded: existing } = await this.readPool();
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
          if (parseStoredPoolEntry(connectorId, entry) === null) {
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

  async removePoolEntry(connectorId: string): Promise<void> {
    await this.serializePoolMutation(async () => {
      try {
        const { decoded: stored } = await this.readPool();
        if (stored[connectorId]) {
          const { [connectorId]: _, ...remaining } = stored;
          await this.persistent.setItem(this.poolKey, JSON.stringify(remaining));
        }
      } catch (error) {
        logWarn(`[butr] failed to remove pool entry ${connectorId}:`, error);
      }
    });
  }

  async clearPool(): Promise<void> {
    await this.serializePoolMutation(async () => {
      await this.persistent.removeItem(this.poolKey);
    });
  }

  async getSelection(): Promise<StoredSelectionRecord> {
    try {
      return decodeSelection(await this.persistent.getItem(this.selectionKey));
    } catch (error) {
      logWarn("[butr] failed to read selection from storage:", error);
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
      return value !== null && value.length > 0 ? value : null;
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
