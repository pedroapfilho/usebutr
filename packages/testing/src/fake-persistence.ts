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
 * The real `WalletStorage` over memory drivers, not a second implementation of
 * the interface. A hand-rolled fake previously drifted on pool upsert and
 * `clearAll` semantics, so tests passed while production did the opposite.
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
