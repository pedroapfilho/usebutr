import { useSelectedWallet } from "@usebutr/react";
import { type Chain, type Network, Wormhole, amount } from "@wormhole-foundation/sdk-connect";
import { type ReactNode, useState } from "react";

import { type ChainSpec, CHAIN_LIST, USDC_DECIMALS, getChainSpec } from "./chains";
import { PendingTransfers } from "./pending-transfers";
import { type UsdcBalance, useUsdcBalance } from "./token-balance";
import { WalletList } from "./wallet-list";
import { type BridgeWallet, getWormhole, makeSigner } from "./wormhole";

const ATTESTATION_TIMEOUT_MS = 10 * 60 * 1000;

type CircleTransfer = Awaited<ReturnType<Wormhole<Network>["circleTransfer"]>>;

/**
 * Each post-burn phase carries its own `xfer`, so "no transfer in flight" can never
 * coexist with a live CCTP handle: dropping the handle strands burned USDC behind the
 * PendingTransfers scan, which is bounded and may miss it.
 */
type Phase =
  | { kind: "idle" }
  | { kind: "initiating" }
  | { kind: "waiting-attestation"; sourceTxHash: string; xfer: CircleTransfer }
  | { kind: "ready-to-redeem"; sourceTxHash: string; xfer: CircleTransfer }
  | { kind: "redeeming"; sourceTxHash: string; xfer: CircleTransfer }
  | { destTxHash: string; kind: "complete"; sourceTxHash: string };

type Transfer = { error: string | null; phase: Phase };

const formatError = (e: Error | string): string => {
  return e instanceof Error ? e.message : e;
};

const formatBalance = (b: UsdcBalance): string => {
  if (b.status === "loading" || b.status === "idle") {
    return "…";
  }
  if (b.status === "error") {
    return "—";
  }
  return `${b.uiAmountString ?? "0"} USDC`;
};

const ChainSelect = ({
  disabled,
  label,
  onChange,
  value,
}: {
  disabled: boolean;
  label: string;
  onChange: (chain: Chain) => void;
  value: Chain;
}) => (
  <select
    aria-label={label}
    className="border-border-strong text-foreground-secondary focus-visible:border-info-indicator focus-visible:ring-info-indicator/30 rounded-md border bg-white px-2 py-1 text-base focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
    disabled={disabled}
    onChange={(event) => {
      const chain = CHAIN_LIST.find((spec) => spec.chain === event.target.value)?.chain;
      if (chain !== undefined) {
        onChange(chain);
      }
    }}
    value={value}
  >
    {CHAIN_LIST.map((s) => (
      <option key={s.chain} value={s.chain}>
        {s.label}
      </option>
    ))}
  </select>
);

const TokenIO = ({
  amountValue,
  balance,
  direction,
  networkSlot,
  onAmountChange,
}: {
  amountValue?: string;
  balance: string;
  direction: "in" | "out";
  networkSlot: ReactNode;
  onAmountChange?: (next: string) => void;
}) => (
  <div className="border-border-default rounded-lg border bg-white p-4">
    <div className="flex items-center justify-between text-xs">
      <span className="text-foreground-muted font-medium tracking-wide uppercase">
        {direction === "out" ? "You send" : "You receive"}
      </span>
      {networkSlot}
    </div>
    <div className="mt-2 flex items-baseline justify-between gap-3">
      {onAmountChange ? (
        <input
          aria-label="USDC amount to send"
          className="text-foreground-primary placeholder-placeholder focus-visible:ring-info-indicator/30 w-full rounded-sm bg-transparent text-2xl font-semibold focus-visible:ring-2 focus-visible:outline-none"
          inputMode="decimal"
          onChange={(e) => {
            onAmountChange(e.target.value);
          }}
          placeholder="0"
          value={amountValue ?? ""}
        />
      ) : (
        <span className="text-foreground-primary text-2xl font-semibold">
          {amountValue === undefined || amountValue === "" ? "0" : amountValue}
        </span>
      )}
      <span className="text-foreground-muted text-base font-medium">USDC</span>
    </div>
    <p className="text-foreground-muted mt-1 text-right font-mono text-xs">Balance: {balance}</p>
  </div>
);

