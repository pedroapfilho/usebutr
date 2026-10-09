import type { SuiAdapter, SuiTransactionInput, WalletAdapter } from "@usebutr/core";
import { base64ToBytes, SUI_CHAINS_LIST } from "@usebutr/core";
import {
  createWalletStandardCore,
  discoverWalletStandard,
  getFeature,
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
  /** Discovery passes this so a Wallet Standard `unregister` tears down the
   *  connected pool entry. */
  registerDisconnector?: (emit: () => void) => void,
): SuiAdapter | null => {
  const core = createWalletStandardCore({
    chains: SUI_CHAINS_LIST,
    id: slugify("sui", wallet.name),
    label: "Sui",
    namespace: "sui",
    preferredChainIds: ["sui:mainnet"],
    registerDisconnector,
    trackChainChanges: true,
    wallet,
  });
  if (core === null) {
    return null;
  }

  const signAndExecute = getFeature<SuiSignAndExecuteTransactionFeature>(
    wallet,
    "sui:signAndExecuteTransaction",
    "signAndExecuteTransaction",
  );
  const signPersonalMessage = getFeature<SuiSignPersonalMessageFeature>(
    wallet,
    "sui:signPersonalMessage",
    "signPersonalMessage",
  );
  const signTransaction = getFeature<SuiSignTransactionFeature>(
    wallet,
    "sui:signTransaction",
    "signTransaction",
  );

  return {
    ...core.base,
    chainPlatform: "sui",
    ...(signAndExecute !== undefined && {
      async sendTx(tx, options) {
        const output = await signAndExecute.signAndExecuteTransaction({
          account: core.resolveAccount(options?.account),
          chain: core.resolveChainId(options?.chain),
          transaction: await walletTransaction(tx),
        });
        return output.digest;
      },
    }),
    ...(signPersonalMessage !== undefined && {
      async signMessage(message, options) {
        const output = await signPersonalMessage.signPersonalMessage({
          account: core.resolveAccount(options?.account),
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
        const output = await signTransaction.signTransaction({
          account: core.resolveAccount(options?.account),
          chain: core.resolveChainId(options?.chain),
          transaction: await walletTransaction(tx),
        });
        return { bytes: base64ToBytes(output.bytes), signature: base64ToBytes(output.signature) };
      },
    }),
  };
};

/**
 * Requires the optional `@wallet-standard/app` peer dep; without it Sui
 * discovery silently does nothing.
 * Spec: https://docs.sui.io/standards/wallet-standard
 */
const discoverSuiAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
  loadModule?: WalletStandardModuleLoader,
): (() => void) => discoverWalletStandard(onAdapter, buildSuiAdapter, loadModule);

export { buildSuiAdapter, discoverSuiAdapters };
