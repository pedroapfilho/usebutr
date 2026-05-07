import type { Account, ChainPlatform, ConnectedWallet, WalletMode } from "../types";

type MaybePromise<T> = T | Promise<T>;

/** Low-level key/value driver. Sync on web (localStorage, MMKV),
 *  async on React Native (AsyncStorage). */
type StorageDriver = {
  getItem: (key: string) => MaybePromise<string | null>;
  setItem: (key: string, value: string) => MaybePromise<void>;
  removeItem: (key: string) => MaybePromise<void>;
};

type StoredWalletData = {
  connectorId: string;
  account: Account;
};

type ConnectedWalletsRecord = Partial<Record<string, StoredWalletData>>;

type WalletPersistence = {
  getConnectedWallets(): Promise<ConnectedWalletsRecord>;
  setConnectedWallets(wallets: Map<ChainPlatform, ConnectedWallet>): Promise<void>;
  removeConnectedWallet(chainPlatform: ChainPlatform): Promise<void>;
  clearConnectedWallets(): Promise<void>;
  clearAll(): Promise<void>;
  getWalletMode(): Promise<WalletMode>;
  setWalletMode(mode: WalletMode): Promise<void>;
  clearWalletMode(): Promise<void>;
  isUserDisconnected(): Promise<boolean>;
  markUserDisconnected(value: boolean): Promise<void>;
};

export type {
  ConnectedWalletsRecord,
  MaybePromise,
  StorageDriver,
  StoredWalletData,
  WalletPersistence,
};
