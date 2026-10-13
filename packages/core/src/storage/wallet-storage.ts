import { logWarn } from "../logger";

import { createBrowserStorageDriver } from "./browser-storage-driver";
import type { StorageDriver, WalletPersistence } from "./persistence";
import type { StorageSlot } from "./wallet-state-codec";
import { createWalletStateCodec } from "./wallet-state-codec";

type WalletStorageOptions = {
  /** Namespaces every key, for several apps on one origin. Defaults to `"butr"`. */
  keyPrefix?: string;
  /** Survives app restart. Defaults to localStorage on web. */
  persistent?: StorageDriver;
  /** Cleared on session end. Defaults to sessionStorage on web. */
  session?: StorageDriver;
};

/**
 * Pool, selection and active id go to the persistent driver, the disconnect
 * intent to the session driver. Unchanged keys are not rewritten, so a
 * cookie-backed driver does not re-send every cookie on each save.
 */
const createWalletStorage = (options: WalletStorageOptions = {}): WalletPersistence => {
  const codec = createWalletStateCodec(options.keyPrefix);
  // Cheap: wraps the globals (or in-memory maps) without touching them.
  const browser = createBrowserStorageDriver();
  const drivers: Record<StorageSlot, StorageDriver> = {
    persistent: options.persistent ?? browser.persistent,
    session: options.session ?? browser.session,
  };
  const written = new Map<string, string | null>();

  const read = async (key: string, slot: StorageSlot): Promise<string | null> => {
    try {
      const value = await drivers[slot].getItem(key);
      written.set(key, value);
      return value;
    } catch (error) {
      logWarn(`[butr] failed to read ${key} from storage:`, error);
      return null;
    }
  };

  const write = async (key: string, slot: StorageSlot, value: string | null) => {
    if (written.get(key) === value) {
      return;
    }
    const driver = drivers[slot];
    await (value === null ? driver.removeItem(key) : driver.setItem(key, value));
    written.set(key, value);
  };

  return {
    load: async () => {
      const values = new Map(
        await Promise.all(
          codec.layout.map(async ({ key, slot }) => [key, await read(key, slot)] as const),
        ),
      );
      return codec.decode((key) => values.get(key));
    },

    save: async (state) => {
      // A failed key must not release the manager's save queue while other
      // writes from this snapshot can still overwrite the next snapshot.
      const results = await Promise.allSettled(
        codec.encode(state).map(({ key, slot, value }) => write(key, slot, value)),
      );
      const failure = results.find((result) => result.status === "rejected");
      if (failure !== undefined) {
        throw failure.reason;
      }
    },
  };
};

export type { WalletStorageOptions };
export { createWalletStorage };
