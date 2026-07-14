/**
 * Sui-specific Wallet Standard feature shapes. Shared protocol types
 * (`WalletStandardWallet`, `standard:*` features) come from
 * `@usebutr/wallet-standard-shared`.
 *
 * Spec: https://docs.sui.io/standards/wallet-standard
 *
 * These shapes intentionally narrow the spec; they describe only the
 * fields butr's adapter actually reads.
 */

import type { WalletStandardWalletAccount } from "@usebutr/wallet-standard-shared";

type SuiSignPersonalMessageInput = {
  account: WalletStandardWalletAccount;
  message: Uint8Array;
};

type SuiSignPersonalMessageOutput = {
  bytes: string;
  signature: string;
};

type SuiSignPersonalMessageFeature = {
  signPersonalMessage: (
    input: SuiSignPersonalMessageInput,
  ) => Promise<SuiSignPersonalMessageOutput>;
};

type SuiSignTransactionInput = {
  account: WalletStandardWalletAccount;
  chain: string;
  transaction: { toJSON: () => Promise<string> } | string;
};

type SuiSignTransactionOutput = {
  bytes: string;
  signature: string;
};

type SuiSignTransactionFeature = {
  signTransaction: (input: SuiSignTransactionInput) => Promise<SuiSignTransactionOutput>;
};

type SuiSignAndExecuteTransactionInput = {
  account: WalletStandardWalletAccount;
  chain: string;
  transaction: { toJSON: () => Promise<string> } | string;
};

type SuiSignAndExecuteTransactionOutput = {
  bytes: string;
  digest: string;
  effects: string;
  signature: string;
};

type SuiSignAndExecuteTransactionFeature = {
  signAndExecuteTransaction: (
    input: SuiSignAndExecuteTransactionInput,
  ) => Promise<SuiSignAndExecuteTransactionOutput>;
};

export type {
  SuiSignAndExecuteTransactionFeature,
  SuiSignAndExecuteTransactionInput,
  SuiSignAndExecuteTransactionOutput,
  SuiSignPersonalMessageFeature,
  SuiSignPersonalMessageInput,
  SuiSignPersonalMessageOutput,
  SuiSignTransactionFeature,
  SuiSignTransactionInput,
  SuiSignTransactionOutput,
};
