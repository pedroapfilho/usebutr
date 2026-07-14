import type { WalletAdapter } from "@usebutr/core";
import { logWarn } from "@usebutr/core";
import type { Eip1193Provider, Eip6963ProviderInfo } from "@usebutr/evm";
import { buildEvmAdapter } from "@usebutr/evm";

import { WALLETCONNECT_CAPABILITIES } from "../capabilities";

import type { WalletConnectNamespaceBuilder } from "./types";

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
 * EVM (CAIP `eip155:*`) namespace builder. Wraps the paired
 * `UniversalProvider` as an EIP-1193 provider and runs the result
 * through `buildEvmAdapter`, which gives us every EIP-1193 method
 * (request, on/removeListener, accountsChanged/chainChanged) wired
 * to butr's `WalletAdapter` contract.
 *
 * Overrides `connect` (the WC namespace handshake) and `disconnect`
 * (kill the session) because those are session-lifecycle concerns,
 * not EIP-1193 method calls.
 */
const evmNamespace: WalletConnectNamespaceBuilder = {
  buildAdapter({ chains, icon, id, name, provider }) {
    const info: Eip6963ProviderInfo = {
      icon,
      name,
      rdns: id,
      uuid: id,
    };
    const base = buildEvmAdapter(info, provider as Eip1193Provider);

    const adapter: WalletAdapter = {
      ...base,
      capabilities: WALLETCONNECT_CAPABILITIES,
      async connect(opts) {
        // Live session across reloads → skip the pairing handshake.
        if (provider.session) {
          return;
        }
        if (opts?.silent) {
          throw new Error("No WalletConnect session for silent reconnect");
        }
        await provider.connect({
          namespaces: {
            eip155: {
              chains: [...chains],
              events: [...DEFAULT_EVENTS],
              methods: [...DEFAULT_METHODS],
            },
          },
        });
      },
      async disconnect() {
        if (!provider.session) {
          return;
        }
        try {
          await provider.disconnect();
        } catch (error) {
          // The relay may already have dropped the session (mobile
          // wallet uninstalled, etc.). Don't propagate; butr's
          // reducer marks the wallet disconnected on its side
          logWarn("[butr/walletconnect] disconnect threw:", error);
        }
      },
      id,
      name,
    };
    return adapter;
  },
  caipPrefix: "eip155",
  chainPlatform: "evm",
  defaultChains: DEFAULT_CHAINS,
  defaultEvents: DEFAULT_EVENTS,
  defaultMethods: DEFAULT_METHODS,
};

export { evmNamespace };
