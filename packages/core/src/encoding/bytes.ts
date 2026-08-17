/**
 * Hex prefixing diverges by chain (bare for Bitcoin and Ledger, `0x` for
 * EVM and Polkadot), so the variants stay explicit: these sit on the
 * signing path, where a silent mismatch corrupts one chain's signatures.
 */

/** Bitcoin/Solana alphabet; omits the visually ambiguous `0`, `O`, `I`, `l`. */
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const BASE58_INDEX = new Map<string, number>();
for (let i = 0; i < BASE58_ALPHABET.length; i += 1) {
  BASE58_INDEX.set(BASE58_ALPHABET[i] ?? "", i);
}

/** Bare lowercase hex, no `0x` prefix (Bitcoin, Ledger). */
const bytesToHex = (bytes: Uint8Array): string => {
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
};

/** `0x`-prefixed lowercase hex (EVM, Polkadot). */
const bytesToHexPrefixed = (bytes: Uint8Array): string => `0x${bytesToHex(bytes)}`;

/**
 * Decode hex (with or without a leading `0x`) into raw bytes. Throws on
 * odd-length input or non-hex characters rather than silently producing
 * `NaN`-filled bytes.
 */
const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new TypeError("Invalid hex: odd length");
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    const byte = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(byte)) {
      throw new TypeError(`Invalid hex character at offset ${i * 2}`);
    }
    out[i] = byte;
  }
  return out;
};

/**
 * Cross-platform base64 → `Uint8Array`. `atob` is available everywhere
 * butr runs (browsers, RN since Hermes, Node 16+, Bun, Deno).
 */
const base64ToBytes = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.codePointAt(i) ?? 0;
  }
  return out;
};

/** Cross-platform `Uint8Array` → base64. */
const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCodePoint(byte);
  }
  return btoa(binary);
};

/**
 * `Uint8Array` → base58 (Solana addresses and signatures). Leading zero
 * bytes are significant in base58 and survive the BigInt round-trip only
 * because they're re-prefixed as `1`s afterwards.
 */
const bytesToBase58 = (bytes: Uint8Array): string => {
  let intVal = 0n;
  for (const byte of bytes) {
    intVal = (intVal << 8n) | BigInt(byte);
  }
  let out = "";
  while (intVal > 0n) {
    const remainder = intVal % 58n;
    intVal /= 58n;
    out = BASE58_ALPHABET[Number(remainder)] + out;
  }
  for (const byte of bytes) {
    if (byte !== 0) {
      break;
    }
    out = `1${out}`;
  }
  return out;
};

/** Decode base58 into raw bytes. Throws on characters outside the alphabet
 *  rather than silently dropping them. */
const base58ToBytes = (input: string): Uint8Array => {
  let intVal = 0n;
  let leadingZeros = 0;
  let stillLeading = true;
  for (const char of input) {
    if (stillLeading && char === "1") {
      leadingZeros += 1;
    } else {
      stillLeading = false;
    }
    const digit = BASE58_INDEX.get(char);
    if (digit === undefined) {
      throw new Error(`Invalid base58 character "${char}"`);
    }
    intVal = intVal * 58n + BigInt(digit);
  }
  const bytes: Array<number> = [];
  const byteMask = 255n;
  while (intVal > 0n) {
    bytes.unshift(Number(intVal & byteMask));
    intVal >>= 8n;
  }
  for (let i = 0; i < leadingZeros; i += 1) {
    bytes.unshift(0);
  }
  return Uint8Array.from(bytes);
};

export {
  base58ToBytes,
  base64ToBytes,
  bytesToBase58,
  bytesToBase64,
  bytesToHex,
  bytesToHexPrefixed,
  hexToBytes,
};
