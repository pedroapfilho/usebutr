/**
 * Sui-specific feature shapes, narrowed to the fields the adapter reads.
 * Spec: https://docs.sui.io/standards/wallet-standard
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
  version?: string;
};

type SuiSignTransactionInput = {
  account: WalletStandardWalletAccount;
  chain: string;
  transaction: { toJSON: () => Promise<string> };
};

type SuiSignTransactionOutput = {
  bytes: string;
  signature: string;
};

type SuiSignTransactionFeature = {
  signTransaction: (input: SuiSignTransactionInput) => Promise<SuiSignTransactionOutput>;
  version?: string;
};

type SuiSignAndExecuteTransactionInput = {
  account: WalletStandardWalletAccount;
  chain: string;
  transaction: { toJSON: () => Promise<string> };
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
  version?: string;
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
