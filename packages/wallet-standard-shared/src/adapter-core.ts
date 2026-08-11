import type { Account, ChainBase, ConnectorEvent } from "@usebutr/core";
import { buildAccount, logWarn, sanitizeIcon } from "@usebutr/core";

import { getFeature, pickAccountByAddress, pickFirstAddress } from "./primitives";
import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "./types";

type WalletStandardCoreInput = {
  /** CAIP-2 prefix including its colon (`solana:`, `sui:`, `bip122:`). */
  chainPrefix: string;
  /** Stable adapter id. Each platform package owns its own slug prefix. */
  id: string;
  /** How this adapter names itself in errors (`Bitcoin`, `SVM`, `Sui`). */
  label: string;
  /** CAIP-2 namespace without its colon. */
  namespace: string;
  /** How the chain family reads in errors (`Bitcoin`, `Solana`, `Sui`). */
  platform: string;
  /** Chain ids worth preferring over a bare prefix match. Matched against
   *  the wallet's own ordering, so a wallet listing `mainnet-beta` before
   *  `mainnet` keeps the chain it advertised first. */
  preferredChainIds: ReadonlyArray<string>;
  /** Called with a function that pushes a synthetic `disconnected` event
   *  to all current subscribers. The discovery layer invokes it on Wallet
   *  Standard `unregister`. */
  registerDisconnector?: (emit: () => void) => void;
  /** Re-point the active chain when the wallet reports a `chains` change.
   *  Polkadot opts out: its wallets advertise a single relay chain, so a
   *  re-point would only ever move the adapter off the chain it resolved. */
  trackChainChanges: boolean;
  wallet: WalletStandardWallet;
};

type WalletStandardCore = {
  /** Chains the wallet advertises in this namespace; feeds capability gating. */
  chainCount: number;
  connect: (opts?: { silent?: boolean }) => Promise<void>;
  /** Active CAIP-2 chain id, for features that take a per-call `chain`. */
  currentChainId: () => string;
  disconnect: () => Promise<void>;
  getAccount: () => Promise<Account | null>;
  getAccounts: () => Promise<Array<Account>>;
  getSigner: () => Promise<unknown>;
  /** Whether the wallet advertises `standard:events`; feeds capability gating. */
  hasEvents: boolean;
  icon: string | undefined;
  id: string;
  name: string;
  /** Wallet Standard account a call should route through: the one matching
   *  `account`, else the wallet's first exposed account. */
  resolveAccount: (account?: { walletAddress: string }) => WalletStandardWalletAccount;
  subscribe: (listener: (event: ConnectorEvent) => void) => () => void;
  switchChain: (chain: ChainBase) => Promise<void>;
  /** butr chain for the active chain id, for responses that mint their own
   *  `Account` (Sign-In-With-Solana) rather than going through `getAccounts`. */
  toChain: () => ChainBase;
};

/**
 * Session plumbing every Wallet Standard platform adapter repeats: chain
 * resolution, the connect/disconnect handshake, account reads, the local
 * listener set that lets `switchChain` synthesise `accountChanged`, and
 * the `standard:events` bridge. Returns `null` for wallets butr can't
 * drive (no chain in this namespace, or no `standard:connect`), which is
 * the same `null` each platform adapter returns to its caller.
 *
 * Platform packages keep what genuinely differs: which features they read
 * off the wallet, how they encode transactions and messages, and their
 * balance units. `getSigner` hands back the raw Wallet Standard wallet so
 * consumers can wrap it in their own signing library.
 */
