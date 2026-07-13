import type { ConnectedWallet } from "@usebutr/core";
import { useSelectedWallet } from "@usebutr/react";
import { type Chain, type Network, Wormhole, amount } from "@wormhole-foundation/sdk-connect";
import { type ReactNode, useRef, useState } from "react";

import { type ChainSpec, CHAIN_LIST, USDC_DECIMALS, getChainSpec } from "./chains";
import { PendingTransfers } from "./pending-transfers";
import { type UsdcBalance, useUsdcBalance } from "./token-balance";
import { WalletList } from "./wallet-list";
import { getWormhole, makeSigner } from "./wormhole";

const ATTESTATION_TIMEOUT_MS = 10 * 60 * 1000;

type Status =
  | { kind: "idle" }
  | { kind: "initiating" }
  | { kind: "waiting-attestation"; sourceTxHash: string }
  | { kind: "ready-to-redeem"; sourceTxHash: string }
  | { kind: "redeeming"; sourceTxHash: string }
  | { destTxHash: string; kind: "complete"; sourceTxHash: string }
  | { kind: "error"; message: string };

const formatError = (e: unknown): string => {
  if (e instanceof Error) {
    return e.message;
  }
  if (typeof e === "string") {
    return e;
  }
  return "unknown error";
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
    className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none disabled:opacity-50"
    disabled={disabled}
    onChange={(e) => onChange(e.target.value as Chain)}
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
  <div className="rounded-lg border border-neutral-200 bg-white p-4">
    <div className="flex items-center justify-between text-xs">
      <span className="font-medium tracking-wide text-neutral-500 uppercase">
        {direction === "out" ? "You send" : "You receive"}
      </span>
      {networkSlot}
    </div>
    <div className="mt-2 flex items-baseline justify-between gap-3">
      {onAmountChange ? (
        <input
          aria-label="USDC amount to send"
          className="w-full rounded-sm bg-transparent text-2xl font-semibold text-neutral-900 placeholder-neutral-300 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none"
          inputMode="decimal"
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0"
          value={amountValue ?? ""}
        />
      ) : (
        <span className="text-2xl font-semibold text-neutral-900">{amountValue || "0"}</span>
      )}
      <span className="text-base font-medium text-neutral-500">USDC</span>
    </div>
    <p className="mt-1 text-right font-mono text-xs text-neutral-500">Balance: {balance}</p>
  </div>
);

const TxLink = ({ hash, spec }: { hash: string; spec: ChainSpec }) => {
  if (!hash) {
    return null;
  }
  return (
    <p>
      <a
        className="font-mono text-xs break-all text-blue-600 hover:underline"
        href={spec.explorerTx(hash)}
        rel="noreferrer noopener"
        target="_blank"
      >
        {spec.label} tx: {hash}
      </a>
    </p>
  );
};

const StatusPanel = ({
  dstSpec,
  srcSpec,
  status,
}: {
  dstSpec: ChainSpec;
  srcSpec: ChainSpec;
  status: Status;
}) => {
  if (status.kind === "idle") {
    return null;
  }
  let body;
  if (status.kind === "initiating") {
    body = (
      <p className="text-sm text-neutral-600">
        Burning USDC on {srcSpec.label} via CCTP. Approve in your wallet…
      </p>
    );
  } else if (status.kind === "waiting-attestation") {
    body = (
      <div className="space-y-1 text-sm">
        <p className="text-neutral-600">Waiting for Circle to attest the burn…</p>
        <TxLink hash={status.sourceTxHash} spec={srcSpec} />
        <p className="text-xs text-neutral-500">
          Typically a few minutes, depending on source-chain finality.
        </p>
      </div>
    );
  } else if (status.kind === "ready-to-redeem") {
    body = (
      <div className="space-y-1 text-sm">
        <p className="text-emerald-700">Attestation ready. Approve the mint on {dstSpec.label}.</p>
        <TxLink hash={status.sourceTxHash} spec={srcSpec} />
      </div>
    );
  } else if (status.kind === "redeeming") {
    body = (
      <div className="space-y-1 text-sm">
        <p className="text-neutral-600">Minting native USDC on {dstSpec.label}…</p>
        <TxLink hash={status.sourceTxHash} spec={srcSpec} />
      </div>
    );
  } else if (status.kind === "complete") {
    body = (
      <div className="space-y-1 text-sm">
        <p className="text-emerald-700">Transfer complete.</p>
        <TxLink hash={status.sourceTxHash} spec={srcSpec} />
        <TxLink hash={status.destTxHash} spec={dstSpec} />
      </div>
    );
  } else {
    body = (
      <p className="text-sm text-red-700" role="alert">
        {status.message}
      </p>
    );
  }
  return (
    <div aria-live="polite" className="rounded-lg border border-neutral-200 bg-white p-4">
      {body}
    </div>
  );
};

