/**
 * Declared inline so butr stays self-contained at the type level;
 * `@wallet-standard/app` is only dynamic-imported when discovery runs.
 * Spec: https://github.com/wallet-standard/wallet-standard
 */

type WalletStandardWalletAccount = {
  address: string;
  chains: ReadonlyArray<string>;
  features: ReadonlyArray<string>;
  publicKey?: { readonly length: number; readonly [index: number]: number };
};

type WalletStandardFeature = { version?: string };

type WalletStandardWallet = {
  accounts: ReadonlyArray<WalletStandardWalletAccount>;
  chains: ReadonlyArray<string>;
  features: Readonly<Record<string, WalletStandardFeature>>;
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

type WalletStandardModuleLoader = () => Promise<WalletStandardAppModule>;

type StandardConnectFeature = {
  connect: (input?: { silent?: boolean }) => Promise<{
    accounts: ReadonlyArray<WalletStandardWalletAccount>;
  }>;
  version?: string;
};

type StandardDisconnectFeature = {
  disconnect: () => Promise<void>;
  version?: string;
};

type StandardEventsListener = (changes: {
  accounts?: ReadonlyArray<WalletStandardWalletAccount>;
  chains?: ReadonlyArray<string>;
  features?: ReadonlyArray<string>;
}) => void;

type StandardEventsFeature = {
  on: (event: "change", listener: StandardEventsListener) => () => void;
  version?: string;
};

export type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  StandardEventsListener,
  WalletsApp,
  WalletStandardAppModule,
  WalletStandardFeature,
  WalletStandardModuleLoader,
  WalletStandardWallet,
  WalletStandardWalletAccount,
};
