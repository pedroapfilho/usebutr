import {
  BaseMessageSignerWalletAdapter,
  WalletReadyState,
  type SendTransactionOptions,
  type WalletName,
} from "@solana/wallet-adapter-base";
import {
  type Connection,
  PublicKey,
  Transaction,
  type VersionedTransaction,
} from "@solana/web3.js";
import type { WalletAdapter as ButrWalletAdapter } from "@usebutr/core";
import type { SolanaSignAndSendTransactionFeature, SolanaSignMessageFeature } from "@usebutr/svm";
import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const bytesToBase58 = (bytes: Uint8Array): string => {
  let intVal = 0n;
  for (const byte of bytes) {
    intVal = (intVal << 8n) | BigInt(byte);
  }
  let out = "";
  while (intVal > 0n) {
    const remainder = intVal % 58n;
    intVal /= 58n;
    out = BASE58_ALPHABET[Number(remainder)] + out;
  }
  for (const byte of bytes) {
    if (byte !== 0) {
      break;
    }
    out = `1${out}`;
  }
  return out;
};

/**
 * Bridge a butr-managed Wallet Standard wallet into a
 * `BaseMessageSignerWalletAdapter` so the @solana/wallet-adapter-react
 * ecosystem (and every dapp/lib that consumes that interface) can read it
 * via `useWallet()` without changing a line of consumer code.
 *
 * The bridge is constructed AFTER butr selects a wallet. The adapter's
 * `connected` flag is wired to butr's pool, so the adapter library's
 * autoConnect + UI work out of the box.
 */
// All class members below implement BaseMessageSignerWalletAdapter (interface contract).
class ButrAdapterBridge extends BaseMessageSignerWalletAdapter {
  // fallow-ignore-next-line unused-class-member
  readonly supportedTransactionVersions = new Set<0>([0]);
  // fallow-ignore-next-line unused-class-member
  readonly url = "https://github.com/pedroapfilho/usebutr";

  private _connecting = false;
  private _publicKey: PublicKey | null;
  private readonly _wallet: WalletStandardWallet;

  constructor(
    public readonly butr: ButrWalletAdapter,
    walletStd: WalletStandardWallet,
    address: string,
  ) {
    super();
    this._wallet = walletStd;
    this._publicKey = new PublicKey(address);
  }

  // fallow-ignore-next-line unused-class-member
  get name(): WalletName {
    return this.butr.name as WalletName;
  }

  // fallow-ignore-next-line unused-class-member
  get icon(): string {
    return this.butr.icon ?? "";
  }

  // fallow-ignore-next-line unused-class-member
  get readyState(): WalletReadyState {
    return WalletReadyState.Installed;
  }

  // fallow-ignore-next-line unused-class-member
  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  // fallow-ignore-next-line unused-class-member
  get connecting(): boolean {
    return this._connecting;
  }

  get connected(): boolean {
    return this._publicKey !== null;
  }

  // fallow-ignore-next-line unused-class-member
  connect(): Promise<void> {
    // butr already handled the actual connect handshake; this is the
    // adapter-library lifecycle hook that signals "we're ready".
    if (this.connected) {
      return Promise.resolve();
    }
    this._connecting = true;
    try {
      const pk = this._publicKey;
      if (!pk) {
        return Promise.resolve();
      }
      this.emit("connect", pk);
      return Promise.resolve();
    } finally {
      this._connecting = false;
    }
  }

  // fallow-ignore-next-line unused-class-member
  disconnect(): Promise<void> {
    this._publicKey = null;
    this.emit("disconnect");
    return Promise.resolve();
  }

  // fallow-ignore-next-line unused-class-member
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    const feature = this._wallet.features["solana:signMessage"] as
      | SolanaSignMessageFeature
      | undefined;
    if (!feature) {
      throw new Error("Wallet does not advertise solana:signMessage");
    }
    const account = this._wallet.accounts[0];
    if (!account) {
      throw new Error("No exposed account");
    }
    const [output] = await feature.signMessage({ account, message });
    if (!output) {
      throw new Error("signMessage returned no outputs");
    }
    return output.signature;
  }

  // fallow-ignore-next-line unused-class-member
  signTransaction<T extends Transaction | VersionedTransaction>(_transaction: T): Promise<T> {
    // The Wallet Standard `solana:signTransaction` feature isn't
    // advertised uniformly across wallets — Phantom does, MetaMask Snap
    // (Solana) doesn't. Real dapps that need raw signing without sending
    // would feature-detect here and either implement the wallet-specific
    // path or fall back to signAndSendTransaction. This demo focuses on
    // signAndSendTransaction, so signTransaction stays unimplemented.
    return Promise.reject(
      new Error(
        "signTransaction is not implemented in this demo; use sendTransaction (which wraps signAndSendTransaction).",
      ),
    );
  }

  // fallow-ignore-next-line unused-class-member
  async sendTransaction(
    transaction: Transaction | VersionedTransaction,
    _connection: Connection,
    _options?: SendTransactionOptions,
  ): Promise<string> {
    const feature = this._wallet.features["solana:signAndSendTransaction"] as
      | SolanaSignAndSendTransactionFeature
      | undefined;
    if (!feature) {
      throw new Error("Wallet does not advertise solana:signAndSendTransaction");
    }
    const account = this._wallet.accounts[0];
    if (!account) {
      throw new Error("No exposed account");
    }
    const serialised =
      transaction instanceof Transaction
        ? transaction.serialize({ requireAllSignatures: false })
        : transaction.serialize();
    const [output] = await feature.signAndSendTransaction({
      account,
      chain: "solana:devnet",
      transaction: new Uint8Array(serialised),
    });
    if (!output) {
      throw new Error("signAndSendTransaction returned no outputs");
    }
    return bytesToBase58(output.signature);
  }
}

export { ButrAdapterBridge };
