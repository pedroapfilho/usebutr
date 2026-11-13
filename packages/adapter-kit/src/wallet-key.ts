/**
 * The `walletKey` of a wallet named `name`: lower-case letters and digits,
 * without the word "wallet", so "OKX Wallet" on one channel and "OKX" on
 * another are the same wallet.
 */
const toWalletKey = (name: string): string => {
  const lower = name.toLowerCase();
  const key = lower.replaceAll(/\bwallet\b|[^a-z\d]/gv, "");

  return key === "" ? lower.replaceAll(/[^a-z\d]/gv, "") : key;
};

export { toWalletKey };
