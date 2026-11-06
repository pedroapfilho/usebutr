import type { SuiAdapter, SuiTransactionInput, WalletAdapter } from "@usebutr/core";
import { base64ToBytes } from "@usebutr/core";
import {
  createWalletStandardCore,
  discoverWalletStandard,
  slugify,
} from "@usebutr/wallet-standard-shared";
import type {
  WalletStandardModuleLoader,
  WalletStandardWallet,
} from "@usebutr/wallet-standard-shared";

import { prepareSuiTransaction } from "./transaction";
import type {
  SuiSignAndExecuteTransactionFeature,
  SuiSignPersonalMessageFeature,
  SuiSignTransactionFeature,
  SuiSignTransactionInput,
} from "./wallet-standard-types";

/** Sui wallets take only the `toJSON()` form, which hands them the same
 *  string every other transport sends. */
const walletTransaction = async (
  tx: SuiTransactionInput,
): Promise<SuiSignTransactionInput["transaction"]> => {
  const { serialized } = await prepareSuiTransaction(tx);

  return { toJSON: () => Promise.resolve(serialized) };
};

/**
 * Wallet Standard carries the chain per call, so `sendTx` and
 * `signTransaction` route `options.chain` without moving the wallet. Balance
 * and receipt reads need a `SuiClient`, which butr does not ship.
 */
const buildSuiAdapter = (
  wallet: WalletStandardWallet,
  registerDisconnector?: (emit: () => void) => void,
): SuiAdapter | null => {
  const core = createWalletStandardCore({
    id: slugify("sui", wallet.name),
    platform: "sui",
    registerDisconnector,
    trackChainChanges: true,
    wallet,
  });

  if (core === null) {
    return null;
  }

  const signAndExecute = core.feature<SuiSignAndExecuteTransactionFeature>(
    "sui:signAndExecuteTransaction",
    "signAndExecuteTransaction",
  );

  const signPersonalMessage = core.feature<SuiSignPersonalMessageFeature>(
    "sui:signPersonalMessage",
    "signPersonalMessage",
  );

  const signTransaction = core.feature<SuiSignTransactionFeature>(
    "sui:signTransaction",
    "signTransaction",
  );

  return {
    ...core.base,
    chainPlatform: "sui",
    ...(signAndExecute !== undefined && {
      async sendTx(tx, options) {
        const { account, chain } = signAndExecute.target(options);

        const output = await signAndExecute.call.signAndExecuteTransaction({
          account,
          chain,
          transaction: await walletTransaction(tx),
        });

        return output.digest;
      },
    }),
    ...(signPersonalMessage !== undefined && {
      async signMessage(message, options) {
        const { account } = signPersonalMessage.target(options);

        const output = await signPersonalMessage.call.signPersonalMessage({
          account,
          message,
        });

        return {
          signature: base64ToBytes(output.signature),
          signedMessage: base64ToBytes(output.bytes),
        };
      },
    }),
    ...(signTransaction !== undefined && {
      async signTransaction(tx, options) {
        const { account, chain } = signTransaction.target(options);

        const output = await signTransaction.call.signTransaction({
          account,
          chain,
          transaction: await walletTransaction(tx),
        });

        return { bytes: base64ToBytes(output.bytes), signature: base64ToBytes(output.signature) };
      },
    }),
  };
};

/**
 * Requires the optional `@wallet-standard/app` peer dep; without it Sui
 * discovery logs one warning and finds nothing.
 * Spec: https://docs.sui.io/standards/wallet-standard
 */
const discoverSuiAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
  loadModule?: WalletStandardModuleLoader,
): (() => void) => discoverWalletStandard([{ build: buildSuiAdapter, onAdapter }], { loadModule });

export { buildSuiAdapter, discoverSuiAdapters };
