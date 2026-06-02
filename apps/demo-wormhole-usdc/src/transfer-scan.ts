import { type Address, type Signature, address as toAddress, createSolanaRpc } from "@solana/kit";
import type { Chain } from "@wormhole-foundation/sdk-connect";
import { Interface, JsonRpcProvider, zeroPadValue } from "ethers";

import type { ChainSpec } from "./chains";

// A burn tx located on-chain. Discovery only needs the source chain + tx
// hash; the Wormhole SDK's `parseTransactionDetails` decodes the route,
// amount, and message from there.
type DiscoveredBurn = { sourceChain: Chain; txid: string };

type EvmScanResult = {
  burns: Array<DiscoveredBurn>;
  fromBlock: number;
  partial: boolean;
  toBlock: number;
};
type SolanaScanResult = {
  burns: Array<DiscoveredBurn>;
  partial: boolean;
  scannedSignatures: number;
};

// CCTP V1 TokenMessenger burn event. `depositor` is indexed (topic 3), so
// the RPC filters to exactly this wallet's burns server-side.
const burnInterface = new Interface([
  "event DepositForBurn(uint64 indexed nonce, address indexed burnToken, uint256 amount, address indexed depositor, bytes32 mintRecipient, uint32 destinationDomain, bytes32 destinationTokenMessenger, bytes32 destinationCaller)",
]);
const DEPOSIT_FOR_BURN_TOPIC = burnInterface.getEvent("DepositForBurn")?.topicHash ?? "";

// Public testnet RPCs cap `eth_getLogs` block ranges, so walk the window in
// chunks. The wall-clock coverage of a fixed block count varies by chain
// block time — surfaced to the user via `EVM_LOOKBACK_BLOCKS`.
const EVM_LOOKBACK_BLOCKS = 100_000;
const EVM_CHUNK_BLOCKS = 9000;

// Solana has no "burns by address" primitive, so we page recent signatures
// and inspect each tx for a CCTP program. Bounded + disclosed in the UI.
const SOLANA_SIGNATURE_LIMIT = 300;
const SOLANA_PAGE_SIZE = 100;
const SOLANA_TX_CONCURRENCY = 6;

// Run `fn` over `items` with at most `limit` in flight — keeps the per-tx
// Solana lookups fast without hammering a public RPC into rate limits.
const mapPool = async <T, R>(
  items: ReadonlyArray<T>,
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<Array<R>> => {
  const results = Array.from<R>({ length: items.length });
  let cursor = 0;
  const worker = async (): Promise<void> => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      // oxlint-disable-next-line no-await-in-loop
      results[index] = await fn(items[index] as T);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
};

// Find this wallet's CCTP burns on an EVM source chain via a `depositor`-
// filtered `DepositForBurn` log query, chunked across the lookback window.
const scanEvmBurns = async (
  spec: ChainSpec,
  tokenMessenger: string,
  depositor: string,
): Promise<EvmScanResult> => {
  const provider = new JsonRpcProvider(spec.rpcUrl);
  const latest = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latest - EVM_LOOKBACK_BLOCKS);
  const depositorTopic = zeroPadValue(depositor.toLowerCase(), 32);
  const seen = new Set<string>();
  const burns: Array<DiscoveredBurn> = [];
  let partial = false;
  for (let start = fromBlock; start <= latest; start += EVM_CHUNK_BLOCKS) {
    const end = Math.min(start + EVM_CHUNK_BLOCKS - 1, latest);
    try {
      // oxlint-disable-next-line no-await-in-loop
      const logs = await provider.getLogs({
        address: tokenMessenger,
        fromBlock: start,
        toBlock: end,
        topics: [DEPOSIT_FOR_BURN_TOPIC, null, null, depositorTopic],
      });
      for (const log of logs) {
        if (!seen.has(log.transactionHash)) {
          seen.add(log.transactionHash);
          burns.push({ sourceChain: spec.chain, txid: log.transactionHash });
        }
      }
    } catch {
      // A single bad chunk (rate limit / range cap) shouldn't drop the rest.
      partial = true;
    }
  }
  return { burns, fromBlock, partial, toBlock: latest };
};

type ParsedTx = { transaction?: { message?: { accountKeys?: Array<{ pubkey: string }> } } };

// Find this wallet's CCTP burns on a Solana source chain by scanning recent
// signatures and keeping those whose tx invokes a CCTP program.
const scanSolanaBurns = async (
  spec: ChainSpec,
  programIds: ReadonlyArray<string>,
  owner: string,
): Promise<SolanaScanResult> => {
  const rpc = createSolanaRpc(spec.rpcUrl);
  const ownerAddress = toAddress(owner) as Address;
  const programSet = new Set(programIds);

  // Page back through signatures (newest-first) up to the cap, so an active
  // wallet's older burns aren't missed by a single window. `reachedEnd`
  // distinguishes "scanned all history" from "stopped at the cap".
  const candidates: Array<Signature> = [];
  let before: Signature | undefined;
  let totalFetched = 0;
  let reachedEnd = false;
  while (totalFetched < SOLANA_SIGNATURE_LIMIT) {
    // oxlint-disable-next-line no-await-in-loop
    const page = await rpc
      .getSignaturesForAddress(ownerAddress, { before, limit: SOLANA_PAGE_SIZE })
      .send();
    if (page.length === 0) {
      reachedEnd = true;
      break;
    }
    totalFetched += page.length;
    for (const entry of page) {
      if (!entry.err) {
        candidates.push(entry.signature);
      }
    }
    const last = page.at(-1);
    before = last ? last.signature : before;
    if (page.length < SOLANA_PAGE_SIZE) {
      reachedEnd = true;
      break;
    }
  }
  const scanned = candidates.slice(0, SOLANA_SIGNATURE_LIMIT);

  const isBurn = await mapPool(scanned, SOLANA_TX_CONCURRENCY, async (signature) => {
    try {
      const tx = await rpc
        .getTransaction(signature, {
          commitment: "confirmed",
          encoding: "jsonParsed",
          maxSupportedTransactionVersion: 0,
        })
        .send();
      const keys = (tx as unknown as ParsedTx)?.transaction?.message?.accountKeys;
      return Boolean(keys?.some((k) => programSet.has(k.pubkey)));
    } catch {
      return false;
    }
  });
  const burns: Array<DiscoveredBurn> = [];
  scanned.forEach((signature, index) => {
    if (isBurn[index]) {
      burns.push({ sourceChain: spec.chain, txid: signature });
    }
  });
  // `partial` when we stopped at the cap with more history behind us — the
  // user's burn could be older than what we scanned.
  return { burns, partial: !reachedEnd, scannedSignatures: scanned.length };
};

export type { DiscoveredBurn };
export { EVM_LOOKBACK_BLOCKS, SOLANA_SIGNATURE_LIMIT, mapPool, scanEvmBurns, scanSolanaBurns };
