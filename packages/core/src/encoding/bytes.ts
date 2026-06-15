/**
 * Shared byte-encoding helpers for the connector packages.
 *
 * These functions sit directly on the signing/address path of every
 * chain. They used to be hand-reimplemented in ~10 connector files; a
 * single tested module removes the drift surface (a `padStart` omission
 * or base64 variant mismatch corrupts signatures/addresses for one chain
 * only, and the divergence is invisible because the copies look "the
 * same").
 *
 * Hex prefixing diverges across chains, so the module exposes **explicit
 * variants** rather than one function:
 * - {@link bytesToHex} returns bare hex (Bitcoin, Ledger).
 * - {@link bytesToHexPrefixed} returns `0x`-prefixed hex (EVM, Polkadot).
 * - {@link hexToBytes} tolerantly strips an optional `0x` (all callers).
 */

/** Bare lowercase hex — no `0x` prefix (Bitcoin, Ledger). */
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

export { base64ToBytes, bytesToBase64, bytesToHex, bytesToHexPrefixed, hexToBytes };
