import { useSelectedWallet } from "@usebutr/react";
import { CircleTransfer } from "@wormhole-foundation/sdk-connect";
import { useState } from "react";

import { findChainSpec, getChainSpec } from "./chains";
import { type ResumableTransfer, usePendingTransfers } from "./use-pending-transfers";
import { getWormhole, makeSigner } from "./wormhole";

const ATTESTATION_TIMEOUT_MS = 10 * 60 * 1000;

const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  // SDK / wallet errors are often plain objects; surface their message
  // instead of a useless "unknown error".
  if (error !== null && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return "unrecognized error";
    }
  }
  return "unknown error";
};

const truncate = (a: string): string => (a.length > 14 ? `${a.slice(0, 8)}…${a.slice(-6)}` : a);

const chainLabel = (chain: string): string => findChainSpec(chain)?.label ?? chain;

type RowStatus =
  | { kind: "idle" }
  | { kind: "redeeming" }
  | { destTxHash: string; kind: "done" }
  | { kind: "error"; message: string };

// Why the "Complete mint" button can't be used yet, if anything.
const DestHint = ({
  destLabel,
  destPlatform,
  ownedByActive,
  recipient,
  supported,
  walletMissing,
}: {
  destLabel: string;
  destPlatform: string | undefined;
  ownedByActive: boolean;
  recipient: string;
  supported: boolean;
  walletMissing: boolean;
}) => {
  if (!supported) {
    return (
      <p className="text-xs text-amber-700">
        Destination {destLabel} isn’t one of this demo’s chains.
      </p>
    );
  }
  if (walletMissing) {
    return (
      <p className="text-xs text-amber-700">
        Connect a {destPlatform?.toUpperCase() ?? "destination"} wallet to complete.
      </p>
    );
  }
  if (!ownedByActive) {
    return (
      <p className="text-xs text-amber-700">
        Wrong wallet: this transfer was sent to {truncate(recipient)}, which the active{" "}
        {destPlatform?.toUpperCase() ?? ""} wallet doesn’t own. Switch to that account, then Scan
        again.
      </p>
    );
  }
  return null;
};

const PendingTransfers = () => {
  const evmWallet = useSelectedWallet("evm");
  const svmWallet = useSelectedWallet("svm");
  const {
    dismiss,
    error: scanError,
    items,
    rescan,
    state,
    summary,
  } = usePendingTransfers(evmWallet, svmWallet);
  const [rows, setRows] = useState<Record<string, RowStatus>>({});

  const noWallets = !evmWallet && !svmWallet;
  const setRow = (key: string, status: RowStatus) => {
    setRows((current) => ({ ...current, [key]: status }));
  };

  const handleComplete = async (item: ResumableTransfer) => {
    const destSpec = findChainSpec(item.destChain);
    const destWallet = destSpec?.platform === "evm" ? evmWallet : svmWallet;
    if (!destSpec || !destWallet) {
      return;
    }
    setRow(item.key, { kind: "redeeming" });
    try {
      const wh = getWormhole();
      const xfer = await CircleTransfer.from(wh, {
        chain: item.sourceChain,
        txid: item.sourceTxid,
      });
      await xfer.fetchAttestation(ATTESTATION_TIMEOUT_MS);
      const signer = await makeSigner(destSpec, destWallet);
      const txids = await xfer.completeTransfer(signer);
      setRow(item.key, { destTxHash: txids.at(-1) ?? "", kind: "done" });
    } catch (error) {
      setRow(item.key, { kind: "error", message: formatError(error) });
    }
  };

  return (
    <section className="mt-8 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
          Incomplete transfers
        </h2>
        <button
          className="rounded-md border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          disabled={state === "scanning" || noWallets}
          onClick={() => void rescan()}
          type="button"
        >
          {state === "scanning" ? "Scanning…" : "Scan"}
        </button>
      </div>

      <p className="text-xs text-neutral-500">
        Finds USDC you burned on a source chain but never minted on the destination, and lets you
        complete the mint.
      </p>

      {noWallets ? (
        <p className="text-xs text-amber-700">Connect a wallet above to scan for your burns.</p>
      ) : null}

      {state === "error" ? (
        <p
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {scanError}
        </p>
      ) : null}

      {state === "done" && items.length === 0 ? (
        <p className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          No incomplete transfers found.
        </p>
      ) : null}

      {items.map((item) => {
        const destSpec = findChainSpec(item.destChain);
        const destWallet = destSpec?.platform === "evm" ? evmWallet : svmWallet;
        const row = rows[item.key] ?? { kind: "idle" };
        const srcSpec = getChainSpec(item.sourceChain);
        const blocked = !destSpec || !destWallet || !item.destOwnedByActive;
        return (
          <div
            className="space-y-2 rounded-lg border border-neutral-200 bg-white p-4"
            key={item.key}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-neutral-900">
                {chainLabel(item.sourceChain)} → {chainLabel(item.destChain)}
              </p>
              <p className="font-mono text-sm text-neutral-900">{item.amount} USDC</p>
            </div>
            <p className="font-mono text-xs break-all text-neutral-500">
              to {truncate(item.destAddress)}
            </p>
            <a
              className="block font-mono text-xs break-all text-blue-600 hover:underline"
              href={srcSpec.explorerTx(item.sourceTxid)}
              rel="noreferrer noopener"
              target="_blank"
            >
              {srcSpec.label} burn: {truncate(item.sourceTxid)}
            </a>

            {row.kind === "done" ? (
              <div className="space-y-1">
                <p className="text-sm text-emerald-700">Minted on {chainLabel(item.destChain)}.</p>
                {destSpec && row.destTxHash ? (
                  <a
                    className="block font-mono text-xs break-all text-blue-600 hover:underline"
                    href={destSpec.explorerTx(row.destTxHash)}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    {destSpec.label} mint: {truncate(row.destTxHash)}
                  </a>
                ) : null}
                <button
                  className="rounded-md border border-neutral-300 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-50"
                  onClick={() => {
                    dismiss(item.key);
                  }}
                  type="button"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <button
                  className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                  disabled={blocked || row.kind === "redeeming"}
                  onClick={() => void handleComplete(item)}
                  type="button"
                >
                  {row.kind === "redeeming"
                    ? `Minting on ${chainLabel(item.destChain)}…`
                    : `Complete mint on ${chainLabel(item.destChain)}`}
                </button>
                <DestHint
                  destLabel={chainLabel(item.destChain)}
                  destPlatform={destSpec?.platform}
                  ownedByActive={item.destOwnedByActive}
                  recipient={item.destAddress}
                  supported={item.destSupported}
                  walletMissing={!destWallet}
                />
                {row.kind === "error" ? (
                  <p className="text-sm text-red-700" role="alert">
                    {row.message}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        );
      })}

      {summary ? (
        <p className="text-xs text-neutral-400">
          Scanned {summary.scannedChains} chain{summary.scannedChains === 1 ? "" : "s"} · last{" "}
          {summary.evmLookbackBlocks.toLocaleString()} blocks per EVM chain · last{" "}
          {summary.solanaSignatureLimit} Solana txs.
          {summary.partialChains.length > 0
            ? ` Partial results for ${summary.partialChains.join(", ")}.`
            : ""}
        </p>
      ) : null}
    </section>
  );
};

export { PendingTransfers };
