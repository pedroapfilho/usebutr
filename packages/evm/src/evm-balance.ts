import { hexToBytes } from "@usebutr/core";

import type { Eip1193Provider } from "./eip1193";
import { requestString } from "./eip1193";

const HEX_PREFIX = "0x";
const ETH_DECIMALS = 18n;
const ERC20_BALANCE_OF_SELECTOR = "0x70a08231";
const ERC20_DECIMALS_SELECTOR = "0x313ce567";
const ERC20_SYMBOL_SELECTOR = "0x95d89b41";

/** A failed read must not render as a confident zero balance. */
const requireHex = (hex: string | null, label: string): string => {
  if (hex === null) {
    throw new Error(`Wallet returned a malformed ${label} response`);
  }
  return hex;
};

const formatUnits = (raw: bigint, decimals: number): string => {
  if (decimals === 0) {
    return raw.toString();
  }
  const unit = 10n ** BigInt(decimals);
  const integer = raw / unit;
  const remainder = raw % unit;
  if (remainder === 0n) {
    return integer.toString();
  }
  const fraction = remainder.toString().padStart(decimals, "0").replace(/0+$/v, "");
  return `${integer}.${fraction}`;
};

const formatEther = (wei: bigint): string => formatUnits(wei, Number(ETH_DECIMALS));

const padAddressForCall = (address: string): string =>
  address.replace(/^0x/v, "").toLowerCase().padStart(64, "0");

const decodeAbiString = (hex: string): string => {
  const clean = hex.startsWith(HEX_PREFIX) ? hex.slice(2) : hex;
  if (clean.length === 0) {
    return "";
  }
  if (clean.length >= 128) {
    const lengthHex = clean.slice(64, 128);
    const length = Number(BigInt(`0x${lengthHex}`));
    if (length > 0 && clean.length >= 128 + length * 2) {
      return new TextDecoder().decode(hexToBytes(clean.slice(128, 128 + length * 2)));
    }
  }
  const bytes = hexToBytes(clean.slice(0, 64));
  let end = bytes.length;
  while (end > 0 && bytes[end - 1] === 0) {
    end -= 1;
  }
  return new TextDecoder().decode(bytes.subarray(0, end));
};

const readEvmBalance = async (
  provider: Eip1193Provider,
  address: string,
  tokenAddress?: string,
) => {
  if (tokenAddress === undefined || tokenAddress === "") {
    const balanceHex = await requestString(provider, {
      method: "eth_getBalance",
      params: [address, "latest"],
    });
    const value = BigInt(requireHex(balanceHex, "eth_getBalance"));
    return {
      decimals: Number(ETH_DECIMALS),
      formatted: formatEther(value),
      symbol: "ETH",
      value,
    };
  }

  const [balanceHex, decimalsHex, symbolHex] = await Promise.all([
    requestString(provider, {
      method: "eth_call",
      params: [
        { data: `${ERC20_BALANCE_OF_SELECTOR}${padAddressForCall(address)}`, to: tokenAddress },
        "latest",
      ],
    }),
    requestString(provider, {
      method: "eth_call",
      params: [{ data: ERC20_DECIMALS_SELECTOR, to: tokenAddress }, "latest"],
    }),
    requestString(provider, {
      method: "eth_call",
      params: [{ data: ERC20_SYMBOL_SELECTOR, to: tokenAddress }, "latest"],
    }),
  ]);
  const value = BigInt(requireHex(balanceHex, "balanceOf()"));
  const decimals = Number(BigInt(requireHex(decimalsHex, "decimals()")));
  return {
    decimals,
    formatted: formatUnits(value, decimals),
    symbol: decodeAbiString(symbolHex ?? ""),
    value,
  };
};

export { formatEther, readEvmBalance };
