import type { EvmAdapter } from "@usebutr/core";
import { EVM_CHAINS } from "@usebutr/core";
import type { ObservedCall } from "@usebutr/testing/contract";
import { describeAdapterContract } from "@usebutr/testing/contract";

import type { Eip1193RequestArgs } from "../eip1193";
import { buildEvmAdapter } from "../eip6963-adapter";

import { createMockProvider } from "./mock-provider";

const KNOWN_CHAINS = new Set(["0x1", "0x89"]);

const switchParams = (params: Eip1193RequestArgs["params"]): string | undefined => {
  const [first] = Array.isArray(params) ? params : [];
  return typeof first === "object" && first !== null && "chainId" in first
    ? String(first.chainId)
    : undefined;
};

describeAdapterContract<EvmAdapter>({
  addresses: [
    "0x52908400098527886E0F7030069857D2E4169EE7",
    "0x8617E340B3D01FA5F11F306F4090FD50E238070D",
  ],
  chain: EVM_CHAINS.ethereum,
  connect: (addresses) => {
    const provider = createMockProvider();
    const calls: Array<ObservedCall> = [];
    let chainIdHex = "0x1";
    const currentChain = () => `eip155:${BigInt(chainIdHex).toString(10)}`;
    provider.setHandler("eth_accounts", () => [...addresses]);
    provider.setHandler("eth_chainId", () => chainIdHex);
    provider.setHandler("wallet_switchEthereumChain", (params) => {
      const chainId = switchParams(params);
      if (chainId === undefined || !KNOWN_CHAINS.has(chainId)) {
        throw Object.assign(new Error("Unrecognized chain ID"), { code: 4902 });
      }
      chainIdHex = chainId;
      provider.emit("chainChanged", chainId);
      return null;
    });
    provider.setHandler("personal_sign", (params) => {
      calls.push({ address: Array.isArray(params) ? String(params[1]) : undefined });
      return "0x01";
    });
    provider.setHandler("eth_sendTransaction", (params) => {
      const [tx] = Array.isArray(params) ? params : [];
      const from = typeof tx === "object" && tx !== null && "from" in tx ? tx.from : undefined;
      calls.push({ address: String(from), chain: currentChain() });
      return "0xhash";
    });
    return Promise.resolve({
      adapter: buildEvmAdapter(
        { icon: "", name: "Contract EVM Wallet", rdns: "io.contract.wallet", uuid: "uuid" },
        provider,
      ),
      lastCall: () => calls.at(-1),
      reportAccounts: (reported) => {
        provider.emit("accountsChanged", [...reported]);
      },
    });
  },
  move: "switch",
  name: "EIP-6963",
  reachable: EVM_CHAINS.polygon,
  transactions: {
    sendTx: (adapter, options) =>
      adapter.sendTx?.({ to: "0x0000000000000000000000000000000000000001" }, options),
  },
  unreachable: EVM_CHAINS.base,
});
