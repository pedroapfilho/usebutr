/**
 * Solana-specific feature shapes, narrowed to the fields the adapter reads.
 * Spec: https://github.com/anza-xyz/wallet-standard
 */

import type { SignInInput } from "@usebutr/core";
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
  version?: string;
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
  version?: string;
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
  version?: string;
};

type SolanaSignInInput = SignInInput;

type SolanaSignInOutput = {
  account: WalletStandardWalletAccount;
  signature: Uint8Array;
  signedMessage: Uint8Array;
};

type SolanaSignInFeature = {
  signIn: (input?: SolanaSignInInput) => Promise<ReadonlyArray<SolanaSignInOutput>>;
  version?: string;
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
