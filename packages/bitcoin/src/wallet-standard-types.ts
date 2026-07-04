/**
 * Bitcoin-specific Wallet Standard feature shapes. Shared protocol
 * types (`WalletStandardWallet`, `standard:*` features) come from
 * `@usebutr/wallet-standard-shared`.
 *
 * Spec references:
 *  - https://github.com/orangecat-network/wallet-standard-bitcoin
 *  - https://github.com/MagicEden/wallet-standard (Bitcoin features)
 *
 * Phantom, Magic Eden, OKX (Bitcoin), Leather and a growing list of
 * wallets advertise these `bitcoin:*` features over the same
 * `@wallet-standard/app` bus that SVM and Sui consume.
 */

import type { WalletStandardWalletAccount } from "@usebutr/wallet-standard-shared";

type BitcoinSignMessageInput = {
  account: WalletStandardWalletAccount;
  message: Uint8Array;
};

type BitcoinSignMessageOutput = {
  signature: Uint8Array;
  signedMessage: Uint8Array;
};

type BitcoinSignMessageFeature = {
  signMessage: (input: BitcoinSignMessageInput) => Promise<BitcoinSignMessageOutput>;
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
  signPsbt: (input: BitcoinSignPsbtInput) => Promise<BitcoinSignPsbtOutput>;
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
  sendTransfer: (input: BitcoinSendTransferInput) => Promise<BitcoinSendTransferOutput>;
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
};
