import type { Account, ChainBase, ConnectorEvent, WalletAdapter } from "@usebutr/core";
import { logWarn, sanitizeIcon } from "@usebutr/core";
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

import { resolveWalletStandardPolkadotCapabilities } from "./capabilities";
import { noRpcBalance, noRpcSendTx, noRpcSendTxToChain, noRpcTransactionReceipt } from "./no-rpc";
import type { PolkadotSignMessageFeature } from "./wallet-standard-types";

const POLKADOT_PREFIX = "polkadot:";

const slugify = (name: string): string => kitSlugify("polkadot", name);

const pickPolkadotChain = (wallet: WalletStandardWallet): string | null =>
  wallet.chains.find((c) => c.startsWith(POLKADOT_PREFIX)) ?? null;

const buildChain = (chainId: string, walletName: string): ChainBase => ({
  id: chainId,
  name: walletName,
  namespace: "polkadot",
  reference: chainId.slice(POLKADOT_PREFIX.length),
});

const buildWsAccount = (address: string, chain: ChainBase): Account => buildAccount(address, chain);

/**
 * Adapt a Wallet Standard wallet advertising `polkadot:*` features into a
 * butr `WalletAdapter`. Returns `null` for wallets that don't advertise a
 * polkadot chain or `standard:connect`. butr ships no RPC, so
 * sendTx/getBalance/getTransactionReceipt are placeholders; transaction
 * signing goes through `getSigner()` (returns the Wallet Standard wallet).
 */
const buildPolkadotWalletStandardAdapter = (
  wallet: WalletStandardWallet,
  registerDisconnector?: (emit: () => void) => void,
): WalletAdapter | null => {
  const chainId = pickPolkadotChain(wallet);
  if (!chainId) {
    return null;
  }
  const connect = getFeature<StandardConnectFeature>(wallet, "standard:connect");
  if (!connect) {
    return null;
  }

  const disconnect = getFeature<StandardDisconnectFeature>(wallet, "standard:disconnect");
  const events = getFeature<StandardEventsFeature>(wallet, "standard:events");
  const signMessage = getFeature<PolkadotSignMessageFeature>(wallet, "polkadot:signMessage");

  let currentChainId = chainId;
  const currentChain = (): ChainBase => buildChain(currentChainId, wallet.name);

  const listeners = new Set<(event: ConnectorEvent) => void>();
  const notifyAccountChanged = () => {
    if (wallet.accounts.length === 0) {
      return;
    }
    const chain = currentChain();
    const built = wallet.accounts.map((a) => buildWsAccount(a.address, chain));
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
    capabilities: resolveWalletStandardPolkadotCapabilities({
      chainCount: wallet.chains.filter((c) => c.startsWith(POLKADOT_PREFIX)).length,
      features: { events: Boolean(events), signMessage: Boolean(signMessage) },
    }),
    chainPlatform: "polkadot",

    async connect(opts) {
      await connect.connect(opts?.silent ? { silent: true } : undefined);
    },

    async disconnect() {
      if (disconnect) {
        try {
          await disconnect.disconnect();
        } catch (error) {
          logWarn("[butr] Polkadot Wallet Standard disconnect threw:", error);
        }
      }
    },

    getAccount() {
      const address = pickFirstAddress(wallet.accounts);
      return Promise.resolve(address ? buildWsAccount(address, currentChain()) : null);
    },

    getAccounts() {
      const chain = currentChain();
      return Promise.resolve(wallet.accounts.map((a) => buildWsAccount(a.address, chain)));
    },

    getBalance: noRpcBalance,

    getSigner() {
      return Promise.resolve(wallet);
    },

    getTransactionReceipt: noRpcTransactionReceipt,

    icon: sanitizeIcon(wallet.icon),
    id: slugify(wallet.name),
    name: wallet.name,

    sendTx: noRpcSendTx,

    sendTxToChain: noRpcSendTxToChain,

    async signMessage(msg, account) {
      if (!signMessage) {
        throw new Error(`Wallet ${wallet.name} does not advertise polkadot:signMessage`);
      }
      const wsAccount = account
        ? pickAccountByAddress(wallet.accounts, account.walletAddress)
        : (wallet.accounts[0] ?? null);
      if (!wsAccount) {
        throw new Error("No connected account");
      }
      const output = await signMessage.signMessage({ account: wsAccount, message: msg });
      return { signature: output.signature, signedMessage: output.signedMessage ?? msg };
    },

    subscribe(listener) {
      listeners.add(listener);
      let unsubWallet: (() => void) | null = null;
      if (events) {
        const unsub = events.on("change", (changes) => {
          if (changes.accounts) {
            if (changes.accounts.length === 0) {
              listener({ type: "disconnected" });
              return;
            }
            const chain = currentChain();
            const built = changes.accounts.map((a) => buildWsAccount(a.address, chain));
            const first = built[0];
            if (first) {
              listener({ account: first, accounts: built, type: "accountChanged" });
            }
          }
        });
        unsubWallet = () => unsub();
      }
      return () => {
        listeners.delete(listener);
        unsubWallet?.();
      };
    },

    switchChain(target) {
      if (target.namespace !== "polkadot") {
        throw new Error(
          `Polkadot adapter received non-Polkadot chain "${target.id}". Pass a chain with namespace "polkadot".`,
        );
      }
      if (!wallet.chains.includes(target.id)) {
        throw new Error(
          `Wallet ${wallet.name} does not advertise chain "${target.id}". Available: ${wallet.chains.join(", ")}`,
        );
      }
      currentChainId = target.id;
      notifyAccountChanged();
      return Promise.resolve();
    },
  };
};

export { buildPolkadotWalletStandardAdapter };
