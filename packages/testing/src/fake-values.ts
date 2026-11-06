import type { ChainPlatform } from "@usebutr/core";

/** Plausibly shaped per platform: a wrong-looking address is a common
 *  source of confusion when a snapshot test fails. */
const DEFAULT_ADDRESSES: Readonly<Record<ChainPlatform, string>> = {
  bitcoin: "bc1qfake000000000000000000000000000000000",
  evm: "0x0000000000000000000000000000000000000001",
  polkadot: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  sui: "0x0000000000000000000000000000000000000000000000000000000000000001",
  svm: "So11111111111111111111111111111111111111112",
};

/** The native asset each platform's `getBalance` reports. */
const NATIVE_ASSETS: Readonly<Record<ChainPlatform, { decimals: number; symbol: string }>> = {
  bitcoin: { decimals: 8, symbol: "BTC" },
  evm: { decimals: 18, symbol: "ETH" },
  polkadot: { decimals: 10, symbol: "DOT" },
  sui: { decimals: 9, symbol: "SUI" },
  svm: { decimals: 9, symbol: "SOL" },
};

/** Distinct bytes on every call, so two signatures or hashes from one fake
 *  never compare equal by accident. */
const createByteSource = () => {
  let sequence = 0;

  return (length: number): Uint8Array => {
    sequence += 1;

    return Uint8Array.from({ length }, (_, index) => (sequence + index) % 256);
  };
};

export { createByteSource, DEFAULT_ADDRESSES, NATIVE_ASSETS };
