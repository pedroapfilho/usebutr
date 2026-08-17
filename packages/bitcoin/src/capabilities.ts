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
 * `signIn` is false: there is no Sign-In-With-Bitcoin standard, and BIP-322
 * is message-signing oriented rather than auth. `sendTransfer` leaves UTXO
 * selection, fees and broadcast to the wallet; `signPsbt` is sign-only.
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
