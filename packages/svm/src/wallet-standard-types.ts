/**
 * Solana-specific Wallet Standard feature shapes. Shared protocol
 * types (`WalletStandardWallet`, `standard:*` features) come from
 * `@usebutr/wallet-standard-shared`.
 *
 * Spec: https://github.com/anza-xyz/wallet-standard (Solana features)
 *
 * These shapes intentionally narrow the spec — they describe only the
 * fields butr's adapter actually reads.
 */

import type { WalletStandardWalletAccount } from "@usebutr/wallet-standard-shared";

type SolanaSignMessageInput = {
  account: WalletStandardWalletAccount;
  message: Uint8Array;
};

type SolanaSignMessageOutput = {
  signature: Uint8Array;
  signedMessage: Uint8Array;
};

type SolanaSignMessageFeature = {
  signMessage: (
    ...inputs: ReadonlyArray<SolanaSignMessageInput>
  ) => Promise<ReadonlyArray<SolanaSignMessageOutput>>;
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
  signAndSendTransaction: (
    ...inputs: ReadonlyArray<SolanaSignAndSendTransactionInput>
  ) => Promise<ReadonlyArray<SolanaSignAndSendTransactionOutput>>;
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
  signTransaction: (
    ...inputs: ReadonlyArray<SolanaSignTransactionInput>
  ) => Promise<ReadonlyArray<SolanaSignTransactionOutput>>;
};

/** SIWS message fields — all optional; the wallet fills defaults. */
type SolanaSignInInput = Record<string, unknown>;

type SolanaSignInOutput = {
  account: WalletStandardWalletAccount;
  signature: Uint8Array;
  signedMessage: Uint8Array;
};

type SolanaSignInFeature = {
  signIn: (input?: SolanaSignInInput) => Promise<ReadonlyArray<SolanaSignInOutput>>;
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
};
