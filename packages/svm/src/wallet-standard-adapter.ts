import type { Account, ChainBase, ConnectorEvent, WalletAdapter } from "@usebutr/core";
import { logWarn } from "@usebutr/core";
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

import { resolveWalletStandardCapabilities } from "./capabilities";
import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignInFeature,
  SolanaSignMessageFeature,
  SolanaSignTransactionFeature,
} from "./wallet-standard-types";

const SOLANA_PREFIX = "solana:";
const SOLANA_DECIMALS = 9;

/** Cross-platform Uint8Array → base64. `Buffer` would be Node-only and
 *  breaks the package in browsers without a polyfill. `btoa` is
 *  available everywhere butr runs (browsers, RN since Hermes, Node 16+,
 *  Bun, Deno). */
const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCodePoint(byte);
  }
  return btoa(binary);
};

const slugify = (name: string): string => kitSlugify("svm", name);

const pickSolanaChain = (wallet: WalletStandardWallet): string | null => {
  // Prefer mainnet-beta, then the first solana chain advertised.
  const mainnet = wallet.chains.find((c) => c === "solana:mainnet" || c === "solana:mainnet-beta");
  if (mainnet) {
    return mainnet;
  }
  return wallet.chains.find((c) => c.startsWith(SOLANA_PREFIX)) ?? null;
};

const buildSolanaChain = (chainId: string, walletName: string): ChainBase => ({
  id: chainId,
  // Same stance as the EIP-6963 side: we don't ship a chain-id → name
  // table. Consumers overlay via structural typing.
  name: walletName,
  namespace: "solana",
  reference: chainId.slice(SOLANA_PREFIX.length),
});

const buildSolanaAccount = (address: string, chain: ChainBase): Account =>
  buildAccount(address, chain);

/**
 * Adapt a Solana Wallet Standard `Wallet` object into a butr
 * `WalletAdapter`. Returns `null` if the wallet doesn't advertise any
 * Solana chain or doesn't expose `standard:connect` — both required
 * for butr to do anything useful with it.
 *
 * **Capability gating**
 *
 *  - `signMessage` is only present if the wallet advertises
 *    `solana:signMessage`. Without it, calling `adapter.signMessage`
 *    rejects with a clear error.
 *  - `sendTx` / `sendTxToChain` use `solana:signAndSendTransaction`.
 *    Without it, those methods reject.
 *  - `subscribe` is wired through `standard:events`. Wallets that
 *    don't expose events get a no-op unsubscribe.
 *
 * **Known limitations**
 *
 *  - `getBalance` returns `{ value: 0n, formatted: "0", … }`. Solana
 *    balance reads require an RPC connection that's outside butr's
 *    scope; consumers wrap their own RPC client.
 *  - `getTransactionReceipt` returns `{ status: "Pending" }`. Same
 *    reason — needs an RPC.
 *  - `switchChain` updates butr's view of the current Solana cluster
 *    locally and routes subsequent `signAndSendTransaction` calls
 *    through the new chain. Wallet Standard has no "tell the wallet
 *    to switch cluster" RPC; the wallet's own UI controls its global
 *    cluster setting, and `signAndSendTransaction` accepts the chain
 *    per-call. The chain must be one the wallet advertises in
 *    `wallet.chains`; otherwise the call rejects.
 *  - `requestAccounts` re-runs `standard:connect`. Some wallets show
 *    their account picker again; others (those that "remember"
 *    authorisations) silently return the existing accounts. butr
 *    refreshes the pool entry's `accounts` array either way.
 *  - `switchAccount` is intentionally unimplemented. Wallet Standard
 *    has no silent "use address X" feature — the user picks the active
 *    account through the wallet's own UI. `signAndSendTransaction`
 *    accepts an `account` input, so consumers needing per-tx address
 *    selection can pick one from `accounts` at call time.
 */
