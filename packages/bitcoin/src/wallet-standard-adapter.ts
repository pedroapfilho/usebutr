import type {
  AccountOptions,
  BitcoinAdapter,
  BitcoinTransfer,
  TransactionOptions,
  WalletAdapter,
} from "@usebutr/core";
import { BITCOIN_CHAINS, BITCOIN_CHAINS_LIST } from "@usebutr/core";
import {
  createWalletStandardCore,
  discoverWalletStandard,
  getFeature,
  slugify,
} from "@usebutr/wallet-standard-shared";
import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

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
  /** Optional. Called with a function that pushes a synthetic
   *  `disconnected` event to all current subscribers. The discovery
   *  layer invokes it on Wallet Standard `unregister`. */
  registerDisconnector?: (emit: () => void) => void,
): BitcoinAdapter | null => {
  const core = createWalletStandardCore({
    chains: BITCOIN_CHAINS_LIST,
    id: slugify("btc", wallet.name),
    label: "Bitcoin",
    namespace: "bip122",
    preferredChainIds: [BITCOIN_CHAINS.mainnet.id],
    registerDisconnector,
    trackChainChanges: true,
    wallet,
  });
  if (core === null) {
    return null;
  }

  const sendTransfer = getFeature<BitcoinSendTransferFeature>(
    wallet,
    "bitcoin:sendTransfer",
    "sendTransfer",
  );
  const signMessage = getFeature<BitcoinSignMessageFeature>(
    wallet,
    "bitcoin:signMessage",
    "signMessage",
  );
  const signPsbt = getFeature<BitcoinSignPsbtFeature>(wallet, "bitcoin:signPsbt", "signPsbt");

  return {
    ...core.base,
    chainPlatform: "bitcoin",
    ...(sendTransfer !== undefined && {
      async sendTx({ amount, recipient }: BitcoinTransfer, options?: TransactionOptions) {
        const output = await sendTransfer.sendTransfer({
          account: core.resolveAccount(options?.account),
          amount,
          chain: core.resolveChainId(options?.chain),
          recipient,
        });
        return output.txid;
      },
    }),
    ...(signMessage !== undefined && {
      async signMessage(message: Uint8Array, options?: AccountOptions) {
        const output = await signMessage.signMessage({
          account: core.resolveAccount(options?.account),
          message,
        });
        return { signature: output.signature, signedMessage: output.signedMessage };
      },
    }),
    ...(signPsbt !== undefined && {
      async signTransaction(psbt: Uint8Array, options?: TransactionOptions) {
        const output = await signPsbt.signPsbt({
          account: core.resolveAccount(options?.account),
          chain: core.resolveChainId(options?.chain),
          psbt,
        });
        return output.signedPsbt;
      },
    }),
  };
};

/** Requires the optional `@wallet-standard/app` peer dep. */
const discoverBitcoinAdapters = (onAdapter: (adapter: WalletAdapter) => void): (() => void) =>
  discoverWalletStandard(onAdapter, buildBitcoinAdapter);

export { buildBitcoinAdapter, discoverBitcoinAdapters };
