import { bytesToBase58 } from "@usebutr/core";

const SIGNATURE_LENGTH = 64;
const PUBLIC_KEY_LENGTH = 32;
const BLOCKHASH_LENGTH = 32;
const V0_PREFIX = 0x80;

/** Solana shortvec encodes a u16 in at most three bytes, seven bits per
 *  byte. Reject truncated, overflowing and non-canonical encodings. */
const readCompactU16 = (bytes: Uint8Array, offset: number) => {
  let value = 0;
  for (let index = 0; index < 3; index += 1) {
    const byte = bytes[offset + index];
    if (byte === undefined || (index === 2 && byte > 3)) {
      break;
    }
    value += (byte % 128) * 128 ** index;
    if (byte < 128) {
      if (index > 0 && byte === 0) {
        break;
      }
      return { end: offset + index + 1, value };
    }
  }
  throw new TypeError("Malformed compact-u16 in the Solana transaction");
};

type SolanaSigningPayload = {
  /** Serialized message passed to a device that signs messages directly. */
  message: Uint8Array;
  /** Returns a copy with the signer's slot filled, preserving other signatures. */
  withSignature: (signature: Uint8Array) => Uint8Array;
};

/**
 * Resolves the signer's slot in a serialized legacy or v0 transaction.
 * Validates the signature/header/key layout; instructions stay opaque.
 * Both device signers and RPCs returning a bare signature use this boundary.
 */
const prepareSolanaTransaction = (tx: Uint8Array, signer: string): SolanaSigningPayload => {
  const signatures = readCompactU16(tx, 0);
  const messageStart = signatures.end + signatures.value * SIGNATURE_LENGTH;
  const versionByte = tx[messageStart];
  if (versionByte === undefined) {
    throw new TypeError("Truncated Solana transaction message");
  }
  if (versionByte > V0_PREFIX) {
    throw new TypeError(`Unsupported Solana message version ${versionByte - V0_PREFIX}`);
  }
  const headerStart = messageStart + (versionByte === V0_PREFIX ? 1 : 0);
  const signerCount = tx[headerStart];
  const keys = readCompactU16(tx, headerStart + 3);
  const minimumLength = keys.end + keys.value * PUBLIC_KEY_LENGTH + BLOCKHASH_LENGTH + 1;
  if (
    signatures.value === 0 ||
    signerCount !== signatures.value ||
    keys.value < signatures.value ||
    minimumLength > tx.length
  ) {
    throw new TypeError("Malformed Solana transaction signature/header/key layout");
  }
  const signers = Array.from({ length: signatures.value }, (_, index) => {
    const start = keys.end + index * PUBLIC_KEY_LENGTH;
    return bytesToBase58(tx.subarray(start, start + PUBLIC_KEY_LENGTH));
  });
  const slot = signers.indexOf(signer);
  if (slot === -1) {
    throw new Error(`${signer} is not a required signer of this transaction`);
  }

  return {
    message: tx.subarray(messageStart),
    withSignature: (signature) => {
      if (signature.length !== SIGNATURE_LENGTH) {
        throw new Error(`Expected a 64-byte Solana signature, received ${signature.length} bytes`);
      }
      const signed = Uint8Array.from(tx);
      signed.set(signature, signatures.end + slot * SIGNATURE_LENGTH);
      return signed;
    },
  };
};

export type { SolanaSigningPayload };
export { prepareSolanaTransaction };
