import type {
  Account,
  ChainBase,
  ChainPlatform,
  ConnectedWallet,
  WalletAdapter,
} from "@usebutr/core";
import { buildAccount } from "@usebutr/core";

import { type FakeAdapterOptions, createFakeAdapter } from "./fake-adapter";

/** Mirrors the per-platform registries in `@usebutr/evm` and friends.
 *  Duplicated rather than imported so `@usebutr/testing` keeps its single
 *  `@usebutr/core` dependency. */
const DEFAULT_CHAINS: Readonly<Record<ChainPlatform, ChainBase>> = {
  bitcoin: {
    id: "bip122:000000000019d6689c085ae165831e93",
    name: "Bitcoin",
    namespace: "bip122",
    reference: "000000000019d6689c085ae165831e93",
  },
  evm: { id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" },
  polkadot: {
    id: "polkadot:91b171bb158e2d3848fa23a9f1c25182",
    name: "Polkadot",
    namespace: "polkadot",
    reference: "91b171bb158e2d3848fa23a9f1c25182",
  },
  sui: { id: "sui:mainnet", name: "Sui Mainnet", namespace: "sui", reference: "mainnet" },
  svm: { id: "solana:mainnet", name: "Solana Mainnet", namespace: "solana", reference: "mainnet" },
};

/** Plausibly-shaped addresses per platform: the wrong-looking address is
 *  a common source of confusion when a snapshot test fails. */
const DEFAULT_ADDRESSES: Readonly<Record<ChainPlatform, string>> = {
  bitcoin: "bc1qfake000000000000000000000000000000000",
  evm: "0x0000000000000000000000000000000000000001",
  polkadot: "5FakeAddress00000000000000000000000000000000000000",
  sui: "0x0000000000000000000000000000000000000000000000000000000000000001",
  svm: "So11111111111111111111111111111111111111112",
};

type FakeConnectedWalletOptions = FakeAdapterOptions & {
  /** Wrap an existing adapter instead of building one. When set, the
   *  adapter-shaping fields (`id`, `name`, `capabilities`, `icon`) are
   *  ignored: they belong to the adapter you already built. */
  adapter?: WalletAdapter;
  /** Addresses to build accounts from, first one active. Ignored when
   *  `accounts` is passed. */
  addresses?: ReadonlyArray<string>;
  /** Chain for generated accounts. Defaults to the platform's mainnet. */
  chain?: ChainBase;
};

/**
 * Builds a `ConnectedWallet` pool entry, the shape `usePool` and
 * `useActiveWallet` hand components. Accounts go through `buildAccount` so the
 * `<chain>:<address>` id format is never restated here.
 */
const createFakeConnectedWallet = (options: FakeConnectedWalletOptions = {}): ConnectedWallet => {
  const { adapter, addresses, chain, ...adapterOptions } = options;
  const chainPlatform: ChainPlatform =
    adapter?.chainPlatform ?? adapterOptions.chainPlatform ?? "evm";
  const resolvedChain = chain ?? DEFAULT_CHAINS[chainPlatform];

  const accounts: Array<Account> =
    adapterOptions.accounts ??
    (addresses ?? [DEFAULT_ADDRESSES[chainPlatform]]).map((address) =>
      buildAccount(address, resolvedChain),
    );

  const account = accounts[0];
  if (account === undefined) {
    throw new Error(
      "createFakeConnectedWallet needs at least one account: pass `addresses` or `accounts`, or omit both for the default.",
    );
  }

  // A supplied adapter carries its own accounts, and the entry must agree with
  // it: real pool entries are always built from the connector's own
  // `getAccount()`/`getAccounts()`, so an entry whose account the adapter has
  // never heard of is a state production cannot reach.
  if (adapter && (addresses !== undefined || adapterOptions.accounts !== undefined)) {
    throw new Error(
      "createFakeConnectedWallet: pass either `adapter` or `addresses`/`accounts`, not both. The entry's accounts must come from the adapter that serves them.",
    );
  }

  return {
    account,
    accounts,
    connector: adapter ?? createFakeAdapter({ ...adapterOptions, accounts, chainPlatform }),
  };
};

export type { FakeConnectedWalletOptions };
export { createFakeConnectedWallet };
