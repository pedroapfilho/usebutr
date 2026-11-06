import type {
  AccountOptions,
  BitcoinAdapter,
  BitcoinTransfer,
  TransactionOptions,
  WalletAdapter,
} from "@usebutr/core";
import {
  createWalletStandardCore,
  discoverWalletStandard,
  slugify,
} from "@usebutr/wallet-standard-shared";
import type {
  WalletStandardModuleLoader,
  WalletStandardWallet,
} from "@usebutr/wallet-standard-shared";

import type {
  BitcoinSendTransferFeature,
  BitcoinSignMessageFeature,
  BitcoinSignPsbtFeature,
} from "./wallet-standard-types";

/**
 * `bitcoin:sendTransfer` backs `sendTx` and `bitcoin:signPsbt` backs
 * `signTransaction`, both routing `options.chain` per call. Balance and
 * receipt reads would need an Esplora/Electrum client butr doesn't ship.
 */
const buildBitcoinAdapter = (
  wallet: WalletStandardWallet,
  registerDisconnector?: (emit: () => void) => void,
): BitcoinAdapter | null => {
  const core = createWalletStandardCore({
    id: slugify("btc", wallet.name),
    platform: "bitcoin",
    registerDisconnector,
    trackChainChanges: true,
    wallet,
  });

  if (core === null) {
    return null;
  }

  const sendTransfer = core.feature<BitcoinSendTransferFeature>(
    "bitcoin:sendTransfer",
    "sendTransfer",
  );

  const signMessage = core.feature<BitcoinSignMessageFeature>("bitcoin:signMessage", "signMessage");

  const signPsbt = core.feature<BitcoinSignPsbtFeature>("bitcoin:signPsbt", "signPsbt");

  return {
    ...core.base,
    chainPlatform: "bitcoin",
    ...(sendTransfer !== undefined && {
      async sendTx({ amount, recipient }: BitcoinTransfer, options?: TransactionOptions) {
        const { account, chain } = sendTransfer.target(options);

        const output = await sendTransfer.call.sendTransfer({
          account,
          amount,
          chain,
          recipient,
        });

        return output.txid;
      },
    }),
    ...(signMessage !== undefined && {
      async signMessage(message: Uint8Array, options?: AccountOptions) {
        const { account } = signMessage.target(options);

        const output = await signMessage.call.signMessage({
          account,
          message,
        });

        return { signature: output.signature, signedMessage: output.signedMessage };
      },
    }),
    ...(signPsbt !== undefined && {
      async signTransaction(psbt: Uint8Array, options?: TransactionOptions) {
        const { account, chain } = signPsbt.target(options);

        const output = await signPsbt.call.signPsbt({
          account,
          chain,
          psbt,
        });

        return output.signedPsbt;
      },
    }),
  };
};

/** Requires the optional `@wallet-standard/app` peer dep; without it discovery
 *  logs one warning and finds nothing. */
const discoverBitcoinAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
  loadModule?: WalletStandardModuleLoader,
): (() => void) =>
  discoverWalletStandard([{ build: buildBitcoinAdapter, onAdapter }], { loadModule });

export { buildBitcoinAdapter, discoverBitcoinAdapters };
