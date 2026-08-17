import type { StoredPoolRecord, StoredSelectionRecord, WalletPersistence } from "@usebutr/core";
import { createMemoryStorageDriver, WalletStorage } from "@usebutr/core";

type FakePersistenceSeed = {
  activeConnectorId?: string | null;
  pool?: StoredPoolRecord;
  selection?: StoredSelectionRecord;
  userDisconnected?: boolean;
};

const KEY_PREFIX = "butr-test";

/**
 * In-memory `WalletPersistence` for tests.
 *
 * This is the real `WalletStorage` over memory drivers rather than a second
 * implementation of the interface. A hand-rolled fake drifts: the previous one
 * replaced the pool where the real class upserts, and cleared the
 * user-disconnected flag on `clearAll` where the real class leaves it in the
 * session driver. Tests written against those semantics passed while
 * production did the opposite. Going through `WalletStorage` means the fake
 * cannot disagree with what ships.
 */
const createFakePersistence = (seed: FakePersistenceSeed = {}): WalletPersistence => {
  const persistent = createMemoryStorageDriver();
  const session = createMemoryStorageDriver();

  if (seed.pool) {
    void persistent.setItem(`${KEY_PREFIX}-pool`, JSON.stringify(seed.pool));
  }
  if (seed.selection) {
    void persistent.setItem(`${KEY_PREFIX}-selection`, JSON.stringify(seed.selection));
  }
  if (seed.activeConnectorId !== undefined && seed.activeConnectorId !== null) {
    void persistent.setItem(`${KEY_PREFIX}-active`, seed.activeConnectorId);
  }
  if (seed.userDisconnected === true) {
    void session.setItem(`${KEY_PREFIX}-user-disconnected`, "true");
  }

  return new WalletStorage({ keyPrefix: KEY_PREFIX, persistent, session });
};

export type { FakePersistenceSeed };
export { createFakePersistence };
