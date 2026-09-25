import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import type { ConnectedWallet } from "@usebutr/core";
import { bytesToBase58 } from "@usebutr/core";
import { useConnect, useSelectedWallet, useWalletManager } from "@usebutr/react";
import { useEffect, useMemo, useState } from "react";

import { ButrAdapterBridge } from "./butr-adapter-bridge";
import { useDiscoveredWallets } from "./wallet-provider";

const DEVNET = "https://api.devnet.solana.com";
const BURN_ADDRESS = new PublicKey("11111111111111111111111111111111");

const formatError = (error: Error | string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return error;
};

const Row = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div className="border-border-default flex items-baseline gap-3 rounded-lg border bg-white p-4">
    <span className="text-foreground-muted w-28 shrink-0 text-xs font-medium tracking-wide uppercase">
      {label}
    </span>
    <span className="text-foreground-primary text-sm">{children}</span>
  </div>
);

const AdapterConsumer = ({ butrWallet }: { butrWallet: ConnectedWallet<"svm"> }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signMessage, wallet: adapter } = useWallet();
  const { disconnect } = useWalletManager();
  const [balance, setBalance] = useState<string>("…");
  const [signature, setSignature] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pubkey = useMemo(() => publicKey ?? null, [publicKey]);

  useEffect(() => {
    if (pubkey === null) {
      return undefined;
    }
    let cancelled = false;
    void (async () => {
      try {
        const lamports = await connection.getBalance(pubkey);
        if (!cancelled) {
          setBalance(`${lamports / LAMPORTS_PER_SOL} SOL`);
        }
      } catch (error) {
        if (!cancelled) {
          setBalance("error");
        }
        console.warn("getBalance failed:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connection, pubkey]);

  const handleSign = async () => {
    if (!signMessage) {
      return;
    }
    setErrorMsg(null);
    try {
      const sig = await signMessage(
        new TextEncoder().encode("Hello from butr + @solana/wallet-adapter-react"),
      );
      setSignature(bytesToBase58(sig));
    } catch (error) {
      setErrorMsg(formatError(error instanceof Error ? error : String(error)));
    }
  };

  const handleSendTx = async () => {
    if (!pubkey) {
      return;
    }
    setErrorMsg(null);
    try {
      const tx = new Transaction().add(
        SystemProgram.transfer({ fromPubkey: pubkey, lamports: 0, toPubkey: BURN_ADDRESS }),
      );
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = pubkey;
      const sig = await sendTransaction(tx, connection);
      setTxSignature(sig);
    } catch (error) {
      setErrorMsg(formatError(error instanceof Error ? error : String(error)));
    }
  };

  return (
    <section className="space-y-4">
      <div className="border-success-border bg-success-surface flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="text-success-foreground text-xs font-medium tracking-wide uppercase">
            Connected via adapter bridge
          </p>
          <p className="text-foreground-primary font-mono text-sm">
            {adapter?.adapter.name ?? "—"}
          </p>
          <p className="text-foreground-muted font-mono text-xs break-all">{pubkey?.toBase58()}</p>
        </div>
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm"
          onClick={() => {
            disconnect(butrWallet.connector.id);
          }}
          type="button"
        >
          Disconnect
        </button>
      </div>
      <Row label="Network">Devnet (via useConnection)</Row>
      <Row label="Balance">{balance}</Row>
      <div className="flex flex-wrap gap-2">
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={!signMessage}
          onClick={() => {
            void handleSign();
          }}
          type="button"
        >
          Sign &quot;Hello from butr + adapter&quot;
        </button>
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={!pubkey}
          onClick={() => {
            void handleSendTx();
          }}
          type="button"
        >
          Send 0 SOL to System Program
        </button>
      </div>
      {signature !== null && signature !== "" ? (
        <Row label="Signature">
          <code className="font-mono text-xs break-all">{signature}</code>
        </Row>
      ) : null}
      {txSignature !== null && txSignature !== "" ? (
        <Row label="Tx signature">
          <a
            className="text-info-accent font-mono text-xs break-all hover:underline"
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            rel="noreferrer noopener"
            target="_blank"
          >
            {txSignature}
          </a>
        </Row>
      ) : null}
      {errorMsg !== null && errorMsg !== "" ? (
        <p className="border-danger-border bg-danger-surface text-danger-foreground rounded-md border p-3 text-sm">
          {errorMsg}
        </p>
      ) : null}
    </section>
  );
};

const BridgeAndExplore = ({ wallet }: { wallet: ConnectedWallet<"svm"> }) => {
  // The bridge signs through butr's adapter, so it needs no signer handoff and
  // exists as soon as the wallet does. A stable array keeps the adapter
  // provider from re-running its wallet setup on every render.
  const wallets = useMemo(
    () => [new ButrAdapterBridge(wallet.connector, wallet.account)],
    [wallet.account, wallet.connector],
  );

  return (
    <ConnectionProvider endpoint={DEVNET}>
      <SolanaWalletProvider autoConnect wallets={wallets}>
        <AdapterConsumer butrWallet={wallet} />
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

const Content = () => {
  const active = useSelectedWallet("svm");
  const { connect } = useConnect();
  const discovered = useDiscoveredWallets();

  if (!active) {
    return (
      <section className="space-y-3">
        <h2 className="font-semibold">Available wallets</h2>
        {discovered.length === 0 ? (
          <p className="text-foreground-muted text-sm">
            No Wallet Standard wallets detected. Install Phantom, Solflare, or Backpack and refresh.
          </p>
        ) : (
          <ul className="space-y-2">
            {discovered.map((wallet) => (
              <li key={wallet.id}>
                <button
                  className="border-border-default hover:bg-surface-subtle flex w-full items-center gap-3 rounded-lg border bg-white px-4 py-3 text-left"
                  onClick={() => {
                    connect(wallet.id);
                  }}
                  type="button"
                >
                  {wallet.icon !== undefined && wallet.icon !== "" ? (
                    <img
                      alt=""
                      className="size-6 rounded"
                      height={24}
                      src={wallet.icon}
                      width={24}
                    />
                  ) : null}
                  <span className="font-medium">{wallet.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return <BridgeAndExplore wallet={active} />;
};

const App = () => (
  <>
    <a
      className="sr-only px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:shadow"
      href="#main"
    >
      Skip to content
    </a>
    <main className="text-foreground-primary mx-auto max-w-2xl px-6 py-10 font-sans" id="main">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          butr + @solana/wallet-adapter-react
        </h1>
        <p className="text-foreground-muted mt-1 text-sm">
          butr handles wallet discovery and selection. A thin bridge wraps the active butr wallet as
          a <code>BaseMessageSignerWalletAdapter</code> so the standard Solana adapter hooks (
          <code>useWallet</code>, <code>useConnection</code>) and any dapp/lib that consumes them
          work unchanged.
        </p>
      </header>
      <Content />
    </main>
  </>
);

export { App };
