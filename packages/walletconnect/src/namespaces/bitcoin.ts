import { bitcoinMessageText } from "@usebutr/bitcoin/message";
import type { BitcoinAdapter } from "@usebutr/core";
import { base64ToBytes, bytesToBase64, hexToBytes } from "@usebutr/core";

import { createCaipAdapterCore } from "./caip";
import type { WalletConnectNamespaceBuilder } from "./types";
import { readResultString } from "./wallet-response";

// Reown's bip122 methods are unprefixed camelCase while its event channel
// uses a `bip122_` prefix, which is why the two lists look asymmetric.
// https://docs.reown.com/advanced/multichain/rpc-reference/bitcoin-rpc
const METHODS: ReadonlyArray<string> = [
  "signMessage",
  "signPsbt",
  "sendTransfer",
  "getAccountAddresses",
];

const EVENTS: ReadonlyArray<string> = ["bip122_addressesChanged"];

/**
 * `sendTx` is `sendTransfer`: the wallet builds, signs and broadcasts the
 * payment itself. `signTransaction` hands back the signed PSBT unbroadcast,
 * for the app's own Esplora or Electrum client.
 */
const bitcoinNamespace: WalletConnectNamespaceBuilder<BitcoinAdapter> = {
  buildAdapter(input) {
    const { base, request, resolveTarget } = createCaipAdapterCore({
      ...input,
      platform: "bitcoin",
    });

    return {
      ...base,
      chainPlatform: "bitcoin",

      async sendTx(transfer, options) {
        const { address, chainId } = resolveTarget(options);

        const result = await request(
          "sendTransfer",
          {
            account: address,
            amount: transfer.amount.toString(10),
            recipientAddress: transfer.recipient,
          },
          chainId,
        );

        return readResultString(result, "txid", "sendTransfer");
      },

      async signMessage(message, options) {
        const { address, chainId } = resolveTarget({ account: options?.account });

        const result = await request(
          "signMessage",
          { account: address, address, message: bitcoinMessageText(message, input.name) },
          chainId,
        );

        const signature = readResultString(result, "signature", "signMessage");

        return { signature: hexToBytes(signature), signedMessage: message };
      },

      async signTransaction(psbt, options) {
        const { address, chainId } = resolveTarget(options);

        const result = await request(
          "signPsbt",
          { account: address, broadcast: false, psbt: bytesToBase64(psbt), signInputs: [] },
          chainId,
        );

        return base64ToBytes(readResultString(result, "psbt", "signPsbt"));
      },
    };
  },
  chainPlatform: "bitcoin",
  events: EVENTS,
  methods: METHODS,
};

export { bitcoinNamespace };
