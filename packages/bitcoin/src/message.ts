const UTF8 = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });

/**
 * The string a text-only wallet (Unisat, sats-connect, WalletConnect) signs
 * the UTF-8 encoding of. Anything but valid UTF-8 would be signed as other
 * bytes, so it is rejected.
 */
const bitcoinMessageText = (message: Uint8Array, wallet: string): string => {
  try {
    return UTF8.decode(message);
  } catch (error) {
    throw new TypeError(
      `Wallet ${wallet} signs text, and this message is not valid UTF-8; sign its bytes with a Wallet Standard or Ledger wallet`,
      { cause: error },
    );
  }
};

export { bitcoinMessageText };
