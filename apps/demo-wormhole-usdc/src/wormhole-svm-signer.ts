import { type Signature, createSolanaRpc, getBase58Decoder, getBase64Encoder } from "@solana/kit";
import type { WalletAdapter } from "@usebutr/core";
import type {
  Chain,
  Network,
  SignAndSendSigner,
  TxHash,
  UnsignedTransaction,
} from "@wormhole-foundation/sdk-connect";

type SolanaRpc = ReturnType<typeof createSolanaRpc>;

const CONFIRM_TIMEOUT_MS = 60_000;
const CONFIRM_POLL_MS = 1500;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// butr's SVM adapter returns the signature base64-encoded (its
// cross-platform `bytesToBase64`). Solana explorers and RPCs speak
// base58, so re-encode to the canonical signature string.
const toBase58Signature = (base64: string): string =>
  getBase58Decoder().decode(getBase64Encoder().encode(base64));

// Poll until the signature confirms. `completeTransfer` resolving means
// "minted on-chain" — so the demo's balance refetch sees the funds and
// the CreateATA tx is confirmed before the dependent Redeem is sent.
const confirmSignature = async (rpc: SolanaRpc, sig: string): Promise<void> => {
  const deadline = Date.now() + CONFIRM_TIMEOUT_MS;
  while (Date.now() < deadline) {
    // oxlint-disable-next-line no-await-in-loop
    const { value } = await rpc.getSignatureStatuses([sig as Signature]).send();
    const status = value[0];
    if (status) {
      if (status.err) {
        throw new Error(`Solana tx ${sig} failed: ${JSON.stringify(status.err)}`);
      }
      if (status.confirmationStatus === "confirmed" || status.confirmationStatus === "finalized") {
        return;
      }
    }
    // oxlint-disable-next-line no-await-in-loop
    await sleep(CONFIRM_POLL_MS);
  }
  throw new Error(`Solana tx ${sig} not confirmed within ${CONFIRM_TIMEOUT_MS}ms`);
};

// A web3.js v1 `Keypair`-shaped signer the SDK may hand us for
// program-derived accounts that need their own signature.
type Web3Signer = { publicKey: unknown; secretKey: Uint8Array };

// Legacy `Transaction`: `recentBlockhash` is a mutable base58 string and
// the unsigned tx serializes only with `requireAllSignatures: false`.
type LegacyTx = {
  partialSign: (...signers: Array<Web3Signer>) => void;
  recentBlockhash?: string;
  serialize: (config?: {
    requireAllSignatures?: boolean;
    verifySignatures?: boolean;
  }) => Uint8Array;
};

// `VersionedTransaction`: the blockhash lives on the compiled message and
// `sign` takes an array of signers.
type VersionedTx = {
  message: { recentBlockhash: string };
  serialize: () => Uint8Array;
  sign: (signers: Array<Web3Signer>) => void;
};

// Wormhole's Solana `UnsignedTransaction` wraps a web3.js `Transaction`
// (or `VersionedTransaction`) plus any extra program signers under
// `.transaction`.
type SolanaUnsignedTx<N extends Network, C extends Chain> = UnsignedTransaction<N, C> & {
  description: string;
  transaction: {
    signers?: Array<Web3Signer>;
    transaction: LegacyTx | VersionedTx;
  };
};

const isVersioned = (tx: LegacyTx | VersionedTx): tx is VersionedTx =>
  "message" in tx && typeof (tx as VersionedTx).message === "object";

/**
 * Routes Wormhole-built Solana transactions through butr's SVM adapter,
 * which signs and broadcasts via Wallet Standard's
 * `solana:signAndSendTransaction`. The adapter expects serialized bytes.
 *
 * The SDK builds redeem transactions WITHOUT a `recentBlockhash` — it
 * expects the signer to attach a fresh one at send time (a stale
 * blockhash would expire before the user approves). So we fetch the
 * latest blockhash from the destination chain's RPC, set it, apply any
 * program signers the SDK supplied, then serialize. Skipping this step
 * makes `Transaction.serialize()` throw "Transaction recentBlockhash
 * required".
 */
class ButrSvmWormholeSigner<N extends Network, C extends Chain> implements SignAndSendSigner<N, C> {
  private _chain: C;
  private _address: string;
  private _connector: WalletAdapter;
  private _rpcUrl: string;

  constructor(chain: C, address: string, connector: WalletAdapter, rpcUrl: string) {
    this._chain = chain;
    this._address = address;
    this._connector = connector;
    this._rpcUrl = rpcUrl;
  }

  chain(): C {
    return this._chain;
  }

  address(): string {
    return this._address;
  }

  async signAndSend(txs: Array<UnsignedTransaction<N, C>>): Promise<Array<TxHash>> {
    const rpc = createSolanaRpc(this._rpcUrl);
    const hashes: Array<TxHash> = [];
    for (const tx of txs as Array<SolanaUnsignedTx<N, C>>) {
      // oxlint-disable-next-line no-console
      console.log(`[wormhole/svm] sending: ${tx.description}`);
      const { signers, transaction } = tx.transaction;
      // oxlint-disable-next-line no-await-in-loop
      const { value } = await rpc.getLatestBlockhash().send();
      let serialized: Uint8Array;
      if (isVersioned(transaction)) {
        transaction.message.recentBlockhash = value.blockhash;
        if (signers && signers.length > 0) {
          transaction.sign(signers);
        }
        serialized = transaction.serialize();
      } else {
        transaction.recentBlockhash = value.blockhash;
        if (signers && signers.length > 0) {
          transaction.partialSign(...signers);
        }
        // The wallet adds the fee-payer signature, so don't require a
        // fully-signed tx here.
        serialized = transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        });
      }
      // oxlint-disable-next-line no-await-in-loop
      const rawSignature = await this._connector.sendTx(serialized);
      const signature = toBase58Signature(rawSignature);
      // oxlint-disable-next-line no-await-in-loop
      await confirmSignature(rpc, signature);
      hashes.push(signature);
    }
    return hashes;
  }
}

export { ButrSvmWormholeSigner };
