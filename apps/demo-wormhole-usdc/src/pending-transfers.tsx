import { useSelectedWallet } from "@usebutr/react";
import { CircleTransfer } from "@wormhole-foundation/sdk-connect";
import { useState } from "react";

import { findChainSpec, getChainSpec } from "./chains";
import { type ResumableTransfer, usePendingTransfers } from "./use-pending-transfers";
import { getWormhole, makeSigner } from "./wormhole";

const ATTESTATION_TIMEOUT_MS = 10 * 60 * 1000;

const formatError = (error: Error | string): string => {
  return error instanceof Error ? error.message : error;
};

const truncate = (a: string): string => (a.length > 14 ? `${a.slice(0, 8)}…${a.slice(-6)}` : a);

const chainLabel = (chain: string): string => findChainSpec(chain)?.label ?? chain;

type RowStatus =
  | { kind: "idle" }
  | { kind: "redeeming" }
  | { destTxHash: string; kind: "done" }
  | { kind: "error"; message: string };

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
      <p className="text-warning-foreground text-xs">
        Destination {destLabel} isn’t one of this demo’s chains.
      </p>
    );
  }
  if (walletMissing) {
    return (
      <p className="text-warning-foreground text-xs">
        Connect a {destPlatform?.toUpperCase() ?? "destination"} wallet to complete.
      </p>
    );
  }
  if (!ownedByActive) {
    return (
      <p className="text-warning-foreground text-xs">
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
      setRow(item.key, {
        kind: "error",
        message: formatError(error instanceof Error ? error : String(error)),
      });
    }
  };

  return (
    <section className="mt-8 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground-muted text-xs font-medium tracking-wide uppercase">
          Incomplete transfers
        </h2>
        <button
          className="border-border-strong text-foreground-secondary hover:bg-surface-subtle rounded-md border bg-white px-3 py-1 text-xs font-medium disabled:opacity-50"
          disabled={state === "scanning" || noWallets}
          onClick={() => {
            void rescan();
          }}
          type="button"
        >
          {state === "scanning" ? "Scanning…" : "Scan"}
        </button>
      </div>

      <p className="text-foreground-muted text-xs">
        Finds USDC you burned on a source chain but never minted on the destination, and lets you
        complete the mint.
      </p>

      {noWallets ? (
        <p className="text-warning-foreground text-xs">
          Connect a wallet above to scan for your burns.
        </p>
      ) : null}

      {state === "error" ? (
        <p
          className="border-danger-border bg-danger-surface text-danger-foreground rounded-md border p-3 text-sm"
          role="alert"
        >
          {scanError}
        </p>
      ) : null}

      {state === "done" && items.length === 0 ? (
        <p className="border-border-default text-foreground-subtle rounded-lg border bg-white p-4 text-sm">
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
            className="border-border-default space-y-2 rounded-lg border bg-white p-4"
            key={item.key}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-foreground-primary text-sm font-medium">
                {chainLabel(item.sourceChain)} → {chainLabel(item.destChain)}
              </p>
              <p className="text-foreground-primary font-mono text-sm">{item.amount} USDC</p>
            </div>
            <p className="text-foreground-muted font-mono text-xs break-all">
              to {truncate(item.destAddress)}
            </p>
            <a
              className="text-info-accent block font-mono text-xs break-all hover:underline"
              href={srcSpec.explorerTx(item.sourceTxid)}
              rel="noreferrer noopener"
              target="_blank"
            >
              {srcSpec.label} burn: {truncate(item.sourceTxid)}
            </a>

            {row.kind === "done" ? (
              <div className="space-y-1">
                <p className="text-success-foreground text-sm">
                  Minted on {chainLabel(item.destChain)}.
                </p>
                {destSpec && row.destTxHash ? (
                  <a
                    className="text-info-accent block font-mono text-xs break-all hover:underline"
                    href={destSpec.explorerTx(row.destTxHash)}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    {destSpec.label} mint: {truncate(row.destTxHash)}
                  </a>
                ) : null}
                <button
                  className="border-border-strong text-foreground-subtle hover:bg-surface-subtle rounded-md border px-3 py-1 text-xs"
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
                  className="border-success-border-strong bg-success-surface text-success-foreground-strong hover:bg-success-surface-hover rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-50"
                  disabled={blocked || row.kind === "redeeming"}
                  onClick={() => {
                    void handleComplete(item);
                  }}
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
                  <p className="text-danger-foreground text-sm" role="alert">
                    {row.message}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        );
      })}

      {summary ? (
        <p className="text-foreground-disabled text-xs">
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
