import type {
  Account,
  ChainBase,
  Connector,
  TransactionOptions,
  WalletSigner,
} from "@usebutr/core";
import {
  buildAccount,
  createConnectorEmitter,
  createRoutedChainTarget,
  logWarn,
  resolveChain,
} from "@usebutr/core";
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

  if (
    namespace === undefined ||
    namespace === "" ||
    reference === undefined ||
    reference === "" ||
    address === undefined ||
    address === "" ||
    rest.length > 0
  ) {
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
  /** How the platform reads in session errors: `Solana`, `Sui`, `Bitcoin`. */
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
   *  and the address it acts as (`options.account`, else the first session
   *  account on that chain). Rejections are the chain target's. */
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

  const toButrId = (sessionId: string) => fromSessionId.get(sessionId) ?? sessionId;
  const chains = requestedChains.map(toSessionId);

  const wc =
    session ?? createSingleNamespaceSession({ chains, events, methods, namespace, provider });

  let currentChainId = chains[0] ?? defaultChainId;

  const sessionAccounts = () => {
    const parsed: Array<{ address: string; chainId: string }> = [];

    for (const caip10 of provider.session?.namespaces?.[namespace]?.accounts ?? []) {
      const account = parseCaip10(caip10);

      if (account === null) {
        logWarn(`[butr/walletconnect] ignoring malformed CAIP-10 account "${caip10}"`);
      } else {
        parsed.push(account);
      }
    }

    return parsed;
  };

  const accountsOn = (chainId: string): Array<Account> => {
    const chain = resolveChain(toButrId(chainId), knownChains);
    const accounts: Array<Account> = [];

    for (const account of sessionAccounts()) {
      if (account.chainId === chainId) {
        accounts.push(buildAccount(account.address, chain));
      }
    }

    return accounts;
  };

  const target = createRoutedChainTarget({
    advertised: () => sessionAccounts().map((account) => toButrId(account.chainId)),
    current: () => toButrId(currentChainId),
    namespace,
    wallet: name,
  });

  const resolveChainId = (chain?: ChainBase) => toSessionId(target.chain(chain));

  const resolveTarget = (options?: TransactionOptions) => {
    const chainId = resolveChainId(options?.chain);
    const exposed = accountsOn(chainId).map((account) => account.walletAddress);

    return { address: target.account(exposed, options?.account), chainId };
  };

  const emitter = createConnectorEmitter();

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
      const unsubscribe = emitter.subscribe(listener);

      const onSessionDeleted: Eip1193Listener = () => {
        listener({ type: "disconnected" });
      };

      provider.on("disconnect", onSessionDeleted);

      return () => {
        unsubscribe();
        provider.removeListener("disconnect", onSessionDeleted);
      };
    },
    // WalletConnect routes every call by chain, so switching only re-points
    // butr's calls; with one configured chain there is nowhere to go.
    ...(chains.length > 1 && {
      switchChain: async (chain: ChainBase) => {
        currentChainId = resolveChainId(chain);
        emitter.emit({ accounts: accountsOn(currentChainId), type: "accountsChanged" });
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
