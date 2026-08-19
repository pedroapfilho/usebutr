import { assertIsSignature, createSolanaRpc } from "@solana/kit";
import type { WalletAdapter } from "@usebutr/core";
import type {
  Chain,
  Network,
  SignAndSendSigner,
  TxHash,
  UnsignedTransaction,
} from "@wormhole-foundation/sdk-connect";
import { z } from "zod";

type SolanaRpc = ReturnType<typeof createSolanaRpc>;

const CONFIRM_TIMEOUT_MS = 60_000;
const CONFIRM_POLL_MS = 1500;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const confirmSignature = async (rpc: SolanaRpc, sig: string): Promise<void> => {
  assertIsSignature(sig);
  const deadline = Date.now() + CONFIRM_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const { value } = await rpc.getSignatureStatuses([sig]).send();
    const status = value[0];
    if (status) {
      if (status.err !== null) {
        throw new Error(`Solana tx ${sig} failed: ${JSON.stringify(status.err)}`);
      }
      if (status.confirmationStatus === "confirmed" || status.confirmationStatus === "finalized") {
        return;
      }
    }
    await sleep(CONFIRM_POLL_MS);
  }
  throw new Error(`Solana tx ${sig} not confirmed within ${CONFIRM_TIMEOUT_MS}ms`);
};

type Web3Signer = { publicKey: unknown; secretKey: Uint8Array };

type LegacyTx = {
  partialSign: (...signers: Array<Web3Signer>) => void;
  recentBlockhash?: string;
  serialize: (config?: {
    requireAllSignatures?: boolean;
    verifySignatures?: boolean;
  }) => Uint8Array;
};

type VersionedTx = {
  message: { recentBlockhash: string };
  serialize: () => Uint8Array;
  sign: (signers: Array<Web3Signer>) => void;
};

const legacyPartialSignSchema = z.custom<LegacyTx["partialSign"]>(
  (value) => typeof value === "function",
);
const legacySerializeSchema = z.custom<LegacyTx["serialize"]>(
  (value) => typeof value === "function",
);
const legacyTxContract = z.object({
  partialSign: legacyPartialSignSchema,
  recentBlockhash: z.string().optional(),
  serialize: legacySerializeSchema,
});
const legacyTxSchema = z.custom<LegacyTx>((value) => legacyTxContract.safeParse(value).success);

const versionedSerializeSchema = z.custom<VersionedTx["serialize"]>(
  (value) => typeof value === "function",
);
const versionedSignSchema = z.custom<VersionedTx["sign"]>((value) => typeof value === "function");
const versionedMessageSchema = z.object({ recentBlockhash: z.string() });
const versionedTxContract = z.object({
  message: versionedMessageSchema,
  serialize: versionedSerializeSchema,
  sign: versionedSignSchema,
});
const versionedTxSchema = z.custom<VersionedTx>(
  (value) => versionedTxContract.safeParse(value).success,
);

const web3SignerSchema = z.object({
  publicKey: z.unknown(),
  secretKey: z.instanceof(Uint8Array),
});
const solanaTransactionSchema = z.object({
  signers: z.array(web3SignerSchema).optional(),
  transaction: z.union([versionedTxSchema, legacyTxSchema]),
});
const solanaUnsignedTxSchema = z.object({
  description: z.string(),
  transaction: solanaTransactionSchema,
});

const isVersioned = (tx: LegacyTx | VersionedTx): tx is VersionedTx =>
  "message" in tx && typeof tx.message === "object";

/**
 * The SDK builds redeem transactions without a `recentBlockhash`, expecting
 * the signer to attach a fresh one at send time; without it
 * `Transaction.serialize()` throws "Transaction recentBlockhash required".
 */
class ButrSvmWormholeSigner<N extends Network, C extends Chain> implements SignAndSendSigner<N, C> {
  private readonly _chain: C;
  private readonly _address: string;
  private readonly _connector: WalletAdapter;
  private readonly _rpcUrl: string;

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
    for (const tx of txs) {
      const parsedTx = solanaUnsignedTxSchema.parse(tx);
      // oxlint-disable-next-line no-console
      console.log(`[wormhole/svm] sending: ${parsedTx.description}`);
      const { signers, transaction } = parsedTx.transaction;
      const { value } = await rpc.getLatestBlockhash().send();
      let serialized: Uint8Array;
      if (isVersioned(transaction)) {
        transaction.message.recentBlockhash = value.blockhash;
        if (signers !== undefined && signers.length > 0) {
          transaction.sign(signers);
        }
        serialized = transaction.serialize();
      } else {
        transaction.recentBlockhash = value.blockhash;
        if (signers !== undefined && signers.length > 0) {
          transaction.partialSign(...signers);
        }
        serialized = transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        });
      }
      const signature = await this._connector.sendTx(serialized);
      await confirmSignature(rpc, signature);
      hashes.push(signature);
    }
    return hashes;
  }
}

export { ButrSvmWormholeSigner };
