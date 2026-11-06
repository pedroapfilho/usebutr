import type {
  Account,
  ChainBase,
  ChainPlatform,
  Connector,
  TransactionOptions,
  WalletSigner,
} from "@usebutr/core";
import {
  buildAccount,
  CHAIN_NAMESPACES,
  CHAINS_BY_PLATFORM,
  createConnectorEmitter,
  createRoutedChainTarget,
  logWarn,
  resolveChain,
} from "@usebutr/core";
import type { Eip1193Listener, Eip1193Object, Eip1193Value } from "@usebutr/evm";

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
  /** Picks the CAIP-2 namespace and the chain registry. */
  platform: ChainPlatform;
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
  chains,
  icon,
  id,
  name,
  platform,
  provider,
  session,
}: CaipAdapterCoreInput): CaipAdapterCore => {
  const namespace = CHAIN_NAMESPACES[platform];
  const knownChains = CHAINS_BY_PLATFORM[platform];
  let [currentChainId] = chains;

  const sessionAccounts = () => {
    const parsed: Array<{ address: string; chainId: string }> = [];

    for (const caip10 of provider.session?.namespaces?.[namespace]?.accounts ?? []) {
      const account = parseCaip10(caip10);

      if (account === null) {
        logWarn(`WalletConnect: ignoring malformed CAIP-10 account "${caip10}"`);
      } else {
        parsed.push(account);
      }
    }

    return parsed;
  };

  const accountsOn = (chainId: string): Array<Account> => {
    const chain = resolveChain(chainId, knownChains);
    const accounts: Array<Account> = [];

    for (const account of sessionAccounts()) {
      if (account.chainId === chainId) {
        accounts.push(buildAccount(account.address, chain));
      }
    }

    return accounts;
  };

  const target = createRoutedChainTarget({
    advertised: () => sessionAccounts().map((account) => account.chainId),
    current: () => currentChainId,
    platform,
    wallet: name,
  });

  // The target speaks registry ids; a call goes out under the id the session
  // approved that chain by, which may be an alias.
  const resolveChainId = (chain?: ChainBase) => {
    const registryId = target.chain(chain);

    return (
      sessionAccounts().find(
        (account) => resolveChain(account.chainId, knownChains).id === registryId,
      )?.chainId ?? registryId
    );
  };

  const resolveTarget = (options?: TransactionOptions) => {
    const chainId = resolveChainId(options?.chain);
    const exposed = accountsOn(chainId).map((account) => account.walletAddress);

    return { address: target.account(exposed, options?.account), chainId };
  };

  const emitter = createConnectorEmitter();

  const base: CaipConnector = {
    ...session.lifecycle(namespace, name),
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
