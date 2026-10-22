import type { SuiTransactionInput } from "@usebutr/core";
import { base64ToBytes, bytesToBase64 } from "@usebutr/core";

const ED25519_SCHEME_FLAG = 0;
const ED25519_PUBLIC_KEY_LENGTH = 32;
const ED25519_SIGNATURE_LENGTH = 64;

type SuiSigningPayload = {
  /** BCS `TransactionData` bytes, when the input carried them: bytes or
   *  their base64. A `Transaction` or its JSON has none until it is built
   *  against an RPC client. */
  bytes?: Uint8Array;
  /** The string a wallet reads with `Transaction.from`: base64 BCS bytes,
   *  or a `Transaction`'s JSON. */
  serialized: string;
};

/**
 * Reads a `SuiTransactionInput` the way `Transaction.from` does: a string
 * starting with `{` is a `Transaction`'s JSON, any other is base64 BCS. Every
 * transport sends `serialized`; a signer that needs the bytes reads `bytes`.
 */
const prepareSuiTransaction = async (tx: SuiTransactionInput): Promise<SuiSigningPayload> => {
  if (tx instanceof Uint8Array) {
    return { bytes: tx, serialized: bytesToBase64(tx) };
  }

  const serialized = typeof tx === "string" ? tx : await tx.toJSON();

  if (serialized.startsWith("{")) {
    return { serialized };
  }

  try {
    return { bytes: base64ToBytes(serialized), serialized };
  } catch (error) {
    throw new TypeError("A Sui transaction string must be a Transaction's JSON or base64 BCS", {
      cause: error,
    });
  }
};

/** Sui's serialized Ed25519 signature: scheme flag, signature, public key. */
const serializeEd25519Signature = (signature: Uint8Array, publicKey: Uint8Array): Uint8Array => {
  if (signature.length !== ED25519_SIGNATURE_LENGTH) {
    throw new Error(
      `Expected a ${ED25519_SIGNATURE_LENGTH}-byte Ed25519 signature, received ${signature.length} bytes`,
    );
  }

  if (publicKey.length !== ED25519_PUBLIC_KEY_LENGTH) {
    throw new Error(
      `Expected a ${ED25519_PUBLIC_KEY_LENGTH}-byte Ed25519 public key, received ${publicKey.length} bytes`,
    );
  }

  return Uint8Array.of(ED25519_SCHEME_FLAG, ...signature, ...publicKey);
};

export type { SuiSigningPayload };

export { prepareSuiTransaction, serializeEd25519Signature };
