/**
 * Minimal type surface for Bitcoin Wallet Standard. Declared inline so
 * butr stays self-contained at the type level — the actual
 * `@wallet-standard/app` package is dynamic-imported at runtime, and
 * apps that don't enable Bitcoin auto-discovery never resolve it.
 *
 * Spec references:
 *  - https://github.com/wallet-standard/wallet-standard (core)
 *  - https://github.com/orangecat-network/wallet-standard-bitcoin
 *  - https://github.com/MagicEden/wallet-standard (Bitcoin features)
 *
 * Phantom, Magic Eden, OKX (Bitcoin), Leather and a growing list of
 * wallets advertise these `bitcoin:*` features over the same
 * `@wallet-standard/app` bus that SVM and Sui consume.
 */

type WalletStandardWalletAccount = {
  address: string;
  chains: ReadonlyArray<string>;
  features: ReadonlyArray<string>;
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

type BitcoinSignMessageInput = {
  account: WalletStandardWalletAccount;
  message: Uint8Array;
};

type BitcoinSignMessageOutput = {
  signature: Uint8Array;
  signedMessage: Uint8Array;
};

type BitcoinSignMessageFeature = {
  signMessage(input: BitcoinSignMessageInput): Promise<BitcoinSignMessageOutput>;
};

type BitcoinSignPsbtInput = {
  account: WalletStandardWalletAccount;
  /** Network chain id (`bip122:…`). */
  chain: string;
  /** Base64- or hex-encoded PSBT bytes. */
  psbt: Uint8Array;
  /** Optional input indexes to sign; omit to sign every input the wallet
   *  controls. */
  signInputs?: ReadonlyArray<number>;
};

type BitcoinSignPsbtOutput = {
  /** Signed PSBT bytes (the wallet either fills in signatures only or
   *  finalises depending on the input indexes). */
  signedPsbt: Uint8Array;
};

type BitcoinSignPsbtFeature = {
  signPsbt(input: BitcoinSignPsbtInput): Promise<BitcoinSignPsbtOutput>;
};

type BitcoinSendTransferInput = {
  account: WalletStandardWalletAccount;
  amount: bigint;
  chain: string;
  recipient: string;
};

type BitcoinSendTransferOutput = {
  /** Broadcast txid. */
  txid: string;
};

type BitcoinSendTransferFeature = {
  sendTransfer(input: BitcoinSendTransferInput): Promise<BitcoinSendTransferOutput>;
};

export type {
  BitcoinSendTransferFeature,
  BitcoinSendTransferInput,
  BitcoinSendTransferOutput,
  BitcoinSignMessageFeature,
  BitcoinSignMessageInput,
  BitcoinSignMessageOutput,
  BitcoinSignPsbtFeature,
  BitcoinSignPsbtInput,
  BitcoinSignPsbtOutput,
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  StandardEventsListener,
  WalletsApp,
  WalletStandardAppModule,
  WalletStandardWallet,
  WalletStandardWalletAccount,
};
