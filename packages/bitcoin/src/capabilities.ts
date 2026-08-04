import type { WalletCapabilities } from "@usebutr/core";
import { buildWalletCapabilities } from "@usebutr/wallet-standard-shared";

type BitcoinCapabilityInput = {
  chainCount: number;
  features: {
    events: boolean;
    sendTransfer: boolean;
    signMessage: boolean;
    signPsbt: boolean;
  };
};

/**
 * Bitcoin feature → butr capability mapping. The flags that hold for every
 * namespace are documented on `buildWalletCapabilities`.
 *
 * - `sendTransaction = bitcoin:sendTransfer present`. The wallet handles
 *   UTXO selection, fee estimation, signing, and broadcast.
 * - `signTransaction = bitcoin:signPsbt present`. Sign-only PSBT path
 *   for consumers that build their own UTXO-shaped transactions with
 *   `bitcoinjs-lib` and broadcast through their own provider.
 * - `signMessage = bitcoin:signMessage present`.
 * - `signIn = false`. No Sign-In-With-Bitcoin standard yet (BIP-322 is
 *   message-signing oriented, not auth).
 * - `subscribe = events present`. Most Bitcoin wallets don't emit
 *   change events portably; capabilities admits the truth.
 */
const resolveBitcoinCapabilities = (input: BitcoinCapabilityInput): WalletCapabilities =>
  buildWalletCapabilities({
    chainCount: input.chainCount,
    events: input.features.events,
    sendTransaction: input.features.sendTransfer,
    signIn: false,
    signMessage: input.features.signMessage,
    signTransaction: input.features.signPsbt,
  });

export type { BitcoinCapabilityInput };
export { resolveBitcoinCapabilities };
