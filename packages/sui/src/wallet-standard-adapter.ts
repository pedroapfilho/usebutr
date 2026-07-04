import type { Account, ChainBase, ConnectorEvent, WalletAdapter } from "@usebutr/core";
import { base64ToBytes, logWarn, sanitizeIcon } from "@usebutr/core";
import {
  buildAccount,
  getFeature,
  pickAccountByAddress,
  pickFirstAddress,
  slugify as kitSlugify,
} from "@usebutr/wallet-standard-shared";
import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  WalletStandardWallet,
} from "@usebutr/wallet-standard-shared";

import { resolveSuiCapabilities } from "./capabilities";
import type {
  SuiSignAndExecuteTransactionFeature,
  SuiSignPersonalMessageFeature,
  SuiSignTransactionFeature,
} from "./wallet-standard-types";

const SUI_PREFIX = "sui:";
const SUI_DECIMALS = 9;

const slugify = (name: string): string => kitSlugify("sui", name);

const pickSuiChain = (wallet: WalletStandardWallet): string | null => {
  const mainnet = wallet.chains.find((c) => c === "sui:mainnet");
  if (mainnet) {
    return mainnet;
  }
  return wallet.chains.find((c) => c.startsWith(SUI_PREFIX)) ?? null;
};

const buildSuiChain = (chainId: string, walletName: string): ChainBase => ({
  id: chainId,
  // Same posture as SVM: butr ships no chain-id → name table. Consumers
  // overlay via structural typing.
  name: walletName,
  namespace: "sui",
  reference: chainId.slice(SUI_PREFIX.length),
});

const buildSuiAccount = (address: string, chain: ChainBase): Account =>
  buildAccount(address, chain);

/** Coerce butr's `unknown` tx into the shape `sui:signAndExecuteTransaction`
 *  expects (an object with `toJSON()` returning a Promise<string>). When
 *  consumers pass a base64 string directly, we wrap it in a stub object so
 *  the feature contract stays satisfied without us depending on
 *  `@mysten/sui`. */
const coerceSuiTransaction = (tx: unknown): { toJSON: () => Promise<string> } | string => {
  if (typeof tx === "string") {
    return tx;
  }
  if (tx && typeof tx === "object" && "toJSON" in tx && typeof tx.toJSON === "function") {
    return tx as { toJSON: () => Promise<string> };
  }
  throw new TypeError(
    "Sui sendTx/signTransaction expects a @mysten/sui Transaction (with toJSON()) or a base64-encoded string",
  );
};

/**
 * Adapt a Sui Wallet Standard `Wallet` into a butr `WalletAdapter`.
 *
 * Returns `null` if the wallet doesn't advertise any Sui chain or doesn't
 * expose `standard:connect`. Same posture as `buildSvmAdapter`: gate
 * features on what each wallet advertises, return placeholders for
 * RPC-backed reads (`getBalance`, `getTransactionReceipt`), forward
 * `subscribe` through `standard:events`.
 *
 * **Known limitations**
 *
 *  - `getBalance` returns a `{ value: 0n, symbol: "SUI" }` placeholder.
 *    Consumers wrap `@mysten/sui`'s `SuiClient` for real reads.
 *  - `getTransactionReceipt` returns `"Pending"` for the same reason.
 *  - `switchChain` is local-state-only (mirrors SVM). Sui Wallet Standard
 *    has no "tell the wallet to switch network" RPC; the wallet's UI
 *    controls its global cluster setting.
 */
