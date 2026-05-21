/**
 * Minimal type surface for Sui Wallet Standard. Declared inline so butr
 * stays self-contained at the type level — the actual
 * `@wallet-standard/app` package is dynamic-imported at runtime, and
 * apps that don't enable Sui auto-discovery never resolve it.
 *
 * Spec references:
 *  - https://github.com/wallet-standard/wallet-standard (core)
 *  - https://docs.sui.io/standards/wallet-standard (Sui features)
 *
 * These shapes intentionally narrow the spec — they describe only the
 * fields butr's adapter actually reads.
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

type SuiSignPersonalMessageInput = {
  account: WalletStandardWalletAccount;
  message: Uint8Array;
};

type SuiSignPersonalMessageOutput = {
  bytes: string;
  signature: string;
};

type SuiSignPersonalMessageFeature = {
  signPersonalMessage(input: SuiSignPersonalMessageInput): Promise<SuiSignPersonalMessageOutput>;
};

type SuiSignTransactionInput = {
  account: WalletStandardWalletAccount;
  chain: string;
  transaction: { toJSON(): Promise<string> } | string;
};

type SuiSignTransactionOutput = {
  bytes: string;
  signature: string;
};

type SuiSignTransactionFeature = {
  signTransaction(input: SuiSignTransactionInput): Promise<SuiSignTransactionOutput>;
};

type SuiSignAndExecuteTransactionInput = {
  account: WalletStandardWalletAccount;
  chain: string;
  transaction: { toJSON(): Promise<string> } | string;
};

type SuiSignAndExecuteTransactionOutput = {
  bytes: string;
  digest: string;
  effects: string;
  signature: string;
};

type SuiSignAndExecuteTransactionFeature = {
  signAndExecuteTransaction(
    input: SuiSignAndExecuteTransactionInput,
  ): Promise<SuiSignAndExecuteTransactionOutput>;
};

export type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  StandardEventsListener,
  SuiSignAndExecuteTransactionFeature,
  SuiSignAndExecuteTransactionInput,
  SuiSignAndExecuteTransactionOutput,
  SuiSignPersonalMessageFeature,
  SuiSignPersonalMessageInput,
  SuiSignPersonalMessageOutput,
  SuiSignTransactionFeature,
  SuiSignTransactionInput,
  SuiSignTransactionOutput,
  WalletsApp,
  WalletStandardAppModule,
  WalletStandardWallet,
  WalletStandardWalletAccount,
};
