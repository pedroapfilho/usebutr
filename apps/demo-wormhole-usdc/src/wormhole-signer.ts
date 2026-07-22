import type {
  Chain,
  Network,
  SignAndSendSigner,
  TxHash,
  UnsignedTransaction,
} from "@wormhole-foundation/sdk-connect";
import { BrowserProvider, type Eip1193Provider } from "ethers";

type EvmUnsignedTx<N extends Network, C extends Chain> = UnsignedTransaction<N, C> & {
  description: string;
  transaction: {
    data?: string;
    to?: string;
    value?: bigint | number | string;
  };
};

/**
 * Wraps butr's EIP-1193 provider so the Wormhole SDK can sign and
 * broadcast lock transactions on the EVM source chain.
 */
class ButrEvmWormholeSigner<N extends Network, C extends Chain> implements SignAndSendSigner<N, C> {
  private readonly _chain: C;
  private readonly _address: string;
  private readonly _eip1193: Eip1193Provider;

  constructor(chain: C, address: string, eip1193: Eip1193Provider) {
    this._chain = chain;
    this._address = address;
    this._eip1193 = eip1193;
  }

  chain(): C {
    return this._chain;
  }

  address(): string {
    return this._address;
  }

  async signAndSend(txs: Array<UnsignedTransaction<N, C>>): Promise<Array<TxHash>> {
    const provider = new BrowserProvider(this._eip1193);
    const signer = await provider.getSigner(this._address);
    const hashes: Array<TxHash> = [];
    // oxlint-disable-next-line no-await-in-loop
    for (const tx of txs as Array<EvmUnsignedTx<N, C>>) {
      // oxlint-disable-next-line no-await-in-loop, no-console
      console.log(`[wormhole/evm] sending: ${tx.description}`);
      // oxlint-disable-next-line no-await-in-loop, typescript/no-unsafe-argument -- Wormhole SDK types tx.transaction loosely; ethers narrows it to TransactionRequest at send
      const response = await signer.sendTransaction(tx.transaction);
      // oxlint-disable-next-line no-await-in-loop
      await response.wait(1);
      hashes.push(response.hash);
    }
    return hashes;
  }
}

export { ButrEvmWormholeSigner };
