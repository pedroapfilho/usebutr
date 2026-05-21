/**
 * Minimal type surface for the Wallet Standard protocol that every
 * platform-specific package (`@usebutr/svm`, `@usebutr/sui`,
 * `@usebutr/bitcoin`) shares. Declared inline so butr stays
 * self-contained at the type level — the actual `@wallet-standard/app`
 * package is dynamic-imported at runtime, and apps that don't enable
 * Wallet Standard discovery never resolve it.
 *
 * Spec: https://github.com/wallet-standard/wallet-standard
 *
 * Platform-specific feature shapes (e.g. `solana:signMessage`,
 * `sui:signPersonalMessage`, `bitcoin:signPsbt`) live in their own
 * platform packages.
 */

type WalletStandardWalletAccount = {
  address: string;
  chains: ReadonlyArray<string>;
  features: ReadonlyArray<string>;
  /** Public key bytes — Wallet Standard ships these as Uint8Array. */
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
  get(): ReadonlyArray<WalletStandardWallet>;
  on(
    event: "register" | "unregister",
    listener: (...wallets: ReadonlyArray<WalletStandardWallet>) => void,
  ): () => void;
};

type WalletStandardAppModule = {
  getWallets(): WalletsApp;
};

type StandardConnectFeature = {
  connect(input?: { silent?: boolean }): Promise<{
    accounts: ReadonlyArray<WalletStandardWalletAccount>;
  }>;
};

type StandardDisconnectFeature = {
  disconnect(): Promise<void>;
};

type StandardEventsListener = (changes: {
  accounts?: ReadonlyArray<WalletStandardWalletAccount>;
  chains?: ReadonlyArray<string>;
  features?: ReadonlyArray<string>;
}) => void;

type StandardEventsFeature = {
  on(event: "change", listener: StandardEventsListener): () => void;
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