const TxLink = ({ hash, spec }: { hash: string; spec: ChainSpec }) => {
  if (!hash) {
    return null;
  }
  return (
    <p>
      <a
        className="text-info-accent font-mono text-xs break-all hover:underline"
        href={spec.explorerTx(hash)}
        rel="noreferrer noopener"
        target="_blank"
      >
        {spec.label} tx: {hash}
      </a>
    </p>
  );
};

const PhaseBody = ({
  dstSpec,
  phase,
  srcSpec,
}: {
  dstSpec: ChainSpec;
  phase: Phase;
  srcSpec: ChainSpec;
}) => {
  if (phase.kind === "idle") {
    return null;
  }
  if (phase.kind === "initiating") {
    return (
      <p className="text-foreground-subtle text-sm">
        Burning USDC on {srcSpec.label} via CCTP. Approve in your wallet…
      </p>
    );
  }
  if (phase.kind === "waiting-attestation") {
    return (
      <div className="space-y-1 text-sm">
        <p className="text-foreground-subtle">Waiting for Circle to attest the burn…</p>
        <TxLink hash={phase.sourceTxHash} spec={srcSpec} />
        <p className="text-foreground-muted text-xs">
          Typically a few minutes, depending on source-chain finality.
        </p>
      </div>
    );
  }
  if (phase.kind === "ready-to-redeem") {
    return (
      <div className="space-y-1 text-sm">
        <p className="text-success-foreground">
          Attestation ready. Approve the mint on {dstSpec.label}.
        </p>
        <TxLink hash={phase.sourceTxHash} spec={srcSpec} />
      </div>
    );
  }
  if (phase.kind === "redeeming") {
    return (
      <div className="space-y-1 text-sm">
        <p className="text-foreground-subtle">Minting native USDC on {dstSpec.label}…</p>
        <TxLink hash={phase.sourceTxHash} spec={srcSpec} />
      </div>
    );
  }
  return (
    <div className="space-y-1 text-sm">
      <p className="text-success-foreground">Transfer complete.</p>
      <TxLink hash={phase.sourceTxHash} spec={srcSpec} />
      <TxLink hash={phase.destTxHash} spec={dstSpec} />
    </div>
  );
};

