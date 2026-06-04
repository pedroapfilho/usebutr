/**
 * Wallet Standard `polkadot:*` feature shapes. Shared protocol types
 * come from `@usebutr/wallet-standard-shared`.
 *
 * VERIFICATION POINT: field names below model the common Polkadot Wallet
 * Standard feature shape. Confirm against Talisman's advertised
 * `polkadot:signMessage` feature during implementation and adjust if the
 * wallet returns different keys.
 */

import type { WalletStandardWalletAccount } from "@usebutr/wallet-standard-shared";

type PolkadotSignMessageInput = {
  account: WalletStandardWalletAccount;
  message: Uint8Array;
};

type PolkadotSignMessageOutput = {
  signature: Uint8Array;
  signedMessage?: Uint8Array;
};

type PolkadotSignMessageFeature = {
  signMessage(input: PolkadotSignMessageInput): Promise<PolkadotSignMessageOutput>;
};

export type {
  PolkadotSignMessageFeature,
  PolkadotSignMessageInput,
  PolkadotSignMessageOutput,
};