const buildSvmAdapter = (
  wallet: WalletStandardWallet,
  /** Optional. Called with a function that pushes a synthetic
   *  `disconnected` event to all current subscribers. The discovery
   *  layer invokes it on Wallet Standard `unregister` so a connected
   *  pool entry tears down when its extension is removed. */
  registerDisconnector?: (emit: () => void) => void,
): WalletAdapter | null => {
  const solanaChainId = pickSolanaChain(wallet);
  if (!solanaChainId) {
    return null;
  }
  const connect = getFeature<StandardConnectFeature>(wallet, "standard:connect");
  if (!connect) {
    return null;
  }

  const disconnect = getFeature<StandardDisconnectFeature>(wallet, "standard:disconnect");
  const events = getFeature<StandardEventsFeature>(wallet, "standard:events");
  const signMessage = getFeature<SolanaSignMessageFeature>(wallet, "solana:signMessage");
  const signAndSendTx = getFeature<SolanaSignAndSendTransactionFeature>(
    wallet,
    "solana:signAndSendTransaction",
  );
  const signTx = getFeature<SolanaSignTransactionFeature>(wallet, "solana:signTransaction");
  const signIn = getFeature<SolanaSignInFeature>(wallet, "solana:signIn");

  // Current Solana cluster. Mutable so `switchChain` can route subsequent
  // `signAndSendTransaction` calls through a different cluster without
  // rebuilding the adapter. butr's reducer learns about chain changes
  // via the `accountChanged` events emitted to subscribers below.
  let currentChainId = solanaChainId;
  const currentChain = (): ChainBase => buildSolanaChain(currentChainId, wallet.name);

  // Local listener set so `switchChain` (and `requestAccounts`) can
  // synthesise `accountChanged` events that flow into butr's pool.
  // Wallet-native events from `standard:events` are bridged alongside.
  const listeners = new Set<(event: ConnectorEvent) => void>();
  const notifyAccountChanged = () => {
    if (wallet.accounts.length === 0) {
      return;
    }
    const chain = currentChain();
    const built = wallet.accounts.map((a) => buildSolanaAccount(a.address, chain));
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
    capabilities: resolveWalletStandardCapabilities({
      chainCount: wallet.chains.length,
      features: {
        events: Boolean(events),
        signAndSendTransaction: Boolean(signAndSendTx),
        signIn: Boolean(signIn),
        signMessage: Boolean(signMessage),
        signTransaction: Boolean(signTx),
      },
    }),
    chainPlatform: "svm",

    async connect(opts) {
      // Forward `silent` so eager hydration restores already-authorized
      // accounts without re-opening the wallet's approval UI. Wallets
      // that don't honour `silent` fall back to their normal behaviour.
      await connect.connect(opts?.silent ? { silent: true } : undefined);
    },

    async disconnect() {
      if (disconnect) {
        try {
          await disconnect.disconnect();
        } catch (error) {
          logWarn("[butr] Wallet Standard disconnect threw:", error);
        }
      }
    },

    getAccount() {
      const address = pickFirstAddress(wallet.accounts);
      if (!address) {
        return Promise.resolve(null);
      }
      return Promise.resolve(buildSolanaAccount(address, currentChain()));
    },

    getAccounts() {
      const chain = currentChain();
      return Promise.resolve(wallet.accounts.map((a) => buildSolanaAccount(a.address, chain)));
    },

    getBalance() {
      // Wallet Standard exposes no balance feature. Consumers wrap
      // their own RPC client; this default keeps the type signature
      // honoured without lying about a value we don't have.
      return Promise.resolve({
        decimals: SOLANA_DECIMALS,
        formatted: "0",
        symbol: "SOL",
        value: 0n,
      });
    },

    getSigner() {
      // Consumers cast to their preferred wrapper (e.g. an Anchor
      // provider built around the wallet's signTransaction feature).
      return Promise.resolve(wallet);
    },

    getTransactionReceipt() {
      // Same reason as `getBalance` — no RPC.
      return Promise.resolve({ status: "Pending" as const });
    },

    icon: wallet.icon,
    id: slugify(wallet.name),
    name: wallet.name,

    async requestAccounts() {
      // Wallet Standard has no equivalent of EIP-2255's
      // `wallet_requestPermissions`. The closest we can do is re-run
      // `standard:connect`, which prompts the user on wallets that
      // surface their picker each time and silently returns the
      // existing list on wallets that remember authorisations.
      // butr's runtime calls `getAccounts()` afterwards to refresh
      // the pool entry, so newly-exposed addresses appear either way.
      await connect.connect();
    },

    async sendTx(tx, account) {
      if (!signAndSendTx) {
        throw new Error(`Wallet ${wallet.name} does not advertise solana:signAndSendTransaction`);
      }
      const wsAccount = account
        ? pickAccountByAddress(wallet.accounts, account.walletAddress)
        : (wallet.accounts[0] ?? null);
      if (!wsAccount) {
        throw new Error("No connected account");
      }
      if (!(tx instanceof Uint8Array)) {
        throw new TypeError("SVM sendTx expects a serialized transaction (Uint8Array)");
      }
      const [output] = await signAndSendTx.signAndSendTransaction({
        account: wsAccount,
        chain: currentChainId,
        transaction: tx,
      });
      if (!output) {
        throw new Error("signAndSendTransaction returned no outputs");
      }
      return bytesToBase64(output.signature);
    },

    sendTxToChain(tx, _targetChainId, account, cb) {
      // Solana Wallet Standard's signAndSendTransaction takes the
      // target chain directly. `targetChainId` is the decimal-string
      // form butr uses, but the wallet expects a CAIP-2 chain string.
      // For now we honour the connector's primary `solanaChainId` and
      // let consumers route per-chain at a higher level if they need
      // multi-cluster support.
      cb?.();
      return this.sendTx(tx, account);
    },

    async signMessage(msg, account) {
      if (!signMessage) {
        throw new Error(`Wallet ${wallet.name} does not advertise solana:signMessage`);
      }
      const wsAccount = account
        ? pickAccountByAddress(wallet.accounts, account.walletAddress)
        : (wallet.accounts[0] ?? null);
      if (!wsAccount) {
        throw new Error("No connected account");
      }
      const [output] = await signMessage.signMessage({ account: wsAccount, message: msg });
      if (!output) {
        throw new Error("signMessage returned no outputs");
      }
      return { signature: output.signature, signedMessage: output.signedMessage };
    },

    ...(signTx
      ? {
          async signTransaction(tx, account) {
            // Sign-only path for wallets without
            // solana:signAndSendTransaction. butr ships no RPC, so the
            // caller broadcasts the returned bytes with their own
            // client. Gated by capabilities.signTransaction.
            const wsAccount = account
              ? pickAccountByAddress(wallet.accounts, account.walletAddress)
              : (wallet.accounts[0] ?? null);
            if (!wsAccount) {
              throw new Error("No connected account");
            }
            if (!(tx instanceof Uint8Array)) {
              throw new TypeError(
                "SVM signTransaction expects a serialized transaction (Uint8Array)",
              );
            }
            const [output] = await signTx.signTransaction({
              account: wsAccount,
              chain: currentChainId,
              transaction: tx,
            });
            if (!output) {
              throw new Error("signTransaction returned no outputs");
            }
            return output.signedTransaction;
          },
        }
      : {}),

    ...(signIn
      ? {
          async signIn(input) {
            // Sign In With Solana. Returns the authenticated account
            // plus the signed statement for server-side verification.
            const [output] = await signIn.signIn(input);
            if (!output) {
              throw new Error("signIn returned no outputs");
            }
            return {
              account: buildSolanaAccount(output.account.address, currentChain()),
              signature: output.signature,
              signedMessage: output.signedMessage,
            };
          },
        }
      : {}),

    subscribe(listener) {
      listeners.add(listener);
      let unsubWallet: (() => void) | null = null;
      if (events) {
        const unsub = events.on("change", (changes) => {
          // Chain change: the wallet switched cluster. Re-point
          // currentChainId so subsequent signAndSendTransaction routes
          // through it, mirroring `switchChain`'s local-state model.
          if (changes.chains) {
            const next =
              changes.chains.find((c) => c === "solana:mainnet" || c === "solana:mainnet-beta") ??
              changes.chains.find((c) => c.startsWith(SOLANA_PREFIX));
            if (next) {
              currentChainId = next;
            }
          }

          if (changes.accounts) {
            if (changes.accounts.length === 0) {
              listener({ type: "disconnected" });
              return;
            }
            // Forward the FULL accounts list — Wallet Standard's
            // change.accounts reflects the wallet's current exposure
            // set. Mirroring it into the pool entry keeps the array in
            // sync with what the wallet actually allows us to sign with,
            // so single-account-exposure wallets (Phantom Solana,
            // MetaMask Snap) don't accumulate stale addresses.
            const chain = currentChain();
            const built = changes.accounts.map((a) => buildSolanaAccount(a.address, chain));
            const first = built[0];
            if (!first) {
              return;
            }
            listener({ account: first, accounts: built, type: "accountChanged" });
            return;
          }

          // Chains changed without an accounts change — still push the
          // new chain into the pool entry via the same path switchChain
          // uses, so consumers see the cluster swap.
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
      if (chain.namespace !== "solana") {
        throw new Error(
          `SVM adapter received non-Solana chain "${chain.id}". Pass a chain with namespace "solana".`,
        );
      }
      // The wallet must advertise this cluster — otherwise
      // signAndSendTransaction will reject the chain string later.
      if (!wallet.chains.includes(chain.id)) {
        throw new Error(
          `Wallet ${wallet.name} does not advertise chain "${chain.id}". Available: ${wallet.chains.join(", ")}`,
        );
      }
      currentChainId = chain.id;
      // Synthesise an `accountChanged` so butr's reducer updates the
      // pool entry's chain — the wallet itself has no event to fire here.
      notifyAccountChanged();
      return Promise.resolve();
    },
  };
};

export { buildSvmAdapter, slugify };
