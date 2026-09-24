import type { SvmAdapter } from "@usebutr/core";
import {
  SVM_CHAINS,
  SVM_CHAINS_LIST,
  base58ToBytes,
  base64ToBytes,
  bytesToBase58,
  bytesToBase64,
} from "@usebutr/core";

import { createCaipAdapterCore } from "./caip";
import type { WalletConnectNamespaceBuilder } from "./types";
import { readResultString, readStringField } from "./wallet-response";

const SOLANA_NAMESPACE = "solana";
// WalletConnect names Solana clusters by genesis hash (the CAIP-2 Solana
// namespace), not by the `solana:mainnet` alias Wallet Standard uses.
const SOLANA_MAINNET = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";

/** So `SVM_CHAINS.devnet` means the same cluster here as on every other
 *  transport, and accounts carry the registry's chains. */
const GENESIS_IDS: ReadonlyMap<string, string> = new Map([
  [SVM_CHAINS.devnet.id, "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"],
  [SVM_CHAINS.mainnet.id, SOLANA_MAINNET],
  [SVM_CHAINS.testnet.id, "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z"],
]);

const SIGNATURE_LENGTH = 64;
const PUBLIC_KEY_LENGTH = 32;

const DEFAULT_CHAINS: ReadonlyArray<string> = [SOLANA_MAINNET];

const DEFAULT_METHODS: ReadonlyArray<string> = [
  "solana_signMessage",
  "solana_signTransaction",
  "solana_signAndSendTransaction",
];

const DEFAULT_EVENTS: ReadonlyArray<string> = ["accountsChanged", "chainChanged", "disconnect"];

/** Solana's compact-u16: 7 bits per byte, low bits first, at most 3 bytes. */
const readCompactU16 = (bytes: Uint8Array, offset: number) => {
  let value = 0;
  for (let size = 0; size < 3; size += 1) {
    const byte = bytes[offset + size];
    if (byte === undefined) {
      break;
    }
    value += (byte % 128) * 128 ** size;
    if (byte < 128) {
      return { size: size + 1, value };
    }
  }
  throw new Error("Malformed Solana transaction: bad compact-u16 length");
};

/**
 * A serialized transaction is `[signature count][64-byte slots][message]`,
 * and slot `i` belongs to the message's `i`-th account key. Some wallets
 * answer `solana_signTransaction` with only the signature.
 */
const spliceSignature = (tx: Uint8Array, signer: string, signature: Uint8Array): Uint8Array => {
  if (signature.length !== SIGNATURE_LENGTH) {
    throw new Error("solana_signTransaction returned a signature that is not 64 bytes");
  }
  const slots = readCompactU16(tx, 0);
  let cursor = slots.size + slots.value * SIGNATURE_LENGTH;
  // A versioned message starts with a 0x80 | version prefix byte.
  if ((tx[cursor] ?? 0) >= 128) {
    cursor += 1;
  }
  const requiredSignatures = tx[cursor] ?? 0;
  // Header: required signatures, read-only signed, read-only unsigned.
  cursor += 3;
  const keys = readCompactU16(tx, cursor);
  cursor += keys.size;
  const signerKey = base58ToBytes(signer);
  const signers = Math.min(requiredSignatures, keys.value, slots.value);
  for (let index = 0; index < signers; index += 1) {
    const start = cursor + index * PUBLIC_KEY_LENGTH;
    const key = tx.subarray(start, start + PUBLIC_KEY_LENGTH);
    if (key.length === signerKey.length && key.every((byte, i) => byte === signerKey[i])) {
      const signed = Uint8Array.from(tx);
      signed.set(signature, slots.size + index * SIGNATURE_LENGTH);
      return signed;
    }
  }
  throw new Error(`${signer} is not a required signer of this transaction`);
};

/** Wallet response shapes drift between releases (a signed transaction,
 *  or only its signature), so decoding stays lenient. There is no
 *  Sign-In-With-Solana over WC, hence no `signIn`. */
const solanaNamespace: WalletConnectNamespaceBuilder<SvmAdapter> = {
  buildAdapter(input) {
    const { base, request, resolveTarget } = createCaipAdapterCore({
      ...input,
      chainAliases: GENESIS_IDS,
      defaultChainId: SOLANA_MAINNET,
      events: DEFAULT_EVENTS,
      knownChains: SVM_CHAINS_LIST,
      label: "Solana",
      methods: DEFAULT_METHODS,
      namespace: SOLANA_NAMESPACE,
    });

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
        return spliceSignature(tx, address, base58ToBytes(signature));
      },
    };
  },
  caipPrefix: SOLANA_NAMESPACE,
  chainAliases: GENESIS_IDS,
  chainPlatform: "svm",
  defaultChains: DEFAULT_CHAINS,
  defaultEvents: DEFAULT_EVENTS,
  defaultMethods: DEFAULT_METHODS,
};

export { solanaNamespace };
