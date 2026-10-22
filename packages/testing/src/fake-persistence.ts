import type { ConnectedWallet, PersistedWalletState, WalletPersistence } from "@usebutr/core";
import { createMemoryStorageDriver, createWalletStorage, toStoredPoolEntry } from "@usebutr/core";

type FakePersistenceSeed = {
  /** The connection the previous session left active. Defaults to the
   *  first of `wallets`. */
  active?: ConnectedWallet;
  /** A manual disconnect earlier in this session. */
  isUserDisconnected?: boolean;
  /** The connections a previous session saved. */
  wallets?: ReadonlyArray<ConnectedWallet>;
};

type FakePersistence = WalletPersistence & {
  /** Every state the manager handed to `save`, oldest first. */
  readonly saves: ReadonlyArray<PersistedWalletState>;
};

/**
 * The production `createWalletStorage` over in-memory drivers, so `load`
 * decodes and validates exactly as it does in the browser. The seed is what
 * the first `load` finds, as if a previous session had saved it.
 */
const createFakePersistence = ({
  active,
  isUserDisconnected = false,
  wallets = [],
}: FakePersistenceSeed = {}): FakePersistence => {
  const storage = createWalletStorage({
    persistent: createMemoryStorageDriver(),
    session: createMemoryStorageDriver(),
  });

  const seeded = storage.save({
    activeConnectorId: active?.connector.id ?? null,
    isUserDisconnected,
    pool: Object.fromEntries(
      wallets.map((wallet) => [wallet.connector.id, toStoredPoolEntry(wallet)]),
    ),
    selection: {},
  });

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
