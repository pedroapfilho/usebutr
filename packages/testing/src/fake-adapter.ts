import type {
  Account,
  AccountOptions,
  Balance,
  BalanceOptions,
  BitcoinAdapter,
  ChainBase,
  ChainPlatform,
  ConnectorEvent,
  EvmAdapter,
  PolkadotAdapter,
  SignedMessage,
  SignInInput,
  SuiAdapter,
  SuiTransactionInput,
  SvmAdapter,
  TransactionOptions,
  WalletAdapterFor,
  WalletSigner,
} from "@usebutr/core";
import {
  buildAccount,
  bytesToBase58,
  bytesToHex,
  bytesToHexPrefixed,
  ConnectionError,
} from "@usebutr/core";

import {
  createByteSource,
  DEFAULT_ADDRESSES,
  DEFAULT_CHAINS,
  formatUnits,
  NATIVE_ASSETS,
} from "./fake-values";

type FakeAdapterControls = {
  /** Delivers `event` to every `subscribe` listener, as the wallet would.
   *  `getAccounts` follows it: a new list replaces the exposed accounts, and
   *  `disconnected` (or an empty list) exposes none until the next `connect`. */
  emit: (event: ConnectorEvent) => void;
  /** Live `subscribe` listeners; zero once the manager has detached. */
  listenerCount: () => number;
};

type FakeAdapter<P extends ChainPlatform> = WalletAdapterFor<P> & FakeAdapterControls;

type OptionalMember<P extends ChainPlatform> = Exclude<
  {
    [K in keyof WalletAdapterFor<P>]-?: undefined extends WalletAdapterFor<P>[K] ? K : never;
  }[keyof WalletAdapterFor<P>],
  "icon"
>;

type FakeAdapterOptions<P extends ChainPlatform = "evm"> = {
  /** Exposed accounts, active first. Defaults to one plausible address on
   *  the platform's mainnet. */
  accounts?: ReadonlyArray<Account>;
  /** Native balance in base units. EVM fakes always have `getBalance`
   *  (default one ETH); on other platforms passing it adds `getBalance`. */
  balance?: bigint;
  chainPlatform?: P;
  icon?: string;
  id?: string;
  name?: string;
  /** Optional members to leave off, to exercise the "wallet cannot" path. */
  omit?: ReadonlyArray<OptionalMember<P>>;
  /** Replace any member but the platform, e.g. a `connect` that rejects. */
  overrides?: Partial<Omit<WalletAdapterFor<P>, "chainPlatform">>;
  /** What `getSigner` resolves. Without it `getSigner` rejects: the fake
   *  registers no signer kind of its own, so an app's exhaustive
   *  `switch (signer.kind)` never grows a test-only case. */
  signer?: WalletSigner;
};

/** One member per platform, so a `switch` on `chainPlatform` narrows it. */
type AnyFakeAdapterOptions =
  | FakeAdapterOptions
  | { [K in ChainPlatform]: FakeAdapterOptions<K> & { chainPlatform: K } }[ChainPlatform];

const encoder = new TextEncoder();

/** Runs `body` inside a promise, so a failed check rejects instead of
 *  throwing: the contract never lets these methods throw synchronously. */
const settle = <T>(body: () => T | PromiseLike<T>): Promise<T> =>
  new Promise((resolve) => {
    resolve(body());
  });

/**
 * State and checks every platform shares: which accounts the wallet exposes,
 * the listeners, and the contract's rejections (not connected, an account it
 * does not expose, a chain from another namespace).
 */
