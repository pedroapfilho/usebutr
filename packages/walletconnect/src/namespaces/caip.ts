import type { Account, ChainBase, WalletCapabilities } from "@usebutr/core";
import { buildAccount, logWarn } from "@usebutr/core";

import type { UniversalProviderLike } from "../loader";

/**
 * Runtime capability flags shared by every CAIP-based WalletConnect v2
 * namespace (`solana`, `sui`, `bip122`). All three advertise the same
 * surface at pairing time: sign/send RPC methods are requested, while
 * balance/receipt reads, account requests, sign-in and wallet-side
 * subscriptions are not available over WC today. Per-platform builders
 * spread this into their own exported constant so each keeps a distinct
 * object identity.
 */
const CAIP_WC_CAPABILITIES: WalletCapabilities = {
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: true,
  signIn: false,
  signMessage: true,
  signTransaction: true,
  subscribe: false,
  switchAccount: false,
  switchChain: true,
};

/** Parse a CAIP-10 string (`<namespace>:<chain>:<address>`) into its
 *  address segment. The address is the trailing part after the last `:`. */
const parseCaip10Address = (caip10: string): string => {
  const lastColon = caip10.lastIndexOf(":");
  return lastColon === -1 ? caip10 : caip10.slice(lastColon + 1);
};

/** Read the accounts of one namespace from the live WC session without
 *  depending on the `@walletconnect/universal-provider` types being
 *  present at build time (the dep is optional). */
const readNamespaceAccounts = (
  provider: UniversalProviderLike,
  namespace: string,
): ReadonlyArray<string> => {
  return provider.session?.namespaces?.[namespace]?.accounts ?? [];
};

/** Build a butr `ChainBase` for a CAIP-2 chain id. butr ships no
 *  chain-id → display-name map, so the wallet name is surfaced as the
 *  chain name and consumers overlay their own labels. `namespace` is the
 *  CAIP prefix without its colon (`solana`, `sui`, `bip122`). */
const buildCaipChain = (chainId: string, walletName: string, namespace: string): ChainBase => ({
  id: chainId,
  name: walletName,
  namespace,
  reference: chainId.slice(namespace.length + 1),
});

type CaipAdapterCoreInput = {
  /** Chains advertised to the wallet at pairing time. */
  chains: ReadonlyArray<string>;
  events: ReadonlyArray<string>;
  /** Chain id to fall back to when `chains` is empty. */
  fallbackChainId: string;
  /** How this adapter names itself in errors (`SVM`, `Sui`, `Bitcoin`). */
  label: string;
  methods: ReadonlyArray<string>;
  name: string;
  /** CAIP-2 prefix without its colon (`solana`, `sui`, `bip122`). */
  namespace: string;
  /** How the chain family reads in errors (`Solana`, `Sui`, `Bitcoin`). */
  platform: string;
  provider: UniversalProviderLike;
};

type CaipAdapterCore = {
  connect: (opts?: { silent?: boolean }) => Promise<void>;
  disconnect: () => Promise<void>;
  getAccount: () => Promise<Account | null>;
  getAccounts: () => Promise<Array<Account>>;
  getSigner: () => Promise<unknown>;
  getTransactionReceipt: () => Promise<{ status: "Pending" }>;
  /** Pick the WC account address to route a call through. Falls back
   *  to the first session account when the caller doesn't specify one.
   *  Not part of the adapter surface; namespace builders use it to
   *  address their own RPC calls. */
  resolveAddress: (account?: Account) => string;
  subscribe: () => () => void;
  switchChain: (chain: ChainBase) => Promise<void>;
};

/**
 * Session plumbing every CAIP namespace builder repeats: the pairing
 * handshake, session teardown, CAIP-10 account reads off the live
 * session, and the local-only chain switch. Builders keep only what
 * genuinely differs per platform: RPC method names, response decoding,
 * and balance units.
 */
const createCaipAdapterCore = ({
  chains,
  events,
  fallbackChainId,
  label,
  methods,
  name,
  namespace,
  platform,
  provider,
}: CaipAdapterCoreInput): CaipAdapterCore => {
  let currentChainId = chains[0] ?? fallbackChainId;

  const currentChain = (): ChainBase => buildCaipChain(currentChainId, name, namespace);

  const resolveAccounts = (): Array<Account> => {
    const chain = currentChain();
    return readNamespaceAccounts(provider, namespace).map((caip10) =>
      buildAccount(parseCaip10Address(caip10), chain),
    );
  };

  return {
    async connect(opts) {
      if (provider.session) {
        return;
      }
      if (opts?.silent === true) {
        throw new Error("No WalletConnect session for silent reconnect");
      }
      await provider.connect({
        namespaces: {
          [namespace]: {
            chains: [...chains],
            events: [...events],
            methods: [...methods],
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
        logWarn("[butr/walletconnect] disconnect threw:", error);
      }
    },

    getAccount: () => {
      const first = resolveAccounts()[0] ?? null;
      return Promise.resolve(first);
    },

    getAccounts: () => Promise.resolve(resolveAccounts()),

    getSigner: () => Promise.resolve(provider),

    getTransactionReceipt: () => Promise.resolve({ status: "Pending" as const }),

    resolveAddress: (account) => {
      if (account) {
        return account.walletAddress;
      }
      const first = resolveAccounts()[0];
      if (first === undefined) {
        throw new Error(`No connected ${platform} account`);
      }
      return first.walletAddress;
    },

    subscribe: () => () => {},

    switchChain: (chain) => {
      if (chain.namespace !== namespace) {
        throw new Error(
          `${label} WC adapter received non-${platform} chain "${chain.id}". Pass a chain with namespace "${namespace}".`,
        );
      }
      currentChainId = chain.id;
      return Promise.resolve();
    },
  };
};

export { CAIP_WC_CAPABILITIES, createCaipAdapterCore };
