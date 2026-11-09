import type { AccountOptions, PolkadotAdapter, WalletAdapter } from "@usebutr/core";
import { POLKADOT_CHAINS } from "@usebutr/core";
import {
  createWalletStandardCore,
  discoverWalletStandard,
  slugify,
} from "@usebutr/wallet-standard-shared";
import type {
  WalletStandardModuleLoader,
  WalletStandardWallet,
} from "@usebutr/wallet-standard-shared";

import { wrapBytes } from "./message";
import type { PolkadotSignMessageFeature } from "./wallet-standard-types";

const buildPolkadotWalletStandardAdapter = (
  wallet: WalletStandardWallet,
  registerDisconnector?: (emit: () => void) => void,
): PolkadotAdapter | null => {
  const core = createWalletStandardCore({
    id: slugify("polkadot", wallet.name),
    platform: "polkadot",
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

  const signer = core.feature<PolkadotSignMessageFeature>("polkadot:signMessage", "signMessage");

  return {
    ...core.base,
    chainPlatform: "polkadot",
    ...(signer !== undefined && {
      signMessage: async (message: Uint8Array, options?: AccountOptions) => {
        const { account } = signer.target(options);
        const wrapped = wrapBytes(message);

        const output = await signer.call.signMessage({
          account,
          message: wrapped,
        });

        return { signature: output.signature, signedMessage: output.signedMessage ?? wrapped };
      },
    }),
  };
};

/** Requires the optional `@wallet-standard/app` peer dep; without it discovery
 *  logs one warning and finds nothing. */
const discoverPolkadotWalletStandardAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
  loadModule?: WalletStandardModuleLoader,
): (() => void) =>
  discoverWalletStandard([{ build: buildPolkadotWalletStandardAdapter, onAdapter }], {
    loadModule,
  });

export { buildPolkadotWalletStandardAdapter, discoverPolkadotWalletStandardAdapters };