const createFakeWallet = <P extends ChainPlatform>(platform: P, options: FakeAdapterOptions<P>) => {
  const id = options.id ?? "fake";
  const name = options.name ?? "Fake Wallet";
  const listeners = new Set<(event: ConnectorEvent) => void>();
  const nextBytes = createByteSource();
  let accounts: ReadonlyArray<Account> = options.accounts ?? [
    buildAccount(DEFAULT_ADDRESSES[platform], DEFAULT_CHAINS[platform]),
  ];
  let exposed = true;

  const notify = (event: ConnectorEvent) => {
    for (const listener of listeners) {
      listener(event);
    }
  };

  /** The account to act as: the active one unless `account` names another
   *  exposed account. */
  const accountFor = (account?: Account): Account => {
    const [active] = exposed ? accounts : [];
    if (active === undefined) {
      throw new ConnectionError("NotConnected", `${name} is not connected`);
    }
    if (account === undefined) {
      return active;
    }
    const match = accounts.find((candidate) => candidate.id === account.id);
    if (match === undefined) {
      throw new Error(`${name} does not expose ${account.walletAddress}`);
    }
    return match;
  };

  const assertNamespace = (chain: ChainBase | undefined) => {
    const { namespace } = DEFAULT_CHAINS[platform];
    if (chain !== undefined && chain.namespace !== namespace) {
      throw new Error(`${name} cannot use ${chain.id}: not a ${namespace} chain`);
    }
  };

  /** Moves every account to `chain`, as a wallet with one global network
   *  does, and tells listeners. */
  const moveTo = (chain: ChainBase) => {
    accounts = accounts.map((account) => buildAccount(account.walletAddress, chain));
    if (exposed) {
      notify({ accounts, type: "accountsChanged" });
    }
  };

  const currentChain = (): ChainBase => accounts[0]?.chain ?? DEFAULT_CHAINS[platform];

  const balanceOf = (balanceOptions: BalanceOptions | undefined): Balance => {
    accountFor(balanceOptions?.account);
    if (balanceOptions?.token !== undefined) {
      throw new Error(`${name} fakes the native asset only; override getBalance for tokens`);
    }
    const { decimals, symbol } = NATIVE_ASSETS[platform];
    const value = options.balance ?? 10n ** BigInt(decimals);
    return { decimals, formatted: formatUnits(value, decimals), symbol, value };
  };

  const signMessage = (message: Uint8Array, signOptions?: AccountOptions) =>
    settle((): SignedMessage => {
      accountFor(signOptions?.account);
      return { signature: nextBytes(64), signedMessage: message };
    });

  const getBalance = (balanceOptions?: BalanceOptions) => settle(() => balanceOf(balanceOptions));

  /** Per-call routing: any chain in the namespace, as Wallet Standard does. */
  const route = (txOptions: TransactionOptions | undefined) => {
    accountFor(txOptions?.account);
    assertNamespace(txOptions?.chain);
  };

  const base = {
    connect: () =>
      settle(() => {
        exposed = true;
      }),
    disconnect: () =>
      settle(() => {
        exposed = false;
      }),
    getAccounts: () => Promise.resolve(exposed ? accounts : []),
    getSigner: () =>
      options.signer === undefined
        ? Promise.reject(new Error(`Fake adapter "${id}" was given no signer`))
        : Promise.resolve(options.signer),
    icon: options.icon,
    id,
    name,
    subscribe: (listener: (event: ConnectorEvent) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  const controls: FakeAdapterControls = {
    emit: (event) => {
      if (event.type === "accountsChanged" && event.accounts.length > 0) {
        accounts = event.accounts;
        exposed = true;
      } else {
        exposed = false;
      }
      notify(event);
    },
    listenerCount: () => listeners.size,
  };

  /** Applies `overrides` and `omit` last, so they win over every default. */
  const finish = (adapter: WalletAdapterFor<P>): FakeAdapter<P> => {
    const fake: FakeAdapter<P> = { ...adapter, ...options.overrides, ...controls };
    for (const member of options.omit ?? []) {
      Reflect.deleteProperty(fake, member);
    }
    return fake;
  };

  return {
    accountFor,
    assertNamespace,
    base,
    currentChain,
    finish,
    getBalance,
    moveTo,
    nextBytes,
    route,
    signMessage,
  };
};

const suiBytes = async (tx: SuiTransactionInput): Promise<Uint8Array> => {
  if (tx instanceof Uint8Array) {
    return tx;
  }
  return encoder.encode(typeof tx === "string" ? tx : await tx.toJSON());
};

const siwsMessage = (input: SignInInput | undefined, account: Account): string => {
  const domain = typeof input?.domain === "string" ? input.domain : "localhost";
  const nonce = typeof input?.nonce === "string" ? `\n\nNonce: ${input.nonce}` : "";
  return `${domain} wants you to sign in with your Solana account:\n${account.walletAddress}${nonce}`;
};

/** An injected EVM wallet: one global network, so `sendTx` to another chain
 *  switches it first. */
const buildEvm = (options: FakeAdapterOptions): FakeAdapter<"evm"> => {
  const wallet = createFakeWallet("evm", options);
  const switchChain = (chain: ChainBase) =>
    settle(() => {
      wallet.assertNamespace(chain);
      wallet.moveTo(chain);
    });
  const adapter: EvmAdapter = {
    ...wallet.base,
    chainPlatform: "evm",
    getBalance: wallet.getBalance,
    getTransactionReceipt: () => Promise.resolve({ status: "Success" }),
    requestAccounts: () =>
      settle(() => {
        wallet.accountFor();
      }),
    sendTx: async (_tx, txOptions) => {
      wallet.accountFor(txOptions?.account);
      if (txOptions?.chain !== undefined && txOptions.chain.id !== wallet.currentChain().id) {
        await switchChain(txOptions.chain);
      }
      return bytesToHexPrefixed(wallet.nextBytes(32));
    },
    signMessage: wallet.signMessage,
    switchChain,
  };
  return wallet.finish(adapter);
};

/** A Wallet Standard Solana wallet: routes `chain` per call. */
const buildSvm = (options: FakeAdapterOptions<"svm">): FakeAdapter<"svm"> => {
  const wallet = createFakeWallet("svm", options);
  const adapter: SvmAdapter = {
    ...wallet.base,
    chainPlatform: "svm",
    ...(options.balance !== undefined && { getBalance: wallet.getBalance }),
    sendTx: (_tx, txOptions) =>
      settle(() => {
        wallet.route(txOptions);
        return bytesToBase58(wallet.nextBytes(64));
      }),
    signIn: (input) =>
      settle(() => {
        const account = wallet.accountFor();
        return {
          account,
          signature: wallet.nextBytes(64),
          signedMessage: encoder.encode(siwsMessage(input, account)),
        };
      }),
    signMessage: wallet.signMessage,
    signTransaction: (tx, txOptions) =>
      settle(() => {
        wallet.route(txOptions);
        return tx;
      }),
  };
  return wallet.finish(adapter);
};

const buildSui = (options: FakeAdapterOptions<"sui">): FakeAdapter<"sui"> => {
  const wallet = createFakeWallet("sui", options);
  const adapter: SuiAdapter = {
    ...wallet.base,
    chainPlatform: "sui",
    ...(options.balance !== undefined && { getBalance: wallet.getBalance }),
    sendTx: (_tx, txOptions) =>
      settle(() => {
        wallet.route(txOptions);
        return bytesToBase58(wallet.nextBytes(32));
      }),
    signMessage: wallet.signMessage,
    signTransaction: async (tx, txOptions) => {
      wallet.route(txOptions);
      return { bytes: await suiBytes(tx), signature: wallet.nextBytes(64) };
    },
  };
  return wallet.finish(adapter);
};

const buildBitcoin = (options: FakeAdapterOptions<"bitcoin">): FakeAdapter<"bitcoin"> => {
  const wallet = createFakeWallet("bitcoin", options);
  const adapter: BitcoinAdapter = {
    ...wallet.base,
    chainPlatform: "bitcoin",
    ...(options.balance !== undefined && { getBalance: wallet.getBalance }),
    sendTx: (transfer, txOptions) =>
      settle(() => {
        wallet.route(txOptions);
        if (transfer.amount <= 0n) {
          throw new Error(`${wallet.base.name} cannot send ${transfer.amount} satoshis`);
        }
        return bytesToHex(wallet.nextBytes(32));
      }),
    signMessage: wallet.signMessage,
    signTransaction: (psbt, txOptions) =>
      settle(() => {
        wallet.route(txOptions);
        return psbt;
      }),
  };
  return wallet.finish(adapter);
};

/** Extrinsics need chain metadata, so a Polkadot wallet only signs. */
const buildPolkadot = (options: FakeAdapterOptions<"polkadot">): FakeAdapter<"polkadot"> => {
  const wallet = createFakeWallet("polkadot", options);
  const adapter: PolkadotAdapter = {
    ...wallet.base,
    chainPlatform: "polkadot",
    ...(options.balance !== undefined && { getBalance: wallet.getBalance }),
    signMessage: wallet.signMessage,
  };
  return wallet.finish(adapter);
};

type Builders = { [K in ChainPlatform]: (options: FakeAdapterOptions<K>) => FakeAdapter<K> };

const BUILDERS: Builders = {
  bitcoin: buildBitcoin,
  evm: buildEvm,
  polkadot: buildPolkadot,
  sui: buildSui,
  svm: buildSvm,
};

/** The builder for `platform`, typed to it; `createFakeConnectedWallet`
 *  goes through here once it knows the platform. */
const buildFakeAdapter = <P extends ChainPlatform>(
  platform: P,
  options: FakeAdapterOptions<P>,
): FakeAdapter<P> => BUILDERS[platform](options);

/**
 * Behaves like a real wallet on its platform (EVM unless `chainPlatform`
 * says otherwise): the members such wallets have, the contract's rejections
 * for an unexposed account or a foreign chain, and distinct hashes.
 */
function createFakeAdapter(options?: FakeAdapterOptions): FakeAdapter<"evm">;
function createFakeAdapter<P extends ChainPlatform>(
  options: FakeAdapterOptions<P> & { chainPlatform: P },
): FakeAdapter<P>;
function createFakeAdapter(options: AnyFakeAdapterOptions = {}): FakeAdapter<ChainPlatform> {
  switch (options.chainPlatform) {
    case "bitcoin": {
      return buildFakeAdapter("bitcoin", options);
    }
    case "polkadot": {
      return buildFakeAdapter("polkadot", options);
    }
    case "sui": {
      return buildFakeAdapter("sui", options);
    }
    case "svm": {
      return buildFakeAdapter("svm", options);
    }
    case undefined:
    case "evm": {
      return buildFakeAdapter("evm", options);
    }
    default: {
      const unknownPlatform: never = options;
      return unknownPlatform;
    }
  }
}

export type { FakeAdapter, FakeAdapterControls, FakeAdapterOptions };
export { buildFakeAdapter, createFakeAdapter };
