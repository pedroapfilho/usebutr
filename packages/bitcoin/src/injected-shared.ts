import type { Account, ChainBase } from "@usebutr/core";

/**
 * Generic Bitcoin wallet icon — same purse SVG style as the EVM
 * package, recoloured. Inline so the picker doesn't flash.
 */
const GENERIC_BITCOIN_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2Y3OTMxYSIgc3Ryb2tlPSJub25lIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjx0ZXh0IHg9IjEyIiB5PSIxNyIgZm9udC1mYW1pbHk9InNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QjwvdGV4dD48L3N2Zz4=";

const HEX_PREFIX = "0x";

const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.startsWith(HEX_PREFIX) ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
};

const bytesToHex = (bytes: Uint8Array): string => {
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
};

const utf8Decode = (bytes: Uint8Array): string => new TextDecoder().decode(bytes);

const base64ToBytes = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.codePointAt(i) ?? 0;
  }
  return out;
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCodePoint(byte);
  }
  return btoa(binary);
};

const buildInjectedAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address}`,
  walletAddress: address,
});

export {
  base64ToBytes,
  buildInjectedAccount,
  bytesToBase64,
  bytesToHex,
  GENERIC_BITCOIN_ICON,
  hexToBytes,
  utf8Decode,
};
