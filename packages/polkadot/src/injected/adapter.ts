import type {
  Account,
  ChainBase,
  ConnectorEvent,
  PolkadotAdapter,
  WalletCapabilities,
} from "@usebutr/core";
import { logWarn, sanitizeIcon } from "@usebutr/core";

import { resolveInjectedPolkadotCapabilities } from "../capabilities";
import { POLKADOT_CHAIN_BY_ID, POLKADOT_CHAINS } from "../chains";
import { noRpcBalance, noRpcSendTx, noRpcSendTxToChain, noRpcTransactionReceipt } from "../no-rpc";

import { GENERIC_POLKADOT_ICON } from "./icon";
import type { Injected, InjectedAccount, InjectedWindowProvider } from "./injected-web3";
import { bytesToHex, hexToBytes, wrapBytes } from "./injected-web3";

const DAPP_NAME = "butr";

/** Handle returned by `getSigner()`. Carries the `window.injectedWeb3`
 *  key (`extensionName`) so consumers can bridge to polkadot-api's
 *  `connectInjectedExtension`, the active SS58 address, and the raw
 *  `Injected` object for direct `signer` access. */
type PolkadotSignerHandle = {
  address: string;
  extension: Injected;
  extensionName: string;
};

/**
 * Convert a wallet display name into a stable kebab-case slug for the
 * injected adapter id. Strips anything that isn't a lowercase letter or
 * digit (turning "Polkadot{.js}" → "polkadot-js"), then prepends the
 * injected Polkadot channel prefix.
 *
 * This is intentionally NOT the wallet-standard-shared `slugify` helper;
 * that helper embeds the `wallet-standard:` scheme which is wrong for
 * the injected channel. The ID convention for injected adapters is
 * `injected:polkadot:<slug>`.
 */
const toKebab = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gv, "-")
    .replaceAll(/^-|-$/gv, "");

const buildPolkadotAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address}`,
  walletAddress: address,
});

/** Everything that only exists between `connect()` and `disconnect()`: the
 *  enabled provider and the wallet-side account subscription opened against
 *  it. One value so the adapter can never be half-connected. */
type InjectedSession = {
  injected: Injected;
  unsubscribe: (() => void) | null;
};

/**
 * Wrap a `window.injectedWeb3[name]` provider into a butr
 * `PolkadotAdapter`. The provider is NOT enabled at construction;
 * `enable()` triggers the authorization prompt, so it runs lazily in
 * `connect()`. Before connect, `getAccount` returns null.
 *
 * `id` is `injected:polkadot:<slug>` so consumers can distinguish the
 * injected channel from the Wallet Standard one in their picker.
 */
const buildInjectedPolkadotAdapter = (
  extensionName: string,
  displayName: string,
  provider: InjectedWindowProvider,
): PolkadotAdapter => {
  const capabilities: WalletCapabilities = resolveInjectedPolkadotCapabilities();
  let session: InjectedSession | null = null;
  let chain: ChainBase = POLKADOT_CHAINS.polkadot;
  const listenersSet = new Set<(event: ConnectorEvent) => void>();

  const emit = (event: ConnectorEvent): void => {
    // Snapshot: a listener is free to unsubscribe others from inside its
    // callback, and every listener registered at emit time still gets this
    // event.
    const snapshot = [...listenersSet];
    for (const listener of snapshot) {
      listener(event);
    }
  };

  const emitAccounts = (accounts: ReadonlyArray<InjectedAccount>): void => {
    const built = accounts.map((a) => buildPolkadotAccount(a.address, chain));
    const first = built[0];
    if (first !== undefined) {
      emit({ account: first, accounts: built, type: "accountChanged" });
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
    emitAccounts(accounts);
  };

  const openSession = (injected: Injected): void => {
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

  const firstAddress = async (): Promise<string | null> => {
    if (session === null) {
      return null;
    }
    const accounts = await session.injected.accounts.get();
    return accounts[0]?.address ?? null;
  };

  return {
    capabilities,
    chainPlatform: "polkadot",

    async connect() {
      const injected = await provider.enable(DAPP_NAME);
      const accounts = await injected.accounts.get();
      if (accounts.length === 0) {
        throw new Error(`Wallet ${displayName} exposed no accounts`);
      }
      openSession(injected);
    },

    disconnect: () => {
      closeSession();
      return Promise.resolve();
    },

    async getAccount() {
      const address = await firstAddress();
      return address === null ? null : buildPolkadotAccount(address, chain);
    },

    async getAccounts() {
      if (session === null) {
        return [];
      }
      const accounts = await session.injected.accounts.get();
      return accounts.map((a) => buildPolkadotAccount(a.address, chain));
    },

    getBalance: noRpcBalance,

    async getSigner() {
      const ext = requireInjected();
      const address = await firstAddress();
      if (address === null) {
        throw new Error("No connected account");
      }
      const handle: PolkadotSignerHandle = { address, extension: ext, extensionName };
      return handle;
    },

    getTransactionReceipt: noRpcTransactionReceipt,

    icon: sanitizeIcon(GENERIC_POLKADOT_ICON),
    id: `injected:polkadot:${toKebab(extensionName)}`,
    name: displayName,

    sendTx: noRpcSendTx,

    sendTxToChain: noRpcSendTxToChain,

    async signMessage(msg, account) {
      const ext = requireInjected();
      if (ext.signer.signRaw === undefined) {
        throw new Error(`Wallet ${displayName} does not expose signRaw`);
      }
      const address = account?.walletAddress ?? (await firstAddress());
      if (address === null || address === "") {
        throw new Error("No connected account");
      }
      const wrapped = wrapBytes(msg);
      const result = await ext.signer.signRaw({
        address,
        data: bytesToHex(wrapped),
        type: "bytes",
      });
      return { signature: hexToBytes(result.signature), signedMessage: wrapped };
    },

    subscribe(listener) {
      listenersSet.add(listener);
      return () => {
        listenersSet.delete(listener);
      };
    },

    async switchChain(target) {
      if (target.namespace !== "polkadot") {
        throw new Error(
          `Polkadot adapter received non-Polkadot chain "${target.id}". Pass a chain with namespace "polkadot".`,
        );
      }
      chain = POLKADOT_CHAIN_BY_ID.get(target.id) ?? target;
      if (session === null) {
        return;
      }
      emitAccounts(await session.injected.accounts.get());
    },
  };
};

export type { PolkadotSignerHandle };
export { buildInjectedPolkadotAdapter };
