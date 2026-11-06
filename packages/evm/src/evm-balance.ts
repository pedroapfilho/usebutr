import type { Balance } from "@usebutr/core";
import { buildBalance, hexToBytes } from "@usebutr/core";

import type { Eip1193Provider } from "./eip1193";
import { requestString } from "./eip1193";

const HEX_PREFIX = "0x";
const ETH_DECIMALS = 18;
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

const formatEther = (wei: bigint): string => buildBalance(wei, ETH_DECIMALS, "ETH").formatted;

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
): Promise<Balance> => {
  if (tokenAddress === undefined || tokenAddress === "") {
    const balanceHex = await requestString(provider, {
      method: "eth_getBalance",
      params: [address, "latest"],
    });

    return buildBalance(BigInt(requireHex(balanceHex, "eth_getBalance")), ETH_DECIMALS, "ETH");
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

  return buildBalance(value, decimals, decodeAbiString(symbolHex ?? ""));
};

export { formatEther, readEvmBalance };
