import type { AccountOptions, PolkadotAdapter, WalletAdapter } from "@usebutr/core";
import { POLKADOT_CHAINS, POLKADOT_CHAINS_LIST } from "@usebutr/core";
import {
  createWalletStandardCore,
  discoverWalletStandard,
  getFeature,
  slugify,
} from "@usebutr/wallet-standard-shared";
import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

import type { PolkadotSignMessageFeature } from "./wallet-standard-types";

const buildPolkadotWalletStandardAdapter = (
  wallet: WalletStandardWallet,
  /** Optional. Called with a function that pushes a synthetic
   *  `disconnected` event to all current subscribers. The discovery
   *  layer invokes it on Wallet Standard `unregister`. */
  registerDisconnector?: (emit: () => void) => void,
): PolkadotAdapter | null => {
  const core = createWalletStandardCore({
    chains: POLKADOT_CHAINS_LIST,
    id: slugify("polkadot", wallet.name),
    label: "Polkadot",
    namespace: "polkadot",
    // Kusama sits alongside Polkadot because it carries real value; Westend
    // and Paseo are faucet testnets and must never win the default.
    preferredChainIds: [POLKADOT_CHAINS.polkadot.id, POLKADOT_CHAINS.kusama.id],
    registerDisconnector,
    trackChainChanges: false,
    wallet,
  });
  if (core === null) {
    return null;
  }

  const signer = getFeature<PolkadotSignMessageFeature>(
    wallet,
    "polkadot:signMessage",
    "signMessage",
  );

  return {
    ...core.base,
    chainPlatform: "polkadot",
    ...(signer !== undefined && {
      signMessage: async (message: Uint8Array, options?: AccountOptions) => {
        const output = await signer.signMessage({
          account: core.resolveAccount(options?.account),
          message,
        });
        return { signature: output.signature, signedMessage: output.signedMessage ?? message };
      },
    }),
  };
};

/**
 * The fallback channel; see `polkadotDiscoverer`. Requires the optional
 * `@wallet-standard/app` peer dep and no-ops without it.
 */
const discoverPolkadotWalletStandardAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
): (() => void) => discoverWalletStandard(onAdapter, buildPolkadotWalletStandardAdapter);

export { buildPolkadotWalletStandardAdapter, discoverPolkadotWalletStandardAdapters };
