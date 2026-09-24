import type { BitcoinAdapter } from "@usebutr/core";
import {
  BITCOIN_CHAINS,
  BITCOIN_CHAINS_LIST,
  base64ToBytes,
  bytesToBase64,
  hexToBytes,
} from "@usebutr/core";

import { createCaipAdapterCore } from "./caip";
import type { WalletConnectNamespaceBuilder } from "./types";
import { readResultString } from "./wallet-response";

const BITCOIN_NAMESPACE = "bip122";

const DEFAULT_CHAINS: ReadonlyArray<string> = [BITCOIN_CHAINS.mainnet.id];

// Reown's bip122 methods are unprefixed camelCase while its event channel
// uses a `bip122_` prefix, which is why the two lists look asymmetric.
// https://docs.reown.com/advanced/multichain/rpc-reference/bitcoin-rpc
const DEFAULT_METHODS: ReadonlyArray<string> = [
  "signMessage",
  "signPsbt",
  "sendTransfer",
  "getAccountAddresses",
];

const DEFAULT_EVENTS: ReadonlyArray<string> = ["bip122_addressesChanged"];

/**
 * `sendTx` is `sendTransfer`: the wallet builds, signs and broadcasts the
 * payment itself. `signTransaction` hands back the signed PSBT unbroadcast,
 * for the app's own Esplora or Electrum client.
 */
const bitcoinNamespace: WalletConnectNamespaceBuilder<BitcoinAdapter> = {
  buildAdapter(input) {
    const { base, request, resolveTarget } = createCaipAdapterCore({
      ...input,
      defaultChainId: BITCOIN_CHAINS.mainnet.id,
      events: DEFAULT_EVENTS,
      knownChains: BITCOIN_CHAINS_LIST,
      label: "Bitcoin",
      methods: DEFAULT_METHODS,
      namespace: BITCOIN_NAMESPACE,
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
        let text: string;
        try {
          text = new TextDecoder("utf-8", { fatal: true }).decode(message);
        } catch {
          text = bytesToBase64(message);
        }
        const result = await request(
          "signMessage",
          { account: address, address, message: text },
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
  caipPrefix: BITCOIN_NAMESPACE,
  chainPlatform: "bitcoin",
  defaultChains: DEFAULT_CHAINS,
  defaultEvents: DEFAULT_EVENTS,
  defaultMethods: DEFAULT_METHODS,
};

export { bitcoinNamespace };