const StatusPanel = ({
  dstSpec,
  error,
  phase,
  srcSpec,
}: {
  dstSpec: ChainSpec;
  error: string | null;
  phase: Phase;
  srcSpec: ChainSpec;
}) => {
  if (phase.kind === "idle" && error === null) {
    return null;
  }
  return (
    <div
      aria-live="polite"
      className="border-border-default space-y-2 rounded-lg border bg-white p-4"
    >
      <PhaseBody dstSpec={dstSpec} phase={phase} srcSpec={srcSpec} />
      {error === null ? null : (
        <p className="text-danger-foreground text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

const TransferButtons = ({
  canSwap,
  destinationLabel,
  missingWallet,
  onRedeem,
  onReset,
  onRetryAttestation,
  onSwap,
  transfer,
}: {
  canSwap: boolean;
  destinationLabel: string;
  missingWallet: ChainSpec["platform"] | null;
  onRedeem: () => Promise<void>;
  onReset: () => void;
  onRetryAttestation: () => Promise<void>;
  onSwap: () => Promise<void>;
  transfer: Transfer;
}) => {
  const { phase } = transfer;
  const isWorking =
    phase.kind === "initiating" ||
    phase.kind === "waiting-attestation" ||
    phase.kind === "redeeming";
  const canRetryAttestation = phase.kind === "waiting-attestation" && transfer.error !== null;

  return (
    <>
      <button
        className="bg-surface-inverse hover:bg-surface-raised-inverse w-full rounded-md px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        disabled={!canSwap}
        onClick={() => {
          void onSwap();
        }}
        type="button"
      >
        {isWorking && !canRetryAttestation ? "Working…" : "Swap"}
      </button>

      {missingWallet ? (
        <p className="text-warning-foreground text-center text-xs">
          Connect and activate a {missingWallet.toUpperCase()} wallet above to bridge between these
          chains.
        </p>
      ) : null}

      {canRetryAttestation ? (
        <button
          className="border-warning-border-strong bg-warning-surface text-warning-foreground-deep hover:bg-warning-surface-hover w-full rounded-md border px-4 py-2 text-sm font-medium"
          onClick={() => {
            void onRetryAttestation();
          }}
          type="button"
        >
          Retry attestation
        </button>
      ) : null}

      {phase.kind === "ready-to-redeem" || phase.kind === "redeeming" ? (
        <button
          className="border-success-border-strong bg-success-surface text-success-foreground-strong hover:bg-success-surface-hover w-full rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
          disabled={phase.kind === "redeeming"}
          onClick={() => {
            void onRedeem();
          }}
          type="button"
        >
          {phase.kind === "redeeming"
            ? `Minting on ${destinationLabel}…`
            : `Mint on ${destinationLabel}`}
        </button>
      ) : null}

      {phase.kind === "complete" ? (
        <button
          className="border-border-strong text-foreground-subtle hover:bg-surface-subtle w-full rounded-md border px-4 py-2 text-sm"
          onClick={onReset}
          type="button"
        >
          Reset
        </button>
      ) : null}
    </>
  );
};

const App = () => {
  const evmWallet = useSelectedWallet("evm");
  const svmWallet = useSelectedWallet("svm");

  const [sourceChain, setSourceChain] = useState<Chain>("Sepolia");
  const [destChain, setDestChain] = useState<Chain>("Solana");
  const [amountInput, setAmountInput] = useState("1");
  const [transfer, setTransfer] = useState<Transfer>({ error: null, phase: { kind: "idle" } });
  const { phase } = transfer;

  const srcSpec = getChainSpec(sourceChain);
  const dstSpec = getChainSpec(destChain);
  const walletFor = (spec: ChainSpec): BridgeWallet | undefined =>
    spec.platform === "evm" ? evmWallet : svmWallet;
  const srcWallet = walletFor(srcSpec);
  const dstWallet = walletFor(dstSpec);

  const srcBalance = useUsdcBalance(srcSpec, srcWallet?.account.walletAddress);
  const dstBalance = useUsdcBalance(dstSpec, dstWallet?.account.walletAddress);

  const isTransferOpen = phase.kind !== "idle" && phase.kind !== "complete";

  const resetTransfer = () => {
    setTransfer({ error: null, phase: { kind: "idle" } });
  };

  const selectSource = (next: Chain) => {
    if (isTransferOpen) {
      return;
    }
    resetTransfer();
    if (next === destChain) {
      setDestChain(sourceChain);
    }
    setSourceChain(next);
  };

  const selectDest = (next: Chain) => {
    if (isTransferOpen) {
      return;
    }
    resetTransfer();
    if (next === sourceChain) {
      setSourceChain(destChain);
    }
    setDestChain(next);
  };

  const flip = () => {
    if (isTransferOpen) {
      return;
    }
    resetTransfer();
    setSourceChain(destChain);
    setDestChain(sourceChain);
  };

  const handleSwap = async () => {
    if (!srcWallet || !dstWallet) {
      return;
    }
    setTransfer({ error: null, phase: { kind: "initiating" } });
    let burned: { sourceTxHash: string; xfer: CircleTransfer } | null = null;
    try {
      const wh = getWormhole();
      const sourceAddress = Wormhole.chainAddress(srcSpec.chain, srcWallet.account.walletAddress);
      const destAddress = Wormhole.chainAddress(dstSpec.chain, dstWallet.account.walletAddress);
      const units = amount.units(amount.parse(amountInput, USDC_DECIMALS));

      const xfer = await wh.circleTransfer(units, sourceAddress, destAddress, false);
      const sourceSigner = await makeSigner(srcSpec, srcWallet);
      const srcTxids = await xfer.initiateTransfer(sourceSigner);
      const sourceTxHash = srcTxids.at(-1) ?? "";
      burned = { sourceTxHash, xfer };
      setTransfer({ error: null, phase: { kind: "waiting-attestation", sourceTxHash, xfer } });
      srcBalance.refetch();

      await xfer.fetchAttestation(ATTESTATION_TIMEOUT_MS);
      setTransfer({ error: null, phase: { kind: "ready-to-redeem", sourceTxHash, xfer } });
    } catch (error) {
      const message = formatError(error instanceof Error ? error : String(error));
      setTransfer(
        burned === null
          ? { error: message, phase: { kind: "idle" } }
          : { error: message, phase: { kind: "waiting-attestation", ...burned } },
      );
    }
  };

  const handleRetryAttestation = async () => {
    if (phase.kind !== "waiting-attestation") {
      return;
    }
    const { sourceTxHash, xfer } = phase;
    setTransfer({ error: null, phase: { kind: "waiting-attestation", sourceTxHash, xfer } });
    try {
      await xfer.fetchAttestation(ATTESTATION_TIMEOUT_MS);
      setTransfer({ error: null, phase: { kind: "ready-to-redeem", sourceTxHash, xfer } });
    } catch (error) {
      setTransfer({
        error: formatError(error instanceof Error ? error : String(error)),
        phase: { kind: "waiting-attestation", sourceTxHash, xfer },
      });
    }
  };

  const handleRedeem = async () => {
    if (!dstWallet || phase.kind !== "ready-to-redeem") {
      return;
    }
    const { sourceTxHash, xfer } = phase;
    setTransfer({ error: null, phase: { kind: "redeeming", sourceTxHash, xfer } });
    try {
      const destSigner = await makeSigner(dstSpec, dstWallet);
      const destTxids = await xfer.completeTransfer(destSigner);
      const destTxHash = destTxids.at(-1) ?? "";
      setTransfer({ error: null, phase: { destTxHash, kind: "complete", sourceTxHash } });
      dstBalance.refetch();
    } catch (error) {
      setTransfer({
        error: formatError(error instanceof Error ? error : String(error)),
        phase: { kind: "ready-to-redeem", sourceTxHash, xfer },
      });
    }
  };

  let missingWallet: ChainSpec["platform"] | null = null;
  if (!srcWallet) {
    missingWallet = srcSpec.platform;
  } else if (!dstWallet) {
    missingWallet = dstSpec.platform;
  }

  return (
    <main className="text-foreground-primary mx-auto max-w-2xl px-6 py-10 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">butr · Wormhole USDC</h1>
        <p className="text-foreground-muted mt-1 text-sm">
          Native USDC via Circle CCTP. Pick any two testnets, swap direction, manage multiple
          wallets.
        </p>
      </header>

      <WalletList />

      <section className="mt-6 space-y-2">
        <TokenIO
          amountValue={amountInput}
          balance={formatBalance(srcBalance)}
          direction="out"
          networkSlot={
            <ChainSelect
              disabled={isTransferOpen}
              label="Source chain"
              onChange={selectSource}
              value={sourceChain}
            />
          }
          onAmountChange={isTransferOpen ? undefined : setAmountInput}
        />
        <div className="flex justify-center">
          <button
            aria-label="Swap source and destination"
            className="border-border-default text-foreground-muted hover:bg-surface-subtle rounded-full border bg-white px-2 py-1 text-xs disabled:opacity-50"
            disabled={isTransferOpen}
            onClick={flip}
            type="button"
          >
            ⇅
          </button>
        </div>
        <TokenIO
          amountValue={amountInput}
          balance={formatBalance(dstBalance)}
          direction="in"
          networkSlot={
            <ChainSelect
              disabled={isTransferOpen}
              label="Destination chain"
              onChange={selectDest}
              value={destChain}
            />
          }
        />
      </section>

      <section className="mt-6 space-y-3">
        <TransferButtons
          canSwap={Boolean(
            srcWallet &&
            dstWallet &&
            !isTransferOpen &&
            phase.kind !== "complete" &&
            amountInput !== "",
          )}
          destinationLabel={dstSpec.label}
          missingWallet={missingWallet}
          onRedeem={handleRedeem}
          onReset={resetTransfer}
          onRetryAttestation={handleRetryAttestation}
          onSwap={handleSwap}
          transfer={transfer}
        />

        <StatusPanel dstSpec={dstSpec} error={transfer.error} phase={phase} srcSpec={srcSpec} />

        <p className="text-foreground-muted text-center text-xs">
          Need testnet USDC?{" "}
          <a
            className="text-info-accent hover:underline"
            href="https://faucet.circle.com/"
            rel="noreferrer noopener"
            target="_blank"
          >
            faucet.circle.com
          </a>
        </p>
      </section>

      <PendingTransfers />
    </main>
  );
};

export { App };
