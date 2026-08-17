/**
 * Declared inline so butr stays self-contained at the type level;
 * `@wallet-standard/app` is only dynamic-imported when discovery runs.
 * Spec: https://github.com/wallet-standard/wallet-standard
 */

type WalletStandardWalletAccount = {
  address: string;
  chains: ReadonlyArray<string>;
  features: ReadonlyArray<string>;
  /** Public key bytes; Wallet Standard ships these as Uint8Array. */
  publicKey?: Uint8Array;
};

type WalletStandardWallet = {
  accounts: ReadonlyArray<WalletStandardWalletAccount>;
  chains: ReadonlyArray<string>;
  /** Map keyed by feature name. Values are feature-specific; narrow at
   *  use sites. */
  features: Readonly<Record<string, unknown>>;
  icon: string;
  name: string;
  version: string;
};

type WalletsApp = {
  get: () => ReadonlyArray<WalletStandardWallet>;
  on: (
    event: "register" | "unregister",
    listener: (...wallets: ReadonlyArray<WalletStandardWallet>) => void,
  ) => () => void;
};

type WalletStandardAppModule = {
  getWallets: () => WalletsApp;
};

type StandardConnectFeature = {
  connect: (input?: { silent?: boolean }) => Promise<{
    accounts: ReadonlyArray<WalletStandardWalletAccount>;
  }>;
};

type StandardDisconnectFeature = {
  disconnect: () => Promise<void>;
};

type StandardEventsListener = (changes: {
  accounts?: ReadonlyArray<WalletStandardWalletAccount>;
  chains?: ReadonlyArray<string>;
  features?: ReadonlyArray<string>;
}) => void;

type StandardEventsFeature = {
  on: (event: "change", listener: StandardEventsListener) => () => void;
};

export type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  StandardEventsListener,
  WalletsApp,
  WalletStandardAppModule,
  WalletStandardWallet,
  WalletStandardWalletAccount,
};
