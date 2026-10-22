const BYTES_PREFIX = new TextEncoder().encode("<Bytes>");
const BYTES_SUFFIX = new TextEncoder().encode("</Bytes>");

/** Substrate wallets sign raw messages wrapped in `<Bytes>…</Bytes>`, so a
 *  signed message can never pass for an extrinsic. Every transport hands the
 *  wallet these bytes and reports them as `signedMessage`. */
const wrapBytes = (message: Uint8Array): Uint8Array => {
  const out = new Uint8Array(BYTES_PREFIX.length + message.length + BYTES_SUFFIX.length);
  out.set(BYTES_PREFIX, 0);
  out.set(message, BYTES_PREFIX.length);
  out.set(BYTES_SUFFIX, BYTES_PREFIX.length + message.length);

  return out;
};

export { wrapBytes };
