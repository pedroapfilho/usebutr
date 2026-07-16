import type { WalletCapabilities } from "@usebutr/core";

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
 * Bitcoin capability mapping.
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
 * - `switchChain = chainCount > 1`. No portable switch RPC across
 *   Bitcoin wallets (Xverse/Unisat/Phantom each pick their own
 *   network), so the switch is local-state-only and advertised only
 *   when the wallet exposes more than one chain to switch between.
 */
const resolveBitcoinCapabilities = (input: BitcoinCapabilityInput): WalletCapabilities => ({
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: input.features.sendTransfer,
  signIn: false,
  signMessage: input.features.signMessage,
  signTransaction: input.features.signPsbt,
  subscribe: input.features.events,
  switchAccount: false,
  switchChain: input.chainCount > 1,
});

export type { BitcoinCapabilityInput };
export { resolveBitcoinCapabilities };
