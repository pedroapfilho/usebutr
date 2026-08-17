import type { WalletAdapter } from "@usebutr/core";
import type { Eip6963ProviderInfo } from "@usebutr/evm";
import { buildEvmAdapter } from "@usebutr/evm";

import { WALLETCONNECT_CAPABILITIES } from "../capabilities";
import { createSingleNamespaceSession, missingNamespaceError } from "../session";

import type { WalletConnectNamespaceBuilder } from "./types";

const EVM_NAMESPACE = "eip155";

const DEFAULT_CHAINS: ReadonlyArray<string> = ["eip155:1"];

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
 * The paired `UniversalProvider` is already EIP-1193-shaped, so this reuses
 * `buildEvmAdapter` and overrides only `connect` / `disconnect`: those are
 * WC session lifecycle, not EIP-1193 method calls.
 */
const evmNamespace: WalletConnectNamespaceBuilder = {
  buildAdapter({ chains, icon, id, name, provider, session }) {
    const info: Eip6963ProviderInfo = {
      icon,
      name,
      rdns: id,
      uuid: id,
    };
    const base = buildEvmAdapter(info, provider);
    const wc =
      session ??
      createSingleNamespaceSession({
        chains,
        events: DEFAULT_EVENTS,
        methods: DEFAULT_METHODS,
        namespace: EVM_NAMESPACE,
        provider,
      });

    const adapter: WalletAdapter = {
      ...base,
      capabilities: WALLETCONNECT_CAPABILITIES,
      async connect(opts) {
        if (wc.hasNamespace(EVM_NAMESPACE)) {
          return;
        }
        if (opts?.silent === true && !wc.hasSession()) {
          throw new Error("No WalletConnect session for silent reconnect");
        }
        await wc.ensurePaired();
        if (!wc.hasNamespace(EVM_NAMESPACE)) {
          throw missingNamespaceError(EVM_NAMESPACE, "EVM");
        }
      },
      disconnect: () => wc.disconnect(),
      id,
      name,
    };
    return adapter;
  },
  caipPrefix: EVM_NAMESPACE,
  chainPlatform: "evm",
  defaultChains: DEFAULT_CHAINS,
  defaultEvents: DEFAULT_EVENTS,
  defaultMethods: DEFAULT_METHODS,
};

export { evmNamespace };
