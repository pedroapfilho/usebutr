import type { Account, ChainPlatform, ConnectedWallet } from "../types";

type MaybePromise<T> = T | Promise<T>;

/** Low-level key/value driver. Sync on web (localStorage, MMKV),
 *  async on React Native (AsyncStorage). */
type StorageDriver = {
  getItem: (key: string) => MaybePromise<string | null>;
  removeItem: (key: string) => MaybePromise<void>;
  setItem: (key: string, value: string) => MaybePromise<void>;
};

type StoredPoolEntry = {
  account: Account;
  /** All known accounts on the wallet at last persist. Always contains
   *  `account`. */
  accounts: Array<Account>;
  chainPlatform: ChainPlatform;
  connectorId: string;
  /** Optional wallet icon URL or data-URI captured at persist time.
   *  Lets the shadow adapter render the same icon the live adapter
   *  will when the store is seeded from a snapshot. Omitted when the
   *  adapter had no icon. */
  icon?: string;
  /** Optional human-facing wallet name (e.g. "MetaMask") captured at
   *  persist time. When omitted (legacy entries, hand-written test
   *  fixtures), consumers fall back to `connectorId`. New writes via
   *  `WalletStorage.setPool` always populate this. */
  name?: string;
};

type StoredPoolRecord = Partial<Record<string, StoredPoolEntry>>;
type StoredSelectionRecord = Partial<Record<ChainPlatform, string>>;

type WalletPersistence = {
  clearAll(): Promise<void>;
  clearPool(): Promise<void>;
  getActiveConnectorId(): Promise<string | null>;
  getPool(): Promise<StoredPoolRecord>;
  getSelection(): Promise<StoredSelectionRecord>;
  isUserDisconnected(): Promise<boolean>;
  markUserDisconnected(value: boolean): Promise<void>;
  removePoolEntry(connectorId: string): Promise<void>;
  setActiveConnectorId(connectorId: string | null): Promise<void>;
  setPool(pool: Map<string, ConnectedWallet>): Promise<void>;
  setSelection(selection: Map<ChainPlatform, string>): Promise<void>;
};

export type {
  MaybePromise,
  StorageDriver,
  StoredPoolEntry,
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletPersistence,
};
