import type { Account, ChainPlatform } from "../types";

type MaybePromise<T> = T | Promise<T>;

/** Low-level key/value driver. Sync on web (localStorage, MMKV),
 *  async on React Native (AsyncStorage). */
type StorageDriver = {
  getItem: (key: string) => MaybePromise<string | null>;
  removeItem: (key: string) => MaybePromise<void>;
  setItem: (key: string, value: string) => MaybePromise<void>;
};

/** Everything needed to render a connection before its adapter exists:
 *  the shadow adapter shows this identity until silent reconnect lands. */
type StoredPoolEntry = {
  account: Account;
  accounts: ReadonlyArray<Account>;
  chainPlatform: ChainPlatform;
  connectorId: string;
  icon?: string;
  name: string;
};

type StoredPoolRecord = Partial<Record<string, StoredPoolEntry>>;
type StoredSelectionRecord = Partial<Record<ChainPlatform, string>>;

/**
 * Carries no `Connector` by design: a wallet extension exists only in the
 * browser, so a server render can name the wallet and its address but can
 * never dispatch on it.
 */
type WalletSnapshot = {
  activeConnectorId: string | null;
  pool: StoredPoolRecord;
  selection: StoredSelectionRecord;
};

type PersistedWalletState = WalletSnapshot & {
  /** Session-scoped: a manual disconnect suppresses auto-connect for this
   *  session, not forever. */
  isUserDisconnected: boolean;
};

/**
 * `save` receives the whole derived state after every change, so an
 * implementation never merges or diffs. A `load` rejection is reported
 * through `onStorageError` and treated as empty storage.
 */
type WalletPersistence = {
  load: () => Promise<PersistedWalletState>;
  save: (state: PersistedWalletState) => Promise<void>;
};

export type {
  MaybePromise,
  PersistedWalletState,
  StorageDriver,
  StoredPoolEntry,
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletPersistence,
  WalletSnapshot,
};
