import type { WalletAdapter } from "@usebutr/core";
import type {
  Chain,
  Network,
  SignAndSendSigner,
  TxHash,
  UnsignedTransaction,
} from "@wormhole-foundation/sdk-connect";

// Solana `UnsignedTransaction` wraps a `VersionedTransaction` (or
// legacy `Transaction`) under `.transaction`. Both expose `.serialize()`.
type SolanaUnsignedTx<N extends Network, C extends Chain> = UnsignedTransaction<N, C> & {
  description: string;
  transaction: {
    transaction: { serialize: () => Uint8Array };
  };
};

/**
 * Routes Wormhole-built Solana transactions through butr's SVM
 * adapter, which signs and broadcasts via Wallet Standard's
 * `solana:signAndSendTransaction` feature. The adapter expects a
 * serialized `Uint8Array`; the SDK's `tx.transaction.transaction` is
 * a `VersionedTransaction` we serialize on the way in.
 */
class ButrSvmWormholeSigner<N extends Network, C extends Chain> implements SignAndSendSigner<N, C> {
  private _chain: C;
  private _address: string;
  private _connector: WalletAdapter;

  constructor(chain: C, address: string, connector: WalletAdapter) {
    this._chain = chain;
    this._address = address;
    this._connector = connector;
  }

  // fallow-ignore-next-line unused-class-member
  chain(): C {
    return this._chain;
  }

  // fallow-ignore-next-line unused-class-member
  address(): string {
    return this._address;
  }

  // fallow-ignore-next-line unused-class-member
  async signAndSend(txs: Array<UnsignedTransaction<N, C>>): Promise<Array<TxHash>> {
    const hashes: Array<TxHash> = [];
    // oxlint-disable-next-line no-await-in-loop
    for (const tx of txs as Array<SolanaUnsignedTx<N, C>>) {
      // oxlint-disable-next-line no-await-in-loop, no-console
      console.log(`[wormhole/svm] sending: ${tx.description}`);
      const serialized = tx.transaction.transaction.serialize();
      // butr's SVM adapter returns the transaction signature — that
      // IS the Solana "tx hash."
      // oxlint-disable-next-line no-await-in-loop
      const hash = await this._connector.sendTx(serialized);
      hashes.push(hash);
    }
    return hashes;
  }
}

export { ButrSvmWormholeSigner };
