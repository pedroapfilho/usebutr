import type { WalletCapabilities } from "@usebutr/core";
import { buildWalletCapabilities } from "@usebutr/wallet-standard-shared";

import { POLKADOT_CHAINS_LIST } from "./chains";

type WalletStandardPolkadotCapabilityInput = {
  chainCount: number;
  features: {
    events: boolean;
    signMessage: boolean;
  };
};

/**
 * injectedWeb3 always exposes `signer.signRaw` and `accounts.subscribe`, so
 * those flags are unconditional. The chain count comes from butr's own
 * registry because injectedWeb3 wallets advertise no chains.
 */
const resolveInjectedPolkadotCapabilities = (): WalletCapabilities =>
  buildWalletCapabilities({
    chainCount: POLKADOT_CHAINS_LIST.length,
    events: true,
    sendTransaction: false,
    signIn: false,
    signMessage: true,
    signTransaction: false,
  });

/**
 * Wallet Standard `polkadot:*` feature → butr capability mapping. No
 * standalone `signTransaction`: building an extrinsic needs chain metadata
 * butr doesn't fetch, so transaction signing goes through `getSigner()`.
 */
const resolveWalletStandardPolkadotCapabilities = (
  input: WalletStandardPolkadotCapabilityInput,
): WalletCapabilities =>
  buildWalletCapabilities({
    chainCount: input.chainCount,
    events: input.features.events,
    sendTransaction: false,
    signIn: false,
    signMessage: input.features.signMessage,
    signTransaction: false,
  });

export type { WalletStandardPolkadotCapabilityInput };
export { resolveInjectedPolkadotCapabilities, resolveWalletStandardPolkadotCapabilities };
