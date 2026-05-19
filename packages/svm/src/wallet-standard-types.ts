/**
 * Minimal type surface for Solana Wallet Standard. Declared inline so
 * butr stays self-contained at the type level — the actual
 * `@wallet-standard/app` package is dynamic-imported at runtime, and
 * users who don't enable SVM auto-discovery never resolve it.
 *
 * Spec references:
 *  - https://github.com/wallet-standard/wallet-standard (core)
 *  - https://github.com/anza-xyz/wallet-standard (Solana features)
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
  /** Map keyed by feature name (e.g. `"standard:connect"`,
   *  `"solana:signMessage"`). Values are feature-specific. We narrow at
   *  use sites instead of importing the full feature type tree. */
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

// ---- Feature shapes (narrowed). Cast wallet.features['…'] to these
// after a runtime presence check. ----

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
  /** Present when the wallet's advertised feature set changes at
   *  runtime. butr resolves `capabilities` once at adapter construction
   *  (same as the EIP-1193 side) — a `ConnectorEvent` for capability
   *  changes doesn't exist, so the adapter doesn't act on this. Listed
   *  for spec completeness / future use. */
  features?: ReadonlyArray<string>;
}) => void;

type StandardEventsFeature = {
  on(event: "change", listener: StandardEventsListener): () => void;
};

type SolanaSignMessageInput = {
  account: WalletStandardWalletAccount;
  message: Uint8Array;
};

type SolanaSignMessageOutput = {
  signature: Uint8Array;
  signedMessage: Uint8Array;
};

type SolanaSignMessageFeature = {
  signMessage(
    ...inputs: ReadonlyArray<SolanaSignMessageInput>
  ): Promise<ReadonlyArray<SolanaSignMessageOutput>>;
};

type SolanaSignAndSendTransactionInput = {
  account: WalletStandardWalletAccount;
  chain: string;
  transaction: Uint8Array;
};

type SolanaSignAndSendTransactionOutput = {
  signature: Uint8Array;
};

type SolanaSignAndSendTransactionFeature = {
  signAndSendTransaction(
    ...inputs: ReadonlyArray<SolanaSignAndSendTransactionInput>
  ): Promise<ReadonlyArray<SolanaSignAndSendTransactionOutput>>;
};

type SolanaSignTransactionInput = {
  account: WalletStandardWalletAccount;
  chain?: string;
  transaction: Uint8Array;
};

type SolanaSignTransactionOutput = {
  signedTransaction: Uint8Array;
};

type SolanaSignTransactionFeature = {
  signTransaction(
    ...inputs: ReadonlyArray<SolanaSignTransactionInput>
  ): Promise<ReadonlyArray<SolanaSignTransactionOutput>>;
};

/** SIWS message fields — all optional; the wallet fills defaults. */
type SolanaSignInInput = Record<string, unknown>;

type SolanaSignInOutput = {
  account: WalletStandardWalletAccount;
  signature: Uint8Array;
  signedMessage: Uint8Array;
};

type SolanaSignInFeature = {
  signIn(input?: SolanaSignInInput): Promise<ReadonlyArray<SolanaSignInOutput>>;
};

export type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignAndSendTransactionInput,
  SolanaSignAndSendTransactionOutput,
  SolanaSignInFeature,
  SolanaSignInInput,
  SolanaSignInOutput,
  SolanaSignMessageFeature,
  SolanaSignMessageInput,
  SolanaSignMessageOutput,
  SolanaSignTransactionFeature,
  SolanaSignTransactionInput,
  SolanaSignTransactionOutput,
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  StandardEventsListener,
  WalletsApp,
  WalletStandardAppModule,
  WalletStandardWallet,
  WalletStandardWalletAccount,
};