const createWalletStandardCore = ({
  chainPrefix,
  id,
  label,
  namespace,
  platform,
  preferredChainIds,
  registerDisconnector,
  trackChainChanges,
  wallet,
}: WalletStandardCoreInput): WalletStandardCore | null => {
  const pickChain = (chains: ReadonlyArray<string>): string | null =>
    chains.find((c) => preferredChainIds.includes(c)) ??
    chains.find((c) => c.startsWith(chainPrefix)) ??
    null;

  const initialChainId = pickChain(wallet.chains);
  if (initialChainId === null) {
    return null;
  }
  const connect = getFeature<StandardConnectFeature>(wallet, "standard:connect");
  if (connect === undefined) {
    return null;
  }

  const disconnect = getFeature<StandardDisconnectFeature>(wallet, "standard:disconnect");
  const events = getFeature<StandardEventsFeature>(wallet, "standard:events");

  let currentChainId = initialChainId;
  const toChain = (): ChainBase => ({
    id: currentChainId,
    name: wallet.name,
    namespace,
    reference: currentChainId.slice(chainPrefix.length),
  });

  const listeners = new Set<(event: ConnectorEvent) => void>();
  const notifyAccountChanged = () => {
    if (wallet.accounts.length === 0) {
      return;
    }
    const chain = toChain();
    const built = wallet.accounts.map((a) => buildAccount(a.address, chain));
    const first = built[0];
    if (first === undefined) {
      return;
    }
    for (const listener of listeners) {
      listener({ account: first, accounts: built, type: "accountChanged" });
    }
  };

  registerDisconnector?.(() => {
    for (const listener of listeners) {
      listener({ type: "disconnected" });
    }
  });

  return {
    chainCount: wallet.chains.filter((c) => c.startsWith(chainPrefix)).length,

    async connect(opts) {
      await connect.connect(opts?.silent === true ? { silent: true } : undefined);
    },

    currentChainId: () => currentChainId,

    async disconnect() {
      if (disconnect !== undefined) {
        try {
          await disconnect.disconnect();
        } catch (error) {
          logWarn(`[butr] ${label} Wallet Standard disconnect threw:`, error);
        }
      }
    },

    getAccount: () => {
      const address = pickFirstAddress(wallet.accounts);
      return Promise.resolve(address === null ? null : buildAccount(address, toChain()));
    },

    getAccounts: () => {
      const chain = toChain();
      return Promise.resolve(wallet.accounts.map((a) => buildAccount(a.address, chain)));
    },

    getSigner: () => Promise.resolve(wallet),

    hasEvents: Boolean(events),

    icon: sanitizeIcon(wallet.icon),
    id,
    name: wallet.name,

    resolveAccount: (account) => {
      const wsAccount = account
        ? pickAccountByAddress(wallet.accounts, account.walletAddress)
        : wallet.accounts[0];
      if (wsAccount === undefined) {
        throw new Error("No connected account");
      }
      return wsAccount;
    },

    subscribe(listener) {
      listeners.add(listener);
      let unsubWallet: (() => void) | null = null;
      if (events !== undefined) {
        const unsub = events.on("change", (changes) => {
          if (trackChainChanges && changes.chains !== undefined) {
            const next = pickChain(changes.chains);
            if (next !== null) {
              currentChainId = next;
            }
          }

          if (changes.accounts !== undefined) {
            if (changes.accounts.length === 0) {
              listener({ type: "disconnected" });
              return;
            }
            const chain = toChain();
            const built = changes.accounts.map((a) => buildAccount(a.address, chain));
            const first = built[0];
            if (first === undefined) {
              return;
            }
            listener({ account: first, accounts: built, type: "accountChanged" });
            return;
          }

          if (trackChainChanges && changes.chains !== undefined) {
            notifyAccountChanged();
          }
        });
        unsubWallet = () => {
          unsub();
        };
      }
      return () => {
        listeners.delete(listener);
        unsubWallet?.();
      };
    },

    switchChain: (chain) => {
      if (chain.namespace !== namespace) {
        throw new Error(
          `${label} adapter received non-${platform} chain "${chain.id}". Pass a chain with namespace "${namespace}".`,
        );
      }
      if (!wallet.chains.includes(chain.id)) {
        throw new Error(
          `Wallet ${wallet.name} does not advertise chain "${chain.id}". Available: ${wallet.chains.join(", ")}`,
        );
      }
      currentChainId = chain.id;
      notifyAccountChanged();
      return Promise.resolve();
    },

    toChain,
  };
};

export type { WalletStandardCore };
export { createWalletStandardCore };
