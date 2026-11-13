import {
  createConnectorEmitter,
  createRoutedChainTarget,
  sanitizeIcon,
  toWalletKey,
} from "@usebutr/adapter-kit";
import type {
  Account,
  ChainBase,
  ChainPlatform,
  Connector,
  ConnectorEvent,
  TransactionOptions,
  WalletSigner,
} from "@usebutr/core";
import {
  buildAccount,
  CHAIN_NAMESPACES,
  CHAINS_BY_PLATFORM,
  DEFAULT_CHAINS,
  resolveChain,
} from "@usebutr/core";

import { getFeature } from "./primitives";
import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  WalletStandardFeature,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "./types";

type WalletStandardCoreInput = {
  /** Stable adapter id. Each platform package owns its own slug prefix. */
  id: string;
  /** Picks the CAIP-2 namespace and the chain registry; a chain outside the
   *  registry is named by its CAIP-2 id. */
  platform: ChainPlatform;
  /** Registry chain ids worth preferring over the first advertised one; a
   *  wallet naming one by an alias counts. Matched in the wallet's own
   *  order, so a wallet listing devnet before mainnet keeps devnet when
   *  both are preferred. Defaults to the platform's mainnet. */
  preferredChainIds?: ReadonlyArray<string>;
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
  | "connect"
  | "disconnect"
  | "getAccounts"
  | "icon"
  | "id"
  | "name"
  | "restore"
  | "subscribe"
  | "walletKey"
> & {
  getSigner: () => Promise<WalletSigner>;
  switchChain?: (chain: ChainBase) => Promise<void>;
};

type WalletStandardTarget = (options?: TransactionOptions) => {
  account: WalletStandardWalletAccount;
  chain: string;
};

type WalletStandardCore = {
  /** Spread into the adapter. `disconnect`, `subscribe` and `switchChain` are
   *  present only when the wallet supports them. */
  base: WalletStandardConnector;
  /** The active chain, for results that mint their own `Account`. */
  currentChain: () => ChainBase;
  /** The wallet's `name` feature when it has `method`, and `target`: the
   *  chain a call goes to and the account it acts as, among the accounts that
   *  list the feature. `undefined` when the wallet lacks it. */
  feature: <Feature extends object>(
    name: string,
    method: keyof Feature & string,
  ) => { call: WalletStandardFeature & Feature; target: WalletStandardTarget } | undefined;
  toAccount: (account: WalletStandardWalletAccount) => Account;
};

/**
 * `null` when the wallet advertises no chain on `platform` or lacks
 * `standard:connect`, so a multi-chain wallet yields one adapter per
 * platform it actually speaks.
 */
const createWalletStandardCore = ({
  id,
  platform,
  preferredChainIds = [DEFAULT_CHAINS[platform].id],
  registerDisconnector,
  trackChainChanges,
  wallet,
}: WalletStandardCoreInput): WalletStandardCore | null => {
  const chains = CHAINS_BY_PLATFORM[platform];
  const prefix = `${CHAIN_NAMESPACES[platform]}:`;
  const preferred = new Set(preferredChainIds);

  const pickChain = (advertised: ReadonlyArray<string>): string | undefined =>
    advertised.find((c) => preferred.has(resolveChain(c, chains).id)) ??
    advertised.find((c) => c.startsWith(prefix));

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
  const emitter = createConnectorEmitter();

  const target = createRoutedChainTarget({
    accounts: () => wallet.accounts,
    chains: () => wallet.chains,
    chainsOf: (account) => account.chains,
    emit: emitter.emit,
    platform,
    start: initialChainId,
    wallet: wallet.name,
  });

  const toEvent = (accounts: ReadonlyArray<WalletStandardWalletAccount>): ConnectorEvent => ({
    accounts: target.accounts(accounts),
    type: "accountsChanged",
  });

  registerDisconnector?.(() => {
    emitter.emit({ type: "disconnected" });
  });

  const subscribe = (listener: (event: ConnectorEvent) => void) => {
    const unsubscribe = emitter.subscribe(listener);

    // Each subscriber owns a wallet listener, so it delivers to that
    // subscriber alone: broadcasting would repeat a change per subscriber.
    const off = events?.on("change", (changes) => {
      const next = trackChainChanges && changes.chains ? pickChain(changes.chains) : undefined;

      if (next !== undefined) {
        target.follow(next);
      }

      if (changes.accounts !== undefined) {
        listener(toEvent(changes.accounts));
      } else if (next !== undefined) {
        listener(toEvent(wallet.accounts));
      }
    });

    return () => {
      unsubscribe();
      off?.();
    };
  };

  const base: WalletStandardConnector = {
    async connect() {
      await connect.connect();
    },
    getAccounts: () => Promise.resolve(target.accounts()),
    getSigner: () => Promise.resolve({ kind: "wallet-standard", wallet }),
    icon: sanitizeIcon(wallet.icon),
    id,
    name: wallet.name,
    async restore() {
      await connect.connect({ silent: true });
    },
    walletKey: toWalletKey(wallet.name),
    ...(disconnect !== undefined && {
      async disconnect() {
        await disconnect.disconnect();
      },
    }),
    // Discovery wires `unregister` through the same listeners, so a wallet
    // without `standard:events` can still report its removal.
    ...((events !== undefined || registerDisconnector !== undefined) && { subscribe }),
    ...(target.switchChain !== undefined && { switchChain: target.switchChain }),
  };

  return {
    base,
    currentChain: target.current,
    feature: (name, method) => {
      const call = getFeature(wallet, name, method);

      return call === undefined
        ? undefined
        : {
            call,
            target: (options) =>
              target.resolve(options, (account) => account.features.includes(name)),
          };
    },
    toAccount: (account) =>
      buildAccount(
        target.account(target.covers(account) ? [account] : []).address,
        target.current(),
      ),
  };
};

export type { WalletStandardConnector, WalletStandardCore, WalletStandardCoreInput };

export { createWalletStandardCore };
