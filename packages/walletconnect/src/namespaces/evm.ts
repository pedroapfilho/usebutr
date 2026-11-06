import type { EvmAdapter } from "@usebutr/core";
import { CHAIN_NAMESPACES } from "@usebutr/core";
import { createEip1193Core } from "@usebutr/evm";

import { createEip155Provider } from "./eip155-provider";
import type { WalletConnectNamespaceBuilder } from "./types";

const METHODS: ReadonlyArray<string> = [
  "eth_sendTransaction",
  "eth_accounts",
  "eth_chainId",
  "eth_getBalance",
  "eth_getTransactionReceipt",
  "personal_sign",
  "wallet_switchEthereumChain",
];

const EVENTS: ReadonlyArray<string> = ["accountsChanged", "chainChanged", "disconnect"];

/**
 * The EIP-1193 core on the session's eip155 side. Pairing is `connect` and
 * `disconnect`, and WC has no EIP-2255 account picker (more accounts means
 * re-pairing), so there is no `requestAccounts`.
 */
const evmNamespace: WalletConnectNamespaceBuilder<EvmAdapter> = {
  buildAdapter({ chains, icon, id, name, provider, session }) {
    const eip155 = createEip155Provider(provider, chains[0]);

    return {
      ...createEip1193Core({ icon, id, name }, eip155),
      ...session.lifecycle(CHAIN_NAMESPACES.evm, name),
    };
  },
  chainPlatform: "evm",
  events: EVENTS,
  methods: METHODS,
};

export { evmNamespace };
