import type { WalletCapabilities } from "@usebutr/core";
import { buildWalletCapabilities } from "@usebutr/wallet-standard-shared";

type WalletStandardCapabilityInput = {
  chainCount: number;
  features: {
    events: boolean;
    signAndExecuteTransaction: boolean;
    signMessage: boolean;
    signTransaction: boolean;
  };
};

/**
 * `signIn` is false: Sui Wallet Standard has no Sign-In-With-Sui feature.
 * `signAndExecuteTransaction` means the wallet broadcasts, while
 * `signTransaction` is sign-only and leaves the broadcast to the consumer.
 */
const resolveSuiCapabilities = (input: WalletStandardCapabilityInput): WalletCapabilities =>
  buildWalletCapabilities({
    chainCount: input.chainCount,
    events: input.features.events,
    sendTransaction: input.features.signAndExecuteTransaction,
    signIn: false,
    signMessage: input.features.signMessage,
    signTransaction: input.features.signTransaction,
  });

export type { WalletStandardCapabilityInput };
export { resolveSuiCapabilities };
