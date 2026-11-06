import type { SvmAdapter } from "@usebutr/core";
import {
  SVM_CHAINS_LIST,
  base58ToBytes,
  base64ToBytes,
  bytesToBase58,
  bytesToBase64,
} from "@usebutr/core";
import { prepareSolanaTransaction } from "@usebutr/svm/transaction";

import { createCaipAdapterCore } from "./caip";
import type { WalletConnectNamespaceBuilder } from "./types";
import { readResultString, readStringField } from "./wallet-response";

/** WalletConnect names Solana clusters by genesis hash, each registry
 *  entry's first alias, so `SVM_CHAINS.devnet` means the same cluster here
 *  as on every other transport, and accounts carry the registry's chains. */
const GENESIS_IDS: ReadonlyMap<string, string> = new Map(
  SVM_CHAINS_LIST.map((chain) => [chain.id, chain.aliases?.[0] ?? chain.id]),
);

const METHODS: ReadonlyArray<string> = [
  "solana_signMessage",
  "solana_signTransaction",
  "solana_signAndSendTransaction",
];

const EVENTS: ReadonlyArray<string> = ["accountsChanged", "chainChanged", "disconnect"];

/** Wallet response shapes drift between releases (a signed transaction,
 *  or only its signature), so decoding stays lenient. There is no
 *  Sign-In-With-Solana over WC, hence no `signIn`. */
const solanaNamespace: WalletConnectNamespaceBuilder<SvmAdapter> = {
  buildAdapter(input) {
    const { base, request, resolveTarget } = createCaipAdapterCore({ ...input, platform: "svm" });

    return {
      ...base,
      chainPlatform: "svm",

      async sendTx(tx, options) {
        const { address, chainId } = resolveTarget(options);

        const result = await request(
          "solana_signAndSendTransaction",
          { pubkey: address, transaction: bytesToBase64(tx) },
          chainId,
        );

        return readResultString(result, "signature", "solana_signAndSendTransaction");
      },

      async signMessage(message, options) {
        const { address, chainId } = resolveTarget({ account: options?.account });

        // The WalletConnect Solana RPC carries the message base58-encoded.
        const result = await request(
          "solana_signMessage",
          { message: bytesToBase58(message), pubkey: address },
          chainId,
        );

        const signature = readResultString(result, "signature", "solana_signMessage");

        return { signature: base58ToBytes(signature), signedMessage: message };
      },

      async signTransaction(tx, options) {
        const { address, chainId } = resolveTarget(options);
        const transaction = prepareSolanaTransaction(tx, address);

        const result = await request(
          "solana_signTransaction",
          { pubkey: address, transaction: bytesToBase64(tx) },
          chainId,
        );

        const signed = readStringField(result, "transaction");

        if (signed !== undefined && signed !== "") {
          return base64ToBytes(signed);
        }

        const signature = readResultString(result, "signature", "solana_signTransaction");

        return transaction.withSignature(base58ToBytes(signature));
      },
    };
  },
  chainAliases: GENESIS_IDS,
  chainPlatform: "svm",
  events: EVENTS,
  methods: METHODS,
};

export { solanaNamespace };
