import type { ConnectedWallet } from "@usebutr/core";
import { type Chain, Wormhole } from "@wormhole-foundation/sdk-connect";
import { formatUnits } from "ethers";
import { useCallback, useState } from "react";

import { CHAIN_LIST, type ChainSpec, USDC_DECIMALS, findChainSpec } from "./chains";
import {
  type DiscoveredBurn,
  EVM_LOOKBACK_BLOCKS,
  SOLANA_SIGNATURE_LIMIT,
  deriveUsdcAta,
  mapPool,
  scanEvmBurns,
  scanSolanaBurns,
} from "./transfer-scan";
import { getWormhole } from "./wormhole";

type ResumableTransfer = {
  amount: string;
  destAddress: string;
  destChain: Chain;
  // The SDK can only create/complete it when the active wallet owns that ATA;
  destOwnedByActive: boolean;
  destSupported: boolean;
  key: string;
  sourceChain: Chain;
  sourceTxid: string;
};

type ScanState = "idle" | "scanning" | "done" | "error";

type ScanSummary = {
  evmLookbackBlocks: number;
  partialChains: Array<string>;
  scannedChains: number;
  solanaSignatureLimit: number;
};

// concurrency so a large burn history doesn't trip public-RPC rate limits.
const REDEMPTION_CHECK_CONCURRENCY = 6;

type ScanTask = {
  run: () => Promise<{ burns: Array<DiscoveredBurn>; partial: boolean }>;
  spec: ChainSpec;
};

/**
 * Discovers incomplete CCTP transfers for the connected wallets: scans each
 * supported chain for this wallet's burns, reconstructs them through the
 * Wormhole SDK, and keeps only those not yet minted on their destination.
 * Triggered manually (`rescan`); scanning every chain on render would
 * hammer testnet RPCs.
 */
const usePendingTransfers = (
  evmWallet: ConnectedWallet | undefined,
  svmWallet: ConnectedWallet | undefined,
) => {
  const [items, setItems] = useState<Array<ResumableTransfer>>([]);
  const [state, setState] = useState<ScanState>("idle");
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const rescan = useCallback(async () => {
    setState("scanning");
    setScanError(null);
    setItems([]);
    try {
      const wh = getWormhole();
      const evmAddr = evmWallet?.account.walletAddress;
      const svmAddr = svmWallet?.account.walletAddress;

      // Scan only chains whose platform wallet is connected (we need its
      const tasks: Array<ScanTask> = [];
      for (const spec of CHAIN_LIST) {
        const cctp = wh.getChain(spec.chain).config.contracts.cctp;
        if (!cctp) {
          continue;
        }
        if (spec.platform === "evm" && evmAddr) {
          tasks.push({
            run: () => scanEvmBurns(spec, cctp.tokenMessenger, evmAddr),
            spec,
          });
        } else if (spec.platform === "svm" && svmAddr) {
          tasks.push({
            run: () =>
              scanSolanaBurns(spec, [cctp.tokenMessenger, cctp.messageTransmitter], svmAddr),
            spec,
          });
        }
      }

      const settled = await Promise.allSettled(tasks.map((t) => t.run()));
      const discovered: Array<DiscoveredBurn> = [];
      const partialChains: Array<string> = [];
      settled.forEach((result, index) => {
        const { spec } = tasks[index] as ScanTask;
        if (result.status === "fulfilled") {
          discovered.push(...result.value.burns);
          if (result.value.partial) {
            partialChains.push(spec.label);
          }
        } else {
          partialChains.push(spec.label);
        }
      });

      // The active Solana wallet's USDC ATA (as a universal address) lets us
      // mark transfers whose baked-in recipient the active wallet doesn't own;
      const solanaUsdc = findChainSpec("Solana")?.usdc;
      const activeSvmAtaUniversal =
        svmAddr && solanaUsdc
          ? Wormhole.chainAddress("Solana", await deriveUsdcAta(svmAddr, solanaUsdc))
              .address.toUniversalAddress()
              .toString()
          : null;

      const checked = await mapPool(discovered, REDEMPTION_CHECK_CONCURRENCY, async (burn) => {
        try {
          const srcBridge = await wh.getChain(burn.sourceChain).getCircleBridge();
          const message = await srcBridge.parseTransactionDetails(burn.txid);
          const destChain = message.to.chain;
          const destCtx = wh.getChain(destChain);
          if (destCtx.supportsCircleBridge()) {
            const destBridge = await destCtx.getCircleBridge();
            if (await destBridge.isTransferCompleted(message.message)) {
              return null;
            }
          }
          const recipientUniversal = message.to.address.toUniversalAddress().toString();
          const item: ResumableTransfer = {
            amount: formatUnits(message.amount, USDC_DECIMALS),
            destAddress: message.to.address.toString(),
            destChain,
            // EVM mints have no ATA-owner constraint (any wallet can complete);
            // Solana requires the active wallet to own the recipient ATA.
            destOwnedByActive:
              destChain !== "Solana" ||
              (activeSvmAtaUniversal !== null && recipientUniversal === activeSvmAtaUniversal),
            destSupported: findChainSpec(destChain) !== undefined,
            key: `${burn.sourceChain}:${burn.txid}`,
            sourceChain: burn.sourceChain,
            sourceTxid: burn.txid,
          };
          return item;
        } catch {
          return null;
        }
      });

      setItems(checked.filter((x): x is ResumableTransfer => x !== null));
      setSummary({
        evmLookbackBlocks: EVM_LOOKBACK_BLOCKS,
        partialChains,
        scannedChains: tasks.length,
        solanaSignatureLimit: SOLANA_SIGNATURE_LIMIT,
      });
      setState("done");
    } catch (error) {
      setScanError(error instanceof Error ? error.message : "scan failed");
      setState("error");
    }
  }, [evmWallet, svmWallet]);

  const dismiss = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  return { dismiss, error: scanError, items, rescan, state, summary };
};

export type { ResumableTransfer };
export { usePendingTransfers };
