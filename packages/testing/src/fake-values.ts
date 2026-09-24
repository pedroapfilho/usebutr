import type { ChainBase, ChainPlatform } from "@usebutr/core";
import { BITCOIN_CHAINS, EVM_CHAINS, POLKADOT_CHAINS, SUI_CHAINS, SVM_CHAINS } from "@usebutr/core";

/** Where generated accounts live unless a test picks another chain. */
const DEFAULT_CHAINS: Readonly<Record<ChainPlatform, ChainBase>> = {
  bitcoin: BITCOIN_CHAINS.mainnet,
  evm: EVM_CHAINS.ethereum,
  polkadot: POLKADOT_CHAINS.polkadot,
  sui: SUI_CHAINS.mainnet,
  svm: SVM_CHAINS.mainnet,
};

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

/** Base units to a decimal string without trailing zeros: 1500000000n at 9
 *  decimals is "1.5". */
const formatUnits = (value: bigint, decimals: number): string => {
  const base = 10n ** BigInt(decimals);
  const fraction = (value % base).toString().padStart(decimals, "0").replace(/0+$/v, "");
  const whole = (value / base).toString();
  return fraction === "" ? whole : `${whole}.${fraction}`;
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

export { createByteSource, DEFAULT_ADDRESSES, DEFAULT_CHAINS, formatUnits, NATIVE_ASSETS };
