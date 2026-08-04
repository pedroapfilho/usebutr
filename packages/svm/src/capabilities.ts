import type { WalletCapabilities } from "@usebutr/core";
import { buildWalletCapabilities } from "@usebutr/wallet-standard-shared";

type WalletStandardCapabilityInput = {
  chainCount: number;
  features: {
    events: boolean;
    signAndSendTransaction: boolean;
    signIn: boolean;
    signMessage: boolean;
    signTransaction: boolean;
  };
};

/**
 * Solana Wallet Standard feature → butr capability mapping. The flags that
 * hold for every namespace are documented on `buildWalletCapabilities`.
 */
const resolveWalletStandardCapabilities = (
  input: WalletStandardCapabilityInput,
): WalletCapabilities =>
  buildWalletCapabilities({
    chainCount: input.chainCount,
    events: input.features.events,
    sendTransaction: input.features.signAndSendTransaction,
    signIn: input.features.signIn,
    signMessage: input.features.signMessage,
    signTransaction: input.features.signTransaction,
  });

export type { WalletStandardCapabilityInput };
export { resolveWalletStandardCapabilities };
