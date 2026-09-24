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
import type { Account, SvmAdapter } from "@usebutr/core";
import { SVM_CHAINS } from "@usebutr/core";

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

  private readonly _account: Account;
  private _connecting = false;
  private _publicKey: PublicKey | null;

  constructor(
    public readonly butr: SvmAdapter,
    account: Account,
  ) {
    super();
    this._account = account;
    this._publicKey = new PublicKey(account.walletAddress);
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
    if (!this.butr.signMessage) {
      throw new Error(`${this.butr.name} cannot sign messages`);
    }
    const { signature } = await this.butr.signMessage(message, { account: this._account });
    return signature;
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
    if (!this.butr.sendTx) {
      throw new Error(`${this.butr.name} cannot send Solana transactions`);
    }
    const serialised =
      transaction instanceof Transaction
        ? transaction.serialize({ requireAllSignatures: false })
        : transaction.serialize();
    // Wallet Standard routes the chain per call: devnet here never moves the
    // wallet off whatever cluster it is showing.
    const signature = await this.butr.sendTx(new Uint8Array(serialised), {
      account: this._account,
      chain: SVM_CHAINS.devnet,
    });
    return signature;
  }
}

export { ButrAdapterBridge };
