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
import { bytesToBase58 } from "@usebutr/core";
import { isSolanaSignAndSendTransactionFeature, isSolanaSignMessageFeature } from "@usebutr/svm";
import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";
import { getFeature } from "@usebutr/wallet-standard-shared";

// @solana/wallet-adapter's interface declares Promise-returning methods whose
// bodies are synchronous here; async would only trip require-await.
// oxlint-disable typescript/promise-function-async

/**
 * Constructed only after butr has already connected, so `connect()` is a
 * no-op re-emit; @solana/wallet-adapter-react's autoConnect and UI then
 * resolve without a second connection handshake.
 */
class ButrAdapterBridge extends BaseMessageSignerWalletAdapter {
  // fallow-ignore-next-line unused-class-member -- optional BaseWalletAdapter contract read by @solana/wallet-adapter-base
  readonly supportedTransactionVersions = new Set<0>([0]);
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

  get name(): WalletName {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- SAFETY: WalletName is a compile-time brand over the adapter's display name.
    return this.butr.name as WalletName;
  }

  get icon(): string {
    return this.butr.icon ?? "";
  }

  get readyState(): WalletReadyState {
    return WalletReadyState.Installed;
  }

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get connected(): boolean {
    return this._publicKey !== null;
  }

  connect(): Promise<void> {
    if (this.connected) {
      return Promise.resolve();
    }
    this._connecting = true;
    try {
      const pk = this._publicKey;
      if (pk === null) {
        return Promise.resolve();
      }
      this.emit("connect", pk);
      return Promise.resolve();
    } finally {
      this._connecting = false;
    }
  }

  disconnect(): Promise<void> {
    this._publicKey = null;
    this.emit("disconnect");
    return Promise.resolve();
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    const feature = getFeature(this._wallet, "solana:signMessage", isSolanaSignMessageFeature);
    if (feature === undefined) {
      throw new Error("Wallet does not advertise solana:signMessage");
    }
    const account = this._wallet.accounts[0];
    if (account === undefined) {
      throw new Error("No exposed account");
    }
    const [output] = await feature.signMessage({ account, message });
    if (output === undefined) {
      throw new Error("signMessage returned no outputs");
    }
    return output.signature;
  }

  signTransaction<T extends Transaction | VersionedTransaction>(_transaction: T): Promise<T> {
    return Promise.reject(
      new Error(
        "signTransaction is not implemented in this demo; use sendTransaction (which wraps signAndSendTransaction).",
      ),
    );
  }

  async sendTransaction(
    transaction: Transaction | VersionedTransaction,
    _connection: Connection,
    _options?: SendTransactionOptions,
  ): Promise<string> {
    const feature = getFeature(
      this._wallet,
      "solana:signAndSendTransaction",
      isSolanaSignAndSendTransactionFeature,
    );
    if (feature === undefined) {
      throw new Error("Wallet does not advertise solana:signAndSendTransaction");
    }
    const account = this._wallet.accounts[0];
    if (account === undefined) {
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
    if (output === undefined) {
      throw new Error("signAndSendTransaction returned no outputs");
    }
    return bytesToBase58(output.signature);
  }
}

export { ButrAdapterBridge };
