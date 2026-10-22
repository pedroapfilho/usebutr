import { shallow } from "zustand/vanilla/shallow";

import type {
  PersistedWalletState,
  StoredPoolEntry,
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletSnapshot,
} from "../storage/persistence";
import { toStoredPoolEntry } from "../storage/wallet-state-codec";
import type { ChainPlatform, ConnectedWallet } from "../types";
import type { WalletState } from "../types/manager";
import { isChainPlatform } from "../types/platform";

import { createShadowAdapter } from "./shadow-adapter";

const storedEntries = (record: StoredPoolRecord): Array<[string, StoredPoolEntry]> =>
  Object.entries(record).flatMap(([connectorId, entry]) =>
    entry === undefined ? [] : [[connectorId, entry]],
  );

/** Every state field persistence reads; a change elsewhere never saves. */
const persistedSlice = ({
  activeConnectorId,
  dormant,
  isUserDisconnected,
  pool,
  selection,
}: WalletState) => ({ activeConnectorId, dormant, isUserDisconnected, pool, selection });

const toPersistedState = ({
  activeConnectorId,
  dormant,
  isUserDisconnected,
  pool,
  selection,
}: ReturnType<typeof persistedSlice>): PersistedWalletState => {
  const stored: StoredPoolRecord = Object.fromEntries(dormant);

  for (const [connectorId, wallet] of pool) {
    stored[connectorId] = toStoredPoolEntry(wallet);
  }

  return {
    activeConnectorId,
    isUserDisconnected,
    pool: stored,
    selection: Object.fromEntries(selection),
  };
};

const persistedStateChanged = (state: WalletState, prev: WalletState): boolean =>
  !shallow(persistedSlice(state), persistedSlice(prev));

/** `stored` over `selection`, for the platforms whose stored id is pooled. */
const applyStoredSelection = (
  selection: ReadonlyMap<ChainPlatform, string>,
  stored: StoredSelectionRecord,
  pool: ReadonlyMap<string, ConnectedWallet>,
): ReadonlyMap<ChainPlatform, string> => {
  let next = selection;

  for (const [platform, id] of Object.entries(stored)) {
    if (
      isChainPlatform(platform) &&
      pool.get(id)?.connector.chainPlatform === platform &&
      next.get(platform) !== id
    ) {
      next = new Map(next).set(platform, id);
    }
  }

  return next;
};

/**
 * Each snapshot entry is pooled behind a shadow adapter and kept dormant,
 * so it renders now and stays persisted until its silent reconnect settles.
 */
const snapshotState = (
  snapshot: WalletSnapshot,
): Pick<WalletState, "activeConnectorId" | "dormant" | "pool" | "selection"> => {
  const entries = storedEntries(snapshot.pool);

  const pool = new Map<string, ConnectedWallet>(
    entries.map(([connectorId, entry]) => [
      connectorId,
      { account: entry.account, accounts: entry.accounts, connector: createShadowAdapter(entry) },
    ]),
  );

  return {
    activeConnectorId: snapshot.activeConnectorId,
    dormant: new Map(entries),
    pool,
    selection: applyStoredSelection(new Map(), snapshot.selection, pool),
  };
};

export {
  applyStoredSelection,
  persistedStateChanged,
  snapshotState,
  storedEntries,
  toPersistedState,
};
