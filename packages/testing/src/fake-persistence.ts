import type { PersistedWalletState, WalletPersistence } from "@usebutr/core";
import { createMemoryStorageDriver, createWalletStorage } from "@usebutr/core";

type FakePersistence = WalletPersistence & {
  /** Every state the manager handed to `save`, oldest first. */
  readonly saves: ReadonlyArray<PersistedWalletState>;
};

const EMPTY: PersistedWalletState = {
  activeConnectorId: null,
  isUserDisconnected: false,
  pool: {},
  selection: {},
};

/**
 * The production `createWalletStorage` over in-memory drivers, so `load`
 * decodes and validates exactly as it does in the browser. `seed` is what
 * the first `load` finds, as if a previous session had saved it.
 */
const createFakePersistence = (seed: Partial<PersistedWalletState> = {}): FakePersistence => {
  const storage = createWalletStorage({
    persistent: createMemoryStorageDriver(),
    session: createMemoryStorageDriver(),
  });
  const seeded = storage.save({ ...EMPTY, ...seed });
  const saves: Array<PersistedWalletState> = [];

  return {
    load: async () => {
      await seeded;
      return storage.load();
    },
    save: async (state) => {
      saves.push(state);
      await seeded;
      await storage.save(state);
    },
    saves,
  };
};

export type { FakePersistence };
export { createFakePersistence };