const App = () => {
  const evmWallet = useSelectedWallet("evm");
  const svmWallet = useSelectedWallet("svm");

  const [sourceChain, setSourceChain] = useState<Chain>("Sepolia");
  const [destChain, setDestChain] = useState<Chain>("Solana");
  const [amountInput, setAmountInput] = useState("1");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const xferRef = useRef<Awaited<ReturnType<Wormhole<Network>["circleTransfer"]>> | null>(null);

  const srcSpec = getChainSpec(sourceChain);
  const dstSpec = getChainSpec(destChain);
  const walletFor = (spec: ChainSpec): ConnectedWallet | undefined =>
    spec.platform === "evm" ? evmWallet : svmWallet;
  const srcWallet = walletFor(srcSpec);
  const dstWallet = walletFor(dstSpec);

  const srcBalance = useUsdcBalance(srcSpec, srcWallet?.account.walletAddress);
  const dstBalance = useUsdcBalance(dstSpec, dstWallet?.account.walletAddress);

  const isWorking =
    status.kind === "initiating" ||
    status.kind === "waiting-attestation" ||
    status.kind === "redeeming";

  const resetTransfer = () => {
    setStatus({ kind: "idle" });
    xferRef.current = null;
  };

  const selectSource = (next: Chain) => {
    if (isWorking) {
      return;
    }
    resetTransfer();
    if (next === destChain) {
      setDestChain(sourceChain);
    }
    setSourceChain(next);
  };

  const selectDest = (next: Chain) => {
    if (isWorking) {
      return;
    }
    resetTransfer();
    if (next === sourceChain) {
      setSourceChain(destChain);
    }
    setDestChain(next);
  };

  const flip = () => {
    if (isWorking) {
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
    setStatus({ kind: "initiating" });
    xferRef.current = null;
    try {
      const wh = getWormhole();
      const sourceAddress = Wormhole.chainAddress(srcSpec.chain, srcWallet.account.walletAddress);
      const destAddress = Wormhole.chainAddress(dstSpec.chain, dstWallet.account.walletAddress);
      const units = amount.units(amount.parse(amountInput, USDC_DECIMALS));

      // here and the mint in a separate step (matching the two-wallet UX).
      const transfer = await wh.circleTransfer(units, sourceAddress, destAddress, false);
      xferRef.current = transfer;

      const sourceSigner = await makeSigner(srcSpec, srcWallet);
      const srcTxids = await transfer.initiateTransfer(sourceSigner);
      const sourceTxHash = srcTxids.at(-1) ?? "";
      setStatus({ kind: "waiting-attestation", sourceTxHash });
      srcBalance.refetch();

      await transfer.fetchAttestation(ATTESTATION_TIMEOUT_MS);
      setStatus({ kind: "ready-to-redeem", sourceTxHash });
    } catch (error) {
      setStatus({ kind: "error", message: formatError(error) });
    }
  };

  const handleRedeem = async () => {
    const xfer = xferRef.current;
    if (!dstWallet || !xfer || status.kind !== "ready-to-redeem") {
      return;
    }
    const sourceTxHash = status.sourceTxHash;
    setStatus({ kind: "redeeming", sourceTxHash });
    try {
      const destSigner = await makeSigner(dstSpec, dstWallet);
      const destTxids = await xfer.completeTransfer(destSigner);
      const destTxHash = destTxids.at(-1) ?? "";
      setStatus({ destTxHash, kind: "complete", sourceTxHash });
      dstBalance.refetch();
    } catch (error) {
      setStatus({ kind: "error", message: formatError(error) });
    }
  };

  let missingWallet: ChainSpec["platform"] | null = null;
  if (!srcWallet) {
    missingWallet = srcSpec.platform;
  } else if (!dstWallet) {
    missingWallet = dstSpec.platform;
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 font-sans text-neutral-900">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">butr · Wormhole USDC</h1>
        <p className="mt-1 text-sm text-neutral-500">
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
              disabled={isWorking}
              label="Source chain"
              onChange={selectSource}
              value={sourceChain}
            />
          }
          onAmountChange={isWorking ? undefined : setAmountInput}
        />
        <div className="flex justify-center">
          <button
            aria-label="Swap source and destination"
            className="rounded-full border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-50 disabled:opacity-50"
            disabled={isWorking}
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
              disabled={isWorking}
              label="Destination chain"
              onChange={selectDest}
              value={destChain}
            />
          }
        />
      </section>

      <section className="mt-6 space-y-3">
        <button
          className="w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          disabled={
            !srcWallet ||
            !dstWallet ||
            isWorking ||
            status.kind === "ready-to-redeem" ||
            status.kind === "complete" ||
            amountInput === ""
          }
          onClick={() => {
            void handleSwap();
          }}
          type="button"
        >
          {isWorking ? "Working…" : "Swap"}
        </button>

        {missingWallet ? (
          <p className="text-center text-xs text-amber-700">
            Connect and activate a {missingWallet.toUpperCase()} wallet above to bridge between
            these chains.
          </p>
        ) : null}

        {status.kind === "ready-to-redeem" || status.kind === "redeeming" ? (
          <button
            className="w-full rounded-md border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
            disabled={status.kind === "redeeming"}
            onClick={() => {
              void handleRedeem();
            }}
            type="button"
          >
            {status.kind === "redeeming"
              ? `Minting on ${dstSpec.label}…`
              : `Mint on ${dstSpec.label}`}
          </button>
        ) : null}

        {status.kind === "complete" ? (
          <button
            className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
            onClick={resetTransfer}
            type="button"
          >
            Reset
          </button>
        ) : null}

        <StatusPanel dstSpec={dstSpec} srcSpec={srcSpec} status={status} />

        <p className="text-center text-xs text-neutral-500">
          Need testnet USDC?{" "}
          <a
            className="text-blue-600 hover:underline"
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
