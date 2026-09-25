import type { EvmAdapter } from "@usebutr/core";
import { EVM_CHAINS } from "@usebutr/core";
import { buildEvmAdapter } from "@usebutr/evm";

import { createSingleNamespaceSession } from "../session";

import { createEip155Provider } from "./eip155-provider";
import type { WalletConnectNamespaceBuilder } from "./types";

const EVM_NAMESPACE = "eip155";

const DEFAULT_CHAINS: ReadonlyArray<string> = [EVM_CHAINS.ethereum.id];

const DEFAULT_METHODS: ReadonlyArray<string> = [
  "eth_sendTransaction",
  "eth_accounts",
  "eth_chainId",
  "eth_getBalance",
  "eth_getTransactionReceipt",
  "personal_sign",
  "wallet_switchEthereumChain",
];

const DEFAULT_EVENTS: ReadonlyArray<string> = ["accountsChanged", "chainChanged", "disconnect"];

/**
 * `buildEvmAdapter` minus what the session owns: pairing replaces `connect`
 * and `disconnect`, and WC has no EIP-2255 account picker (more accounts
 * means re-pairing), so there is no `requestAccounts`.
 */
const evmNamespace: WalletConnectNamespaceBuilder<EvmAdapter> = {
  buildAdapter({ chains, icon, id, name, provider, session }) {
    const wc =
      session ??
      createSingleNamespaceSession({
        chains,
        events: DEFAULT_EVENTS,
        methods: DEFAULT_METHODS,
        namespace: EVM_NAMESPACE,
        provider,
      });
    const eip155 = createEip155Provider(provider, chains[0] ?? EVM_CHAINS.ethereum.id);
    const {
      connect: _connect,
      disconnect: _disconnect,
      requestAccounts: _requestAccounts,
      ...adapter
    } = buildEvmAdapter({ icon, name, rdns: id, uuid: id }, eip155);
    return { ...adapter, ...wc.lifecycle(EVM_NAMESPACE, "EVM") };
  },
  caipPrefix: EVM_NAMESPACE,
  chainPlatform: "evm",
  defaultChains: DEFAULT_CHAINS,
  defaultEvents: DEFAULT_EVENTS,
  defaultMethods: DEFAULT_METHODS,
};

export { evmNamespace };