const buildSuiAdapter = (
  wallet: WalletStandardWallet,
  /** Optional. Called with a function that pushes a synthetic
   *  `disconnected` event to all current subscribers. The discovery
   *  layer invokes it on Wallet Standard `unregister`. */
  registerDisconnector?: (emit: () => void) => void,
): WalletAdapter | null => {
  const suiChainId = pickSuiChain(wallet);
  if (!suiChainId) {
    return null;
  }
  const connect = getFeature<StandardConnectFeature>(wallet, "standard:connect");
  if (!connect) {
    return null;
  }

  const disconnect = getFeature<StandardDisconnectFeature>(wallet, "standard:disconnect");
  const events = getFeature<StandardEventsFeature>(wallet, "standard:events");
  const signMessage = getFeature<SuiSignPersonalMessageFeature>(wallet, "sui:signPersonalMessage");
  const signAndExecute = getFeature<SuiSignAndExecuteTransactionFeature>(
    wallet,
    "sui:signAndExecuteTransaction",
  );
  const signTx = getFeature<SuiSignTransactionFeature>(wallet, "sui:signTransaction");

  let currentChainId = suiChainId;
  const currentChain = (): ChainBase => buildSuiChain(currentChainId, wallet.name);

  const listeners = new Set<(event: ConnectorEvent) => void>();
  const notifyAccountChanged = () => {
    if (wallet.accounts.length === 0) {
      return;
    }
    const chain = currentChain();
    const built = wallet.accounts.map((a) => buildSuiAccount(a.address, chain));
    const first = built[0];
    if (!first) {
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
    capabilities: resolveSuiCapabilities({
      chainCount: wallet.chains.filter((c) => c.startsWith(SUI_PREFIX)).length,
      features: {
        events: Boolean(events),
        signAndExecuteTransaction: Boolean(signAndExecute),
        signMessage: Boolean(signMessage),
        signTransaction: Boolean(signTx),
      },
    }),
    chainPlatform: "sui",

    async connect(opts) {
      await connect.connect(opts?.silent ? { silent: true } : undefined);
    },

    async disconnect() {
      if (disconnect) {
        try {
          await disconnect.disconnect();
        } catch (error) {
          logWarn("[butr] Sui Wallet Standard disconnect threw:", error);
        }
      }
    },

    getAccount() {
      const address = pickFirstAddress(wallet.accounts);
      if (!address) {
        return Promise.resolve(null);
      }
      return Promise.resolve(buildSuiAccount(address, currentChain()));
    },

    getAccounts() {
      const chain = currentChain();
      return Promise.resolve(wallet.accounts.map((a) => buildSuiAccount(a.address, chain)));
    },

    getBalance() {
      return Promise.resolve({
        decimals: SUI_DECIMALS,
        formatted: "0",
        symbol: "SUI",
        value: 0n,
      });
    },

    getSigner() {
      return Promise.resolve(wallet);
    },

    getTransactionReceipt() {
      return Promise.resolve({ status: "Pending" as const });
    },

    icon: sanitizeIcon(wallet.icon),
    id: slugify(wallet.name),
    name: wallet.name,

    async requestAccounts() {
      await connect.connect();
    },

    async sendTx(tx, account) {
      if (!signAndExecute) {
        throw new Error(`Wallet ${wallet.name} does not advertise sui:signAndExecuteTransaction`);
      }
      const wsAccount = account
        ? pickAccountByAddress(wallet.accounts, account.walletAddress)
        : (wallet.accounts[0] ?? null);
      if (!wsAccount) {
        throw new Error("No connected account");
      }
      const transaction = coerceSuiTransaction(tx);
      const output = await signAndExecute.signAndExecuteTransaction({
        account: wsAccount,
        chain: currentChainId,
        transaction,
      });
      return output.digest;
    },

    sendTxToChain(tx, _targetChainId, account, cb) {
      cb?.();
      return this.sendTx(tx, account);
    },

    async signMessage(msg, account) {
      if (!signMessage) {
        throw new Error(`Wallet ${wallet.name} does not advertise sui:signPersonalMessage`);
      }
      const wsAccount = account
        ? pickAccountByAddress(wallet.accounts, account.walletAddress)
        : (wallet.accounts[0] ?? null);
      if (!wsAccount) {
        throw new Error("No connected account");
      }
      const output = await signMessage.signPersonalMessage({
        account: wsAccount,
        message: msg,
      });
      return {
        signature: base64ToBytes(output.signature),
        signedMessage: base64ToBytes(output.bytes),
      };
    },

    ...(signTx
      ? {
          async signTransaction(tx, account) {
            const wsAccount = account
              ? pickAccountByAddress(wallet.accounts, account.walletAddress)
              : (wallet.accounts[0] ?? null);
            if (!wsAccount) {
              throw new Error("No connected account");
            }
            const transaction = coerceSuiTransaction(tx);
            const output = await signTx.signTransaction({
              account: wsAccount,
              chain: currentChainId,
              transaction,
            });
            return base64ToBytes(output.bytes);
          },
        }
      : {}),

    subscribe(listener) {
      listeners.add(listener);
      let unsubWallet: (() => void) | null = null;
      if (events) {
        const unsub = events.on("change", (changes) => {
          if (changes.chains) {
            const next =
              changes.chains.find((c) => c === "sui:mainnet") ??
              changes.chains.find((c) => c.startsWith(SUI_PREFIX));
            if (next) {
              currentChainId = next;
            }
          }

          if (changes.accounts) {
            if (changes.accounts.length === 0) {
              listener({ type: "disconnected" });
              return;
            }
            const chain = currentChain();
            const built = changes.accounts.map((a) => buildSuiAccount(a.address, chain));
            const first = built[0];
            if (!first) {
              return;
            }
            listener({ account: first, accounts: built, type: "accountChanged" });
            return;
          }

          if (changes.chains) {
            notifyAccountChanged();
          }
        });
        unsubWallet = () => unsub();
      }
      return () => {
        listeners.delete(listener);
        unsubWallet?.();
      };
    },

    switchChain(chain) {
      if (chain.namespace !== "sui") {
        throw new Error(
          `Sui adapter received non-Sui chain "${chain.id}". Pass a chain with namespace "sui".`,
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
  };
};

export { buildSuiAdapter, slugify };
