import type {
  Account,
  AccountOptions,
  ChainBase,
  PolkadotAdapter,
  SignedMessage,
} from "@usebutr/core";
import {
  buildAccount,
  createAccountTarget,
  createConnectorEmitter,
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
  const emitter = createConnectorEmitter();
  const target = createAccountTarget({ namespace: "polkadot", wallet: displayName });

  const closeSession = (): void => {
    session?.unsubscribe?.();
    session = null;
  };

  const forwardAccounts = (accounts: ReadonlyArray<InjectedAccount>): void => {
    emitter.emit({ accounts: accounts.map(toAccount), type: "accountsChanged" });
  };

  const openSession = (injected: Injected): void => {
    closeSession();
    const opened: InjectedSession = { injected, unsubscribe: null };
    session = opened;
    try {
      opened.unsubscribe = injected.accounts.subscribe?.(forwardAccounts) ?? null;
    } catch (error) {
      logWarn(`[butr/polkadot] ${displayName} accounts.subscribe threw:`, error);
    }
  };

  const signMessage = async (
    message: Uint8Array,
    options?: AccountOptions,
  ): Promise<SignedMessage> => {
    const { injected } = target.connected(session);
    if (injected.signer.signRaw === undefined) {
      throw new Error(`Wallet ${displayName} does not expose signRaw`);
    }
    const match = target.account(await injected.accounts.get(), options?.account);
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
      const extension = target.connected(session).injected;
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
      return (session?.unsubscribe ?? null) === null ? undefined : emitter.subscribe;
    },
  };
};

export { buildInjectedPolkadotAdapter };
