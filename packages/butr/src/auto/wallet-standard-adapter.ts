import type { Account, ChainBase, WalletAdapter } from "../types";
import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignMessageFeature,
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  WalletStandardWallet,
  WalletStandardWalletAccount,
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

const slugify = (name: string): string =>
  `wallet-standard:${name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")}`;

const getFeature = <T>(wallet: WalletStandardWallet, name: string): T | undefined => {
  const feature = wallet.features[name];
  return feature ? (feature as T) : undefined;
};

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

const buildSolanaAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address}`,
  walletAddress: address,
});

const pickFirstAddress = (accounts: ReadonlyArray<WalletStandardWalletAccount>): string | null => {
  const first = accounts[0];
  return first ? first.address : null;
};

const pickAccountByAddress = (
  accounts: ReadonlyArray<WalletStandardWalletAccount>,
  address: string,
): WalletStandardWalletAccount | undefined =>
  accounts.find((a) => a.address === address) ?? accounts[0];

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
 *  - `switchChain` is a no-op. Solana Wallet Standard doesn't have a
 *    standardised "switch chain" feature; the wallet's chain follows
 *    whichever feature input the caller passes.
 *  - `switchAccount` re-runs `standard:connect`, which reopens the
 *    wallet's account picker. No standardised "switch to address X".
 */
const buildSvmAdapter = (wallet: WalletStandardWallet): WalletAdapter | null => {
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

  const chain = buildSolanaChain(solanaChainId, wallet.name);

  return {
    chainPlatform: "svm",

    async connect() {
      await connect.connect();
    },

    async disconnect() {
      if (disconnect) {
        try {
          await disconnect.disconnect();
        } catch (error) {
          console.warn("[butr] Wallet Standard disconnect threw:", error);
        }
      }
    },

    getAccount() {
      const address = pickFirstAddress(wallet.accounts);
      if (!address) {
        return Promise.resolve(null);
      }
      return Promise.resolve(buildSolanaAccount(address, chain));
    },

    getAccounts() {
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

    id: slugify(wallet.name),
    name: wallet.name,

    async sendTx(tx) {
      if (!signAndSendTx) {
        throw new Error(`Wallet ${wallet.name} does not advertise solana:signAndSendTransaction`);
      }
      const address = pickFirstAddress(wallet.accounts);
      if (!address) {
        throw new Error("No connected account");
      }
      const account = pickAccountByAddress(wallet.accounts, address);
      if (!account) {
        throw new Error("No connected account");
      }
      if (!(tx instanceof Uint8Array)) {
        throw new TypeError("SVM sendTx expects a serialized transaction (Uint8Array)");
      }
      const [output] = await signAndSendTx.signAndSendTransaction({
        account,
        chain: solanaChainId,
        transaction: tx,
      });
      if (!output) {
        throw new Error("signAndSendTransaction returned no outputs");
      }
      return bytesToBase64(output.signature);
    },

    sendTxToChain(tx, _targetChainId, cb) {
      // Solana Wallet Standard's signAndSendTransaction takes the
      // target chain directly. `targetChainId` is the decimal-string
      // form butr uses, but the wallet expects a CAIP-2 chain string.
      // For now we honour the connector's primary `solanaChainId` and
      // let consumers route per-chain at a higher level if they need
      // multi-cluster support.
      cb?.();
      return this.sendTx(tx);
    },

    async signMessage(msg) {
      if (!signMessage) {
        throw new Error(`Wallet ${wallet.name} does not advertise solana:signMessage`);
      }
      const address = pickFirstAddress(wallet.accounts);
      if (!address) {
        throw new Error("No connected account");
      }
      const account = pickAccountByAddress(wallet.accounts, address);
      if (!account) {
        throw new Error("No connected account");
      }
      const [output] = await signMessage.signMessage({ account, message: msg });
      if (!output) {
        throw new Error("signMessage returned no outputs");
      }
      return { signature: output.signature, signedMessage: output.signedMessage };
    },

    subscribe(listener) {
      if (!events) {
        return () => {};
      }
      const unsub = events.on("change", (changes) => {
        if (!changes.accounts) {
          return;
        }
        if (changes.accounts.length === 0) {
          listener({ type: "disconnected" });
          return;
        }
        const first = changes.accounts[0];
        if (!first) {
          return;
        }
        listener({
          account: buildSolanaAccount(first.address, chain),
          type: "accountChanged",
        });
      });
      return () => unsub();
    },

    async switchAccount(_address) {
      // No standardised "switch to address X" feature. Re-running
      // standard:connect prompts the wallet's account picker.
      await connect.connect();
    },

    switchChain(_chain) {
      // Wallet Standard doesn't expose a switchChain feature. The
      // wallet sticks to whichever chain the caller asks for at
      // sign/send time. Consumers needing real chain switching wrap
      // the adapter at a higher level.
      return Promise.resolve();
    },
  };
};

export { buildSvmAdapter, slugify };
