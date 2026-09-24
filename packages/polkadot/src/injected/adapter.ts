import type {
  Account,
  AccountOptions,
  ChainBase,
  ConnectorEvent,
  PolkadotAdapter,
  SignedMessage,
} from "@usebutr/core";
import {
  buildAccount,
  logWarn,
  POLKADOT_CHAINS,
  POLKADOT_CHAINS_LIST,
  resolveChain,
  sanitizeIcon,
} from "@usebutr/core";

import { GENERIC_POLKADOT_ICON } from "./icon";
import type { Injected, InjectedAccount, InjectedWindowProvider } from "./injected-web3";
import { bytesToHex, hexToBytes, wrapBytes } from "./injected-web3";

const DAPP_NAME = "butr";

/**
 * Deliberately not wallet-standard-shared's `slugify`: that helper embeds
 * the `wallet-standard:` scheme, while injected adapter ids follow the
 * `injected:polkadot:<slug>` convention.
 */
const toKebab = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gv, "-")
    .replaceAll(/^-|-$/gv, "");

/**
 * An account works on any Substrate chain unless the extension pins it to
 * one through `genesisHash`, whose first 16 bytes are the CAIP-2 reference.
 * Unpinned accounts are labelled Polkadot, butr's default network.
 */
const chainOf = ({ genesisHash }: InjectedAccount): ChainBase =>
  genesisHash === undefined || genesisHash === null || genesisHash === ""
    ? POLKADOT_CHAINS.polkadot
    : resolveChain(
        `polkadot:${genesisHash.replace(/^0x/v, "").slice(0, 32)}`,
        POLKADOT_CHAINS_LIST,
      );

const toAccount = (account: InjectedAccount): Account =>
  buildAccount(account.address, chainOf(account));

/** Everything that only exists between `connect()` and `disconnect()`: the
 *  enabled provider and the wallet-side account subscription opened against
 *  it. One value so the adapter can never be half-connected. */
type InjectedSession = {
  injected: Injected;
  unsubscribe: (() => void) | null;
};

/**
 * `enable()` prompts, so it waits for `connect()`. No `switchChain`: the
 * extension has no network to switch and nothing here takes a chain; an
 * extrinsic carries its genesis hash in the payload polkadot-api builds.
 */
const buildInjectedPolkadotAdapter = (
  extensionName: string,
  displayName: string,
  provider: InjectedWindowProvider,
): PolkadotAdapter => {
  let session: InjectedSession | null = null;
  const listeners = new Set<(event: ConnectorEvent) => void>();

  const emit = (event: ConnectorEvent): void => {
    for (const listener of listeners) {
      listener(event);
    }
  };

  const closeSession = (): void => {
    session?.unsubscribe?.();
    session = null;
  };

  const handleWalletAccounts = (accounts: ReadonlyArray<InjectedAccount>): void => {
    if (accounts.length === 0) {
      closeSession();
      emit({ type: "disconnected" });
      return;
    }
    emit({ accounts: accounts.map(toAccount), type: "accountsChanged" });
  };

  const openSession = (injected: Injected): void => {
    closeSession();
    const opened: InjectedSession = { injected, unsubscribe: null };
    session = opened;
    try {
      const unsubscribe = injected.accounts.subscribe?.(handleWalletAccounts);
      if (unsubscribe === undefined) {
        return;
      }
      // Wallets may fire the callback synchronously; an empty first payload
      // closes the session before this assignment, so never revive it.
      if (session === opened) {
        opened.unsubscribe = unsubscribe;
      } else {
        unsubscribe();
      }
    } catch (error) {
      logWarn(`[butr/polkadot] ${displayName} accounts.subscribe threw:`, error);
    }
  };

  const requireInjected = (): Injected => {
    if (session === null) {
      throw new Error(`Wallet ${displayName} is not connected`);
    }
    return session.injected;
  };

  const subscribe = (listener: (event: ConnectorEvent) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const signMessage = async (
    message: Uint8Array,
    options?: AccountOptions,
  ): Promise<SignedMessage> => {
    const injected = requireInjected();
    if (injected.signer.signRaw === undefined) {
      throw new Error(`Wallet ${displayName} does not expose signRaw`);
    }
    const exposed = await injected.accounts.get();
    const requested = options?.account;
    const match =
      requested === undefined
        ? exposed[0]
        : exposed.find((a) => a.address === requested.walletAddress);
    if (match === undefined) {
      throw new Error(
        requested === undefined
          ? `Wallet ${displayName} has no connected account`
          : `Wallet ${displayName} does not expose account ${requested.walletAddress}`,
      );
    }
    const wrapped = wrapBytes(message);
    const result = await injected.signer.signRaw({
      address: match.address,
      data: bytesToHex(wrapped),
      type: "bytes",
    });
    return { signature: hexToBytes(result.signature), signedMessage: wrapped };
  };

  return {
    chainPlatform: "polkadot",

    // injectedWeb3 has no silent check, so `silent` still calls `enable()`.
    // It only prompts an origin the extension has not authorised, and a
    // session being restored already is.
    async connect() {
      const injected = await provider.enable(DAPP_NAME);
      const accounts = await injected.accounts.get();
      if (accounts.length === 0) {
        throw new Error(`Wallet ${displayName} exposed no accounts`);
      }
      openSession(injected);
    },

    async disconnect() {
      closeSession();
      await Promise.resolve();
    },

    async getAccounts() {
      if (session === null) {
        return [];
      }
      const accounts = await session.injected.accounts.get();
      return accounts.map(toAccount);
    },

    async getSigner() {
      const extension = requireInjected();
      await Promise.resolve();
      return { extension, extensionName, kind: "polkadot-injected" };
    },

    icon: sanitizeIcon(GENERIC_POLKADOT_ICON),
    id: `injected:polkadot:${toKebab(extensionName)}`,
    name: displayName,

    // `signRaw` and `accounts.subscribe` are optional in injectedWeb3 and
    // live on the object `enable()` returns, so both members appear once
    // `connect()` has shown the extension offers them.
    get signMessage() {
      return session?.injected.signer.signRaw === undefined ? undefined : signMessage;
    },

    get subscribe() {
      return session === null || session.unsubscribe === null ? undefined : subscribe;
    },
  };
};

export { buildInjectedPolkadotAdapter };
