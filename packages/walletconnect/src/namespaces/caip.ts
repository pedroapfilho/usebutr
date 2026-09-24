import type {
  Account,
  ChainBase,
  Connector,
  ConnectorEvent,
  TransactionOptions,
  WalletSigner,
} from "@usebutr/core";
import { buildAccount, logWarn, resolveChain } from "@usebutr/core";
import type { Eip1193Listener, Eip1193Object, Eip1193Value } from "@usebutr/evm";

import { createSingleNamespaceSession } from "../session";

import type { NamespaceAdapterInput } from "./types";

/** Parse a CAIP-10 account (`<namespace>:<reference>:<address>`). The
 *  chain id is load-bearing: a session can carry accounts on several
 *  chains at once, and an address is only valid on the chain it came
 *  with. CAIP-2 references and CAIP-10 addresses both exclude `:`, so a
 *  well-formed account has exactly three segments. */
const parseCaip10 = (caip10: string): { address: string; chainId: string } | null => {
  const [namespace, reference, address, ...rest] = caip10.split(":");
  if (!namespace || !reference || !address || rest.length > 0) {
    return null;
  }
  return { address, chainId: `${namespace}:${reference}` };
};

type CaipAdapterCoreInput = NamespaceAdapterInput & {
  /** butr chain id → session chain id, where the two schemes differ. */
  chainAliases?: ReadonlyMap<string, string>;
  /** Chain when `chains` is empty. */
  defaultChainId: string;
  events: ReadonlyArray<string>;
  /** The platform's chain registry, for chain names. */
  knownChains: ReadonlyArray<ChainBase>;
  /** How the platform reads in errors: `Solana`, `Sui`, `Bitcoin`. */
  label: string;
  methods: ReadonlyArray<string>;
  /** CAIP-2 prefix without its colon (`solana`, `sui`, `bip122`). */
  namespace: string;
};

type CaipConnector = Pick<Connector, "connect" | "getAccounts" | "icon" | "id" | "name"> &
  Required<Pick<Connector, "disconnect" | "subscribe">> & {
    getSigner: () => Promise<WalletSigner>;
    switchChain?: (chain: ChainBase) => Promise<void>;
  };

type CaipAdapterCore = {
  /** Spread into the adapter. */
  base: CaipConnector;
  /** Sends one RPC call to `chainId`, the chain `resolveTarget` picked. */
  request: (
    method: string,
    params: Eip1193Object,
    chainId: string,
  ) => Promise<Eip1193Value | undefined>;
  /** The chain a call goes to (`options.chain`, else the adapter's chain)
   *  and the address it acts as (`options.account`, else the first
   *  session account on that chain). Throws for a chain from another
   *  namespace, a chain the session did not approve, or an account it does
   *  not expose there. */
  resolveTarget: (options?: TransactionOptions) => { address: string; chainId: string };
};

/**
 * Session plumbing shared by the Solana, Sui and Bitcoin namespaces. A
 * session approves chains by carrying accounts on them, so the session's
 * CAIP-10 accounts are the single source for both accounts and chains.
 */
const createCaipAdapterCore = ({
  chainAliases = new Map(),
  chains: requestedChains,
  defaultChainId,
  events,
  icon,
  id,
  knownChains,
  label,
  methods,
  name,
  namespace,
  provider,
  session,
}: CaipAdapterCoreInput): CaipAdapterCore => {
  // The session speaks its own chain ids; butr's accounts and callers speak
  // the registry's, so translate at this boundary only.
  const toSessionId = (chainId: string) => chainAliases.get(chainId) ?? chainId;
  const fromSessionId = new Map(
    [...chainAliases].map(([butrId, sessionId]) => [sessionId, butrId]),
  );
  const toChain = (sessionId: string) =>
    resolveChain(fromSessionId.get(sessionId) ?? sessionId, knownChains);
  const chains = requestedChains.map(toSessionId);

  const wc =
    session ?? createSingleNamespaceSession({ chains, events, methods, namespace, provider });

  let currentChainId = chains[0] ?? defaultChainId;

  const accountsOn = (chainId: string): Array<Account> => {
    const accounts: Array<Account> = [];
    for (const caip10 of provider.session?.namespaces?.[namespace]?.accounts ?? []) {
      const parsed = parseCaip10(caip10);
      if (parsed === null) {
        logWarn(`[butr/walletconnect] ignoring malformed CAIP-10 account "${caip10}"`);
      } else if (parsed.chainId === chainId) {
        accounts.push(buildAccount(parsed.address, toChain(chainId)));
      }
    }
    return accounts;
  };

  const resolveChainId = (chain?: ChainBase): string => {
    if (chain === undefined) {
      return currentChainId;
    }
    if (chain.namespace !== namespace) {
      throw new Error(
        `${label} WalletConnect adapter received non-${label} chain "${chain.id}". Pass a chain with namespace "${namespace}".`,
      );
    }
    const sessionId = toSessionId(chain.id);
    if (accountsOn(sessionId).length === 0) {
      throw new Error(`The WalletConnect session did not approve ${label} chain "${chain.id}".`);
    }
    return sessionId;
  };

  const resolveTarget = (options?: TransactionOptions) => {
    const chainId = resolveChainId(options?.chain);
    const exposed = accountsOn(chainId);
    const wanted = options?.account?.walletAddress;
    const match =
      wanted === undefined ? exposed[0] : exposed.find((a) => a.walletAddress === wanted);
    if (match === undefined) {
      throw new Error(
        wanted === undefined
          ? `No connected ${label} account on chain "${chainId}"`
          : `The WalletConnect session does not expose ${label} account ${wanted} on chain "${chainId}"`,
      );
    }
    return { address: match.walletAddress, chainId };
  };

  const listeners = new Set<(event: ConnectorEvent) => void>();

  const base: CaipConnector = {
    ...wc.lifecycle(namespace, label),
    // Accounts on other approved chains surface after `switchChain`: the
    // pool keeps one chain per wallet.
    getAccounts: () => Promise.resolve(accountsOn(currentChainId)),
    getSigner: () => Promise.resolve({ chainId: currentChainId, kind: "walletconnect", provider }),
    icon,
    id,
    name,
    // UniversalProvider emits `disconnect` only when the wallet deletes the
    // session (not for our own `disconnect()`); it does not observe expiry.
    subscribe: (listener) => {
      listeners.add(listener);
      const onSessionDeleted: Eip1193Listener = () => {
        listener({ type: "disconnected" });
      };
      provider.on("disconnect", onSessionDeleted);
      return () => {
        listeners.delete(listener);
        provider.removeListener("disconnect", onSessionDeleted);
      };
    },
    // WalletConnect routes every call by chain, so switching only re-points
    // butr's calls; with one configured chain there is nowhere to go.
    ...(chains.length > 1 && {
      switchChain: async (chain: ChainBase) => {
        currentChainId = resolveChainId(chain);
        // An approved chain always carries accounts, so this is never empty.
        const accounts = accountsOn(currentChainId);
        for (const listener of listeners) {
          listener({ accounts, type: "accountsChanged" });
        }
        await Promise.resolve();
      },
    }),
  };

  return {
    base,
    request: (method, params, chainId) => provider.request({ method, params }, chainId),
    resolveTarget,
  };
};

export { createCaipAdapterCore };
