import type { Account, ChainBase, Connector, ConnectorEvent, WalletSigner } from "@usebutr/core";
import { buildAccount, logWarn, resolveChain, sanitizeIcon } from "@usebutr/core";

import { findAccount, getFeature } from "./primitives";
import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "./types";

type WalletStandardCoreInput = {
  /** The platform's chain registry, for chain names. A chain outside it is
   *  named by its CAIP-2 id. */
  chains: ReadonlyArray<ChainBase>;
  /** Stable adapter id. Each platform package owns its own slug prefix. */
  id: string;
  /** How the platform reads in errors: `Solana`, `Sui`, `Bitcoin`. */
  label: string;
  /** CAIP-2 namespace without its colon: `solana`, `sui`, `bip122`. */
  namespace: string;
  /** Chain ids worth preferring over the first advertised one. Matched in
   *  the wallet's own order, so a wallet listing `mainnet-beta` before
   *  `mainnet` keeps the chain it advertised first. */
  preferredChainIds: ReadonlyArray<string>;
  /** Called with a function that pushes a synthetic `disconnected` event to
   *  all current subscribers. Discovery invokes it on `unregister`. */
  registerDisconnector?: (emit: () => void) => void;
  /** Re-point the active chain when the wallet reports a `chains` change.
   *  Polkadot opts out: its wallets advertise a single relay chain. */
  trackChainChanges: boolean;
  wallet: WalletStandardWallet;
};

/** The members every Wallet Standard adapter shares, ready to spread. */
type WalletStandardConnector = Pick<
  Connector,
  "connect" | "disconnect" | "getAccounts" | "icon" | "id" | "name" | "subscribe"
> & {
  getSigner: () => Promise<WalletSigner>;
  switchChain?: (chain: ChainBase) => Promise<void>;
};

type WalletStandardCore = {
  /** Spread into the adapter. `disconnect`, `subscribe` and `switchChain` are
   *  present only when the wallet supports them. */
  base: WalletStandardConnector;
  /** The active chain, for results that mint their own `Account`. */
  currentChain: () => ChainBase;
  /** The Wallet Standard account a call signs with: the one matching
   *  `account`, else the active one. Throws for an account the wallet does
   *  not expose. */
  resolveAccount: (account?: Account) => WalletStandardWalletAccount;
  /** The chain id a call targets: `chain` when given, else the current one.
   *  Throws for a chain outside the namespace or not advertised. */
  resolveChainId: (chain?: ChainBase) => string;
};

/**
 * `null` when the wallet advertises no chain in `namespace` or lacks
 * `standard:connect`, so a multi-chain wallet yields one adapter per
 * platform it actually speaks.
 */
const createWalletStandardCore = ({
  chains,
  id,
  label,
  namespace,
  preferredChainIds,
  registerDisconnector,
  trackChainChanges,
  wallet,
}: WalletStandardCoreInput): WalletStandardCore | null => {
  const prefix = `${namespace}:`;
  const preferred = new Set(preferredChainIds);
  const pickChain = (advertised: ReadonlyArray<string>): string | undefined =>
    advertised.find((c) => preferred.has(c)) ?? advertised.find((c) => c.startsWith(prefix));

  const initialChainId = pickChain(wallet.chains);
  const connect = getFeature<StandardConnectFeature>(wallet, "standard:connect", "connect");
  if (initialChainId === undefined || connect === undefined) {
    return null;
  }
  const disconnect = getFeature<StandardDisconnectFeature>(
    wallet,
    "standard:disconnect",
    "disconnect",
  );
  const events = getFeature<StandardEventsFeature>(wallet, "standard:events", "on");

  let currentChainId = initialChainId;
  const currentChain = () => resolveChain(currentChainId, chains);
  const toAccounts = (accounts: ReadonlyArray<WalletStandardWalletAccount>) => {
    const chain = currentChain();
    return accounts.map((a) => buildAccount(a.address, chain));
  };

  const listeners = new Set<(event: ConnectorEvent) => void>();
  const emit = (event: ConnectorEvent) => {
    for (const listener of listeners) {
      listener(event);
    }
  };
  const toEvent = (accounts: ReadonlyArray<WalletStandardWalletAccount>): ConnectorEvent =>
    accounts.length === 0
      ? { type: "disconnected" }
      : { accounts: toAccounts(accounts), type: "accountsChanged" };
  registerDisconnector?.(() => {
    emit({ type: "disconnected" });
  });

  const resolveChainId = (chain?: ChainBase): string => {
    if (chain === undefined) {
      return currentChainId;
    }
    if (chain.namespace !== namespace) {
      throw new Error(
        `${label} adapter received non-${label} chain "${chain.id}". Pass a chain with namespace "${namespace}".`,
      );
    }
    if (!wallet.chains.includes(chain.id)) {
      throw new Error(
        `Wallet ${wallet.name} does not advertise chain "${chain.id}". Available: ${wallet.chains.join(", ")}`,
      );
    }
    return chain.id;
  };

  const subscribe = (listener: (event: ConnectorEvent) => void) => {
    listeners.add(listener);
    // Each subscriber owns a wallet listener, so it delivers to that
    // subscriber alone: broadcasting would repeat a change per subscriber.
    const off = events?.on("change", (changes) => {
      const next = trackChainChanges && changes.chains ? pickChain(changes.chains) : undefined;
      if (next !== undefined) {
        currentChainId = next;
      }
      if (changes.accounts !== undefined) {
        listener(toEvent(changes.accounts));
      } else if (next !== undefined) {
        listener(toEvent(wallet.accounts));
      }
    });
    return () => {
      listeners.delete(listener);
      off?.();
    };
  };

  const advertisedInNamespace = wallet.chains.filter((c) => c.startsWith(prefix));

  const base: WalletStandardConnector = {
    async connect(options) {
      await connect.connect(options?.silent === true ? { silent: true } : undefined);
    },
    getAccounts: () => Promise.resolve(toAccounts(wallet.accounts)),
    getSigner: () => Promise.resolve({ kind: "wallet-standard", wallet }),
    icon: sanitizeIcon(wallet.icon),
    id,
    name: wallet.name,
    ...(disconnect !== undefined && {
      async disconnect() {
        try {
          await disconnect.disconnect();
        } catch (error) {
          logWarn(`[butr] ${label} Wallet Standard disconnect threw:`, error);
        }
      },
    }),
    // Discovery wires `unregister` through the same listeners, so a wallet
    // without `standard:events` can still report its removal.
    ...((events !== undefined || registerDisconnector !== undefined) && { subscribe }),
    // Wallet Standard has no switch-network call: this re-points butr's view
    // (and every later call's `chain` input), which only means something
    // when the wallet advertises more than one chain.
    ...(advertisedInNamespace.length > 1 && {
      switchChain: async (chain: ChainBase) => {
        currentChainId = resolveChainId(chain);
        emit(toEvent(wallet.accounts));
        await Promise.resolve();
      },
    }),
  };

  return {
    base,
    currentChain,
    resolveAccount: (account) => {
      const match =
        account === undefined
          ? wallet.accounts[0]
          : findAccount(wallet.accounts, account.walletAddress);
      if (match === undefined) {
        throw new Error(
          account === undefined
            ? `Wallet ${wallet.name} has no connected account`
            : `Wallet ${wallet.name} does not expose account ${account.walletAddress}`,
        );
      }
      return match;
    },
    resolveChainId,
  };
};

export type { WalletStandardConnector, WalletStandardCore, WalletStandardCoreInput };
export { createWalletStandardCore };
