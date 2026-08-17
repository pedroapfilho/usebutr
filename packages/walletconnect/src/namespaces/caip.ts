import type { Account, ChainBase, WalletCapabilities } from "@usebutr/core";
import { buildAccount, logWarn } from "@usebutr/core";

import type { UniversalProviderLike } from "../loader";
import type { WalletConnectSession } from "../session";
import { createSingleNamespaceSession, missingNamespaceError } from "../session";

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

type Caip2 = {
  namespace: string;
  reference: string;
};

type Caip10 = Caip2 & {
  address: string;
  chainId: string;
};

/** Parse a CAIP-2 chain id (`<namespace>:<reference>`). */
const parseCaip2 = (chainId: string): Caip2 | null => {
  const colon = chainId.indexOf(":");
  if (colon <= 0 || colon !== chainId.lastIndexOf(":")) {
    return null;
  }
  const namespace = chainId.slice(0, colon);
  const reference = chainId.slice(colon + 1);
  return reference === "" ? null : { namespace, reference };
};

/** Parse a CAIP-10 account (`<namespace>:<reference>:<address>`). The
 *  chain id is load-bearing: a session can carry accounts on several
 *  chains at once, and an address is only valid on the chain it came
 *  with. CAIP-2 references and CAIP-10 addresses both exclude `:`, so a
 *  well-formed account has exactly three segments. */
const parseCaip10 = (caip10: string): Caip10 | null => {
  const lastColon = caip10.lastIndexOf(":");
  if (lastColon <= 0) {
    return null;
  }
  const chainId = caip10.slice(0, lastColon);
  const address = caip10.slice(lastColon + 1);
  const chain = parseCaip2(chainId);
  if (chain === null || address === "") {
    return null;
  }
  return { address, chainId, namespace: chain.namespace, reference: chain.reference };
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

/** Build a butr `ChainBase` from an already-parsed CAIP-2 chain. butr
 *  ships no chain-id → display-name map, so the wallet name is surfaced
 *  as the chain name and consumers overlay their own labels. */
const buildCaipChain = (
  chain: { chainId: string; namespace: string; reference: string },
  walletName: string,
): ChainBase => ({
  id: chain.chainId,
  name: walletName,
  namespace: chain.namespace,
  reference: chain.reference,
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
  /** Pairing state shared with the sibling adapters of the same
   *  factory call. Absent when the builder is driven on its own, in
   *  which case the core pairs for this namespace alone. */
  session?: WalletConnectSession;
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
  session,
}: CaipAdapterCoreInput): CaipAdapterCore => {
  const wc =
    session ?? createSingleNamespaceSession({ chains, events, methods, namespace, provider });

  const chainFromId = (chainId: string): ChainBase =>
    buildCaipChain(
      { chainId, namespace, reference: parseCaip2(chainId)?.reference ?? chainId },
      name,
    );

  let currentChain = chainFromId(chains[0] ?? fallbackChainId);

  const resolveAccounts = (): Array<Account> => {
    const accounts: Array<Account> = [];
    for (const caip10 of readNamespaceAccounts(provider, namespace)) {
      const parsed = parseCaip10(caip10);
      if (parsed === null) {
        logWarn(`[butr/walletconnect] ignoring malformed CAIP-10 account "${caip10}"`);
        continue;
      }
      accounts.push(buildAccount(parsed.address, buildCaipChain(parsed, name)));
    }
    return accounts;
  };

  const accountOnCurrentChain = (): Account | undefined =>
    resolveAccounts().find((account) => account.chain.id === currentChain.id);

  return {
    async connect(opts) {
      if (wc.hasNamespace(namespace)) {
        return;
      }
      if (opts?.silent === true && !wc.hasSession()) {
        throw new Error("No WalletConnect session for silent reconnect");
      }
      await wc.ensurePaired();
      if (!wc.hasNamespace(namespace)) {
        throw missingNamespaceError(namespace, platform);
      }
    },

    disconnect: () => wc.disconnect(),

    getAccount: () => Promise.resolve(accountOnCurrentChain() ?? null),

    getAccounts: () => Promise.resolve(resolveAccounts()),

    getSigner: () => Promise.resolve(provider),

    getTransactionReceipt: () => Promise.resolve({ status: "Pending" as const }),

    resolveAddress: (account) => {
      if (account) {
        return account.walletAddress;
      }
      const match = accountOnCurrentChain();
      if (match === undefined) {
        throw new Error(`No connected ${platform} account on chain "${currentChain.id}"`);
      }
      return match.walletAddress;
    },

    subscribe: () => () => {},

    switchChain: (chain) => {
      if (chain.namespace !== namespace) {
        throw new Error(
          `${label} WC adapter received non-${platform} chain "${chain.id}". Pass a chain with namespace "${namespace}".`,
        );
      }
      currentChain = chainFromId(chain.id);
      return Promise.resolve();
    },
  };
};

export { CAIP_WC_CAPABILITIES, createCaipAdapterCore };
