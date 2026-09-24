import type {
  Account,
  BitcoinAdapter,
  BitcoinTransfer,
  ChainBase,
  ConnectorEvent,
  TransactionOptions,
} from "@usebutr/core";
import {
  BITCOIN_CHAINS,
  BITCOIN_CHAINS_LIST,
  base64ToBytes,
  buildAccount,
  bytesToHex,
  hexToBytes,
  logWarn,
  resolveChain,
} from "@usebutr/core";

import { assertBitcoinChain, chainMismatch } from "./chain";
import { GENERIC_BITCOIN_ICON } from "./icon";

type UnisatNetwork = "livenet" | "mainnet" | "signet" | "testnet";

/** The only networks UniSat's `switchNetwork` accepts. */
type SwitchableNetwork = "livenet" | "testnet";

/** UniSat-style provider: a single object on `window.unisat` with the
 *  same four methods every UniSat-derivative wallet exposes (UniSat
 *  itself, OKX Wallet's Bitcoin path at `window.okxwallet.bitcoin`). */
type UnisatProvider = {
  getAccounts: () => Promise<ReadonlyArray<string>>;
  getNetwork?: () => Promise<UnisatNetwork>;
  on?: (
    event: "accountsChanged" | "networkChanged",
    listener: (...args: Array<UnisatEventValue>) => void,
  ) => void;
  pushPsbt?: (psbtHex: string) => Promise<string>;
  removeListener?: (
    event: "accountsChanged" | "networkChanged",
    listener: (...args: Array<UnisatEventValue>) => void,
  ) => void;
  requestAccounts: () => Promise<ReadonlyArray<string>>;
  sendBitcoin?: (recipient: string, amount: number) => Promise<string>;
  signMessage: (message: string, type?: "ecdsa" | "bip322-simple") => Promise<string>;
  signPsbt: (psbtHex: string, options?: UnisatSignPsbtOptions) => Promise<string>;
  /** UniSat has it; OKX's `window.okxwallet.bitcoin` is pinned to mainnet. */
  switchNetwork?: (network: SwitchableNetwork) => Promise<void>;
};

type UnisatEventItem = number | string | null;
type UnisatEventValue = ReadonlyArray<UnisatEventItem> | string | undefined;

type UnisatSignPsbtOptions = {
  autoFinalized?: boolean;
};

const NETWORK_CHAINS: ReadonlyMap<string, ChainBase> = new Map<UnisatNetwork, ChainBase>([
  ["livenet", BITCOIN_CHAINS.mainnet],
  ["mainnet", BITCOIN_CHAINS.mainnet],
  ["signet", BITCOIN_CHAINS.signet],
  ["testnet", BITCOIN_CHAINS.testnet],
]);

const SWITCH_NETWORKS: ReadonlyMap<string, SwitchableNetwork> = new Map([
  [BITCOIN_CHAINS.mainnet.id, "livenet"],
  [BITCOIN_CHAINS.testnet.id, "testnet"],
]);

const toStringArray = (value: UnisatEventValue | undefined): Array<string> =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

/**
 * One adapter covers `window.unisat`, `window.okxwallet.bitcoin` and `window.btc`.
 * The network is wallet-wide, so a call targeting another chain switches it
 * first, or rejects when the provider cannot switch.
 */
