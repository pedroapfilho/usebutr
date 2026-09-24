import type { EvmAdapter } from "@usebutr/core";
import { EVM_CHAINS } from "@usebutr/core";
import type { Eip1193Listener, Eip1193Provider, Eip1193Value } from "@usebutr/evm";
import { buildEvmAdapter, chainIdDecimalToHex } from "@usebutr/evm";

import type { UniversalProviderLike } from "../loader";
import { createSingleNamespaceSession } from "../session";

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

const EVM_ADDRESS = /^0x[\da-f]{40}$/iv;

type EventArgs = ReadonlyArray<Eip1193Value | undefined>;

/** UniversalProvider emits every namespace's `accountsChanged` (bare
 *  addresses) and `chainChanged` (bare reference) on one channel, so format
 *  is the only eip155 signal: a 20-byte `0x` address (Sui's are 32 bytes),
 *  a decimal or hex chain id. `null` drops the event. */
const toEip155Event = (event: string, args: EventArgs): EventArgs | null => {
  const [value] = args;
  if (event === "accountsChanged") {
    const addresses = Array.isArray(value)
      ? value.filter((item) => typeof item === "string" && EVM_ADDRESS.test(item))
      : [];
    return addresses.length > 0 ? [addresses] : null;
  }
  if (event !== "chainChanged") {
    return args;
  }
  if (typeof value === "number" && Number.isSafeInteger(value)) {
    return [chainIdDecimalToHex(value.toString(10))];
  }
  if (typeof value === "string" && /^\d+$/v.test(value)) {
    return [chainIdDecimalToHex(value)];
  }
  return typeof value === "string" && /^0x[\da-f]+$/iv.test(value) ? [value] : null;
};

/** The session's eip155 side as a plain EIP-1193 provider. Every request
 *  names the eip155 provider's current chain, which `eth_chainId` answers
 *  (as a number) whatever eip155 chain it is sent to, `anchorChainId`
 *  included. */
const createEip155Provider = (
  provider: UniversalProviderLike,
  anchorChainId: string,
): Eip1193Provider => {
  const readReference = async (): Promise<string> => {
    const chainId = await provider.request({ method: "eth_chainId" }, anchorChainId);
    if (typeof chainId !== "number" && typeof chainId !== "string") {
      throw new TypeError("WalletConnect returned a malformed eth_chainId response");
    }
    return BigInt(chainId).toString(10);
  };

  // Keyed by event, then by the caller's listener, so `removeListener`
  // finds the filtering wrapper it registered.
  const wrappers = new Map<string, Map<Eip1193Listener, Eip1193Listener>>();

  return {
    on: (event, listener) => {
      const wrapper: Eip1193Listener = (...args) => {
        const forwarded = toEip155Event(event, args);
        if (forwarded !== null) {
          listener(...forwarded);
        }
      };
      const byListener = wrappers.get(event) ?? new Map<Eip1193Listener, Eip1193Listener>();
      byListener.set(listener, wrapper);
      wrappers.set(event, byListener);
      provider.on(event, wrapper);
    },
    removeListener: (event, listener) => {
      const wrapper = wrappers.get(event)?.get(listener);
      if (wrapper !== undefined) {
        wrappers.get(event)?.delete(listener);
        provider.removeListener(event, wrapper);
      }
    },
    async request(args) {
      const reference = await readReference();
      return args.method === "eth_chainId"
        ? chainIdDecimalToHex(reference)
        : provider.request(args, `${EVM_NAMESPACE}:${reference}`);
    },
  };
};

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
