/**
 * Wallet Standard `polkadot:*` feature shapes. Shared protocol types
 * come from `@usebutr/wallet-standard-shared`.
 */

import type { WalletStandardWalletAccount } from "@usebutr/wallet-standard-shared";

/** No published spec: modelled on `solana:signMessage`. butr passes the
 *  `<Bytes>`-wrapped message, as injectedWeb3 `signRaw` does, so a wallet
 *  that signs it as given or wraps it idempotently covers the same bytes. */
type PolkadotSignMessageInput = {
  account: WalletStandardWalletAccount;
  message: Uint8Array;
};

type PolkadotSignMessageOutput = {
  signature: Uint8Array;
  /** The bytes the signature covers, when the wallet reports them. */
  signedMessage?: Uint8Array;
};

type PolkadotSignMessageFeature = {
  signMessage: (input: PolkadotSignMessageInput) => Promise<PolkadotSignMessageOutput>;
  version?: string;
};

export type { PolkadotSignMessageFeature, PolkadotSignMessageInput, PolkadotSignMessageOutput };