const buildUnisatAdapter = (id: string, name: string, provider: UnisatProvider): BitcoinAdapter => {
  // Bound so they keep `this`: they are methods on the wallet's own object.
  const getNetwork = provider.getNetwork?.bind(provider);
  const on = provider.on?.bind(provider);
  const sendBitcoin = provider.sendBitcoin?.bind(provider);
  const switchNetwork = provider.switchNetwork?.bind(provider);

  // Providers without `getNetwork` (legacy `window.btc`) are mainnet wallets.
  let chain: ChainBase = BITCOIN_CHAINS.mainnet;

  const readChain = async (): Promise<ChainBase> => {
    if (getNetwork === undefined) {
      return chain;
    }
    const network = await getNetwork();
    const match = NETWORK_CHAINS.get(network);
    if (match === undefined) {
      throw new Error(`Wallet ${name} reported an unknown network "${network}"`);
    }
    return match;
  };

  const readAccounts = async (): Promise<ReadonlyArray<Account>> => {
    const addresses = await provider.getAccounts();
    if (addresses.length === 0) {
      return [];
    }
    try {
      chain = await readChain();
    } catch {
      // Labels only: a locked wallet may refuse `getNetwork` while still
      // listing its accounts, which keep the last known chain.
    }
    return addresses.map((address) => buildAccount(address, chain));
  };

  // UniSat takes no sender: it always signs with its active account.
  const assertActive = async (account?: Account): Promise<void> => {
    if (account === undefined) {
      return;
    }
    const [active] = await provider.getAccounts();
    if (account.walletAddress !== active) {
      throw new Error(
        `Wallet ${name} signs only with its active account, and ${account.walletAddress} is not it`,
      );
    }
  };

  const moveTo = async (target: ChainBase): Promise<void> => {
    assertBitcoinChain(target);
    chain = await readChain();
    if (chain.id === target.id) {
      return;
    }
    const network = SWITCH_NETWORKS.get(target.id);
    if (switchNetwork === undefined || network === undefined) {
      throw chainMismatch(name, chain, target);
    }
    await switchNetwork(network);
    chain = resolveChain(target.id, BITCOIN_CHAINS_LIST);
  };

  // A Bitcoin address encodes its network, so the wallet moves first and
  // the account is matched on the network it will sign on.
  const prepare = async (options?: TransactionOptions): Promise<void> => {
    if (options?.chain !== undefined) {
      await moveTo(options.chain);
    }
    await assertActive(options?.account);
  };

  return {
    chainPlatform: "bitcoin",

    async connect(options) {
      if (options?.silent !== true) {
        await provider.requestAccounts();
        return;
      }
      const accounts = await provider.getAccounts();
      if (accounts.length === 0) {
        throw new Error("No authorized accounts for silent reconnect");
      }
    },

    getAccounts: readAccounts,

    getSigner: () => Promise.resolve({ kind: "unisat", provider }),

    icon: GENERIC_BITCOIN_ICON,
    id,
    name,

    async signMessage(message, options) {
      await assertActive(options?.account);
      const signature = await provider.signMessage(new TextDecoder().decode(message));
      return { signature: base64ToBytes(signature), signedMessage: message };
    },

    async signTransaction(psbt, options) {
      await prepare(options);
      return hexToBytes(await provider.signPsbt(bytesToHex(psbt)));
    },

    ...(sendBitcoin !== undefined && {
      async sendTx({ amount, recipient }: BitcoinTransfer, options?: TransactionOptions) {
        await prepare(options);
        return sendBitcoin(recipient, Number(amount));
      },
    }),

    ...(on !== undefined && {
      subscribe: (listener: (event: ConnectorEvent) => void) => {
        const emit = (accounts: ReadonlyArray<Account>) => {
          listener(
            accounts.length === 0
              ? { type: "disconnected" }
              : { accounts, type: "accountsChanged" },
          );
        };
        const onAccountsChanged = (...args: ReadonlyArray<UnisatEventValue>) => {
          emit(toStringArray(args[0]).map((address) => buildAccount(address, chain)));
        };
        // The network is wallet-wide, so a change moves every account with it.
        const reemitAccounts = async () => {
          try {
            emit(await readAccounts());
          } catch (error) {
            logWarn(`[butr] ${name} accounts could not be re-read after a network change:`, error);
          }
        };
        const onNetworkChanged = () => {
          void reemitAccounts();
        };
        on("accountsChanged", onAccountsChanged);
        on("networkChanged", onNetworkChanged);
        return () => {
          provider.removeListener?.("accountsChanged", onAccountsChanged);
          provider.removeListener?.("networkChanged", onNetworkChanged);
        };
      },
    }),

    ...(switchNetwork !== undefined && { switchChain: moveTo }),
  };
};

export type { UnisatProvider };
export { buildUnisatAdapter };
