/**
 * Wallet Standard `polkadot:*` feature shapes. Shared protocol types
 * come from `@usebutr/wallet-standard-shared`.
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

export type { PolkadotSignMessageFeature, PolkadotSignMessageInput, PolkadotSignMessageOutput };
