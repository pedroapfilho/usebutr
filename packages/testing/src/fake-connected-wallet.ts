import type { ChainBase, ChainPlatform, ConnectedWallet } from "@usebutr/core";
import { buildAccount } from "@usebutr/core";

import type { FakeAdapter, FakeAdapterOptions } from "./fake-adapter";
import { buildFakeAdapter } from "./fake-adapter";
import { DEFAULT_ADDRESSES, DEFAULT_CHAINS } from "./fake-values";

type FakeConnectedWallet<P extends ChainPlatform> = Omit<ConnectedWallet<P>, "connector"> & {
  connector: FakeAdapter<P>;
};

type FakeConnectedWalletOptions<P extends ChainPlatform = "evm"> = FakeAdapterOptions<P> & {
  /** Addresses to expose on `chain`, active first. Ignored when `accounts`
   *  is passed. */
  addresses?: ReadonlyArray<string>;
  /** Chain for the generated accounts. Defaults to the platform's mainnet. */
  chain?: ChainBase;
};

/** One member per platform, so a `switch` on `chainPlatform` narrows it. */
type AnyFakeConnectedWalletOptions =
  | FakeConnectedWalletOptions
  | {
      [K in ChainPlatform]: FakeConnectedWalletOptions<K> & { chainPlatform: K };
    }[ChainPlatform];

const connectedWallet = <P extends ChainPlatform>(
  platform: P,
  options: FakeConnectedWalletOptions<P>,
): FakeConnectedWallet<P> => {
  const chain = options.chain ?? DEFAULT_CHAINS[platform];
  const accounts =
    options.accounts ??
    (options.addresses ?? [DEFAULT_ADDRESSES[platform]]).map((address) =>
      buildAccount(address, chain),
    );
  const [account] = accounts;
  if (account === undefined) {
    throw new Error("createFakeConnectedWallet needs at least one account or address.");
  }
  return { account, accounts, connector: buildFakeAdapter(platform, { ...options, accounts }) };
};

/**
 * A pool entry as the manager builds it after `connect`: a fake adapter and
 * the accounts it exposes, so the two never disagree. Drive the wallet
 * through `wallet.connector.emit`.
 */
function createFakeConnectedWallet(
  options?: FakeConnectedWalletOptions,
): FakeConnectedWallet<"evm">;
function createFakeConnectedWallet<P extends ChainPlatform>(
  options: FakeConnectedWalletOptions<P> & { chainPlatform: P },
): FakeConnectedWallet<P>;
function createFakeConnectedWallet(
  options: AnyFakeConnectedWalletOptions = {},
): FakeConnectedWallet<ChainPlatform> {
  switch (options.chainPlatform) {
    case "bitcoin": {
      return connectedWallet("bitcoin", options);
    }
    case "polkadot": {
      return connectedWallet("polkadot", options);
    }
    case "sui": {
      return connectedWallet("sui", options);
    }
    case "svm": {
      return connectedWallet("svm", options);
    }
    case undefined:
    case "evm": {
      return connectedWallet("evm", options);
    }
    default: {
      const unknownPlatform: never = options;
      return unknownPlatform;
    }
  }
}

export type { FakeConnectedWallet, FakeConnectedWalletOptions };
export { createFakeConnectedWallet };
