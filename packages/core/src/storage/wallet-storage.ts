import { logWarn } from "../logger";

import { createBrowserStorageDriver } from "./browser-storage-driver";
import type {
  PersistedWalletState,
  StorageDriver,
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletPersistence,
} from "./persistence";
import { decodePool, decodeSelection, storageKeys } from "./validation";

type WalletStorageOptions = {
  /** Defaults to `"butr"`, matching `readWalletSnapshot`. */
  keyPrefix?: string;
  /** Survives app restart. Defaults to localStorage on web. */
  persistent?: StorageDriver;
  /** Cleared on session end. Defaults to sessionStorage on web. */
  session?: StorageDriver;
};

const isEmpty = (record: StoredPoolRecord | StoredSelectionRecord): boolean =>
  Object.keys(record).length === 0;

/**
 * Pool, selection and active id go to the persistent driver, the disconnect
 * intent to the session driver. Unchanged keys are not rewritten, so a
 * cookie-backed driver does not re-send every cookie on each save.
 */
const createWalletStorage = (options: WalletStorageOptions = {}): WalletPersistence => {
  const keys = storageKeys(options.keyPrefix);
  // Cheap: wraps the globals (or in-memory maps) without touching them.
  const browser = createBrowserStorageDriver();
  const persistent = options.persistent ?? browser.persistent;
  const session = options.session ?? browser.session;
  const written = new Map<string, string | null>();

  const read = async (driver: StorageDriver, key: string): Promise<string | null> => {
    try {
      const value = await driver.getItem(key);
      written.set(key, value);
      return value;
    } catch (error) {
      logWarn(`[butr] failed to read ${key} from storage:`, error);
      return null;
    }
  };

  const write = async (driver: StorageDriver, key: string, value: string | null) => {
    if (written.get(key) === value) {
      return;
    }
    await (value === null ? driver.removeItem(key) : driver.setItem(key, value));
    written.set(key, value);
  };

  return {
    load: async () => {
      const [pool, selection, active, userDisconnected] = await Promise.all([
        read(persistent, keys.pool),
        read(persistent, keys.selection),
        read(persistent, keys.active),
        read(session, keys.userDisconnected),
      ]);
      return {
        activeConnectorId: active === null || active === "" ? null : active,
        isUserDisconnected: userDisconnected === "true",
        pool: decodePool(pool),
        selection: decodeSelection(selection),
      };
    },

    save: async (state: PersistedWalletState) => {
      await Promise.all([
        write(persistent, keys.pool, isEmpty(state.pool) ? null : JSON.stringify(state.pool)),
        write(
          persistent,
          keys.selection,
          isEmpty(state.selection) ? null : JSON.stringify(state.selection),
        ),
        write(persistent, keys.active, state.activeConnectorId),
        write(session, keys.userDisconnected, state.isUserDisconnected ? "true" : null),
      ]);
    },
  };
};

export type { WalletStorageOptions };
export { createWalletStorage };
