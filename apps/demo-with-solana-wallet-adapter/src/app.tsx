import { useEffect, useMemo, useState } from "react";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { WalletStandardWallet } from "@butr/svm";
import { useActiveWallet, useConnectWallet, useDisconnectWallet, useIsHydrated } from "@butr/react";
import { useDiscoveredWallets } from "./wallet-provider";
import { ButrAdapterBridge } from "./butr-adapter-bridge";

const DEVNET = "https://api.devnet.solana.com";
const BURN_ADDRESS = new PublicKey("11111111111111111111111111111111");

const App = () => (
  <main className="mx-auto max-w-2xl px-6 py-10 font-sans text-neutral-900">
    <header className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">butr + @solana/wallet-adapter-react</h1>
      <p className="mt-1 text-sm text-neutral-500">
        butr handles wallet discovery and selection. A thin bridge wraps the active
        butr wallet as a <code>BaseMessageSignerWalletAdapter</code> so the standard
        Solana adapter hooks (<code>useWallet</code>, <code>useConnection</code>) and
        any dapp/lib that consumes them work unchanged.
      </p>
    </header>
    <Content />
  </main>
);

const Content = () => {
  const isHydrated = useIsHydrated();
  const active = useActiveWallet();
  const connect = useConnectWallet();
  const discovered = useDiscoveredWallets();

  if (!isHydrated) return <p className="text-sm text-neutral-500">Loading…</p>;

  if (!active) {
    return (
      <section className="space-y-3">
        <h2 className="font-semibold">Available wallets</h2>
        {discovered.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No Wallet Standard wallets detected. Install Phantom, Solflare, or Backpack
            and refresh.
          </p>
        ) : (
          <ul className="space-y-2">
            {discovered.map((wallet) => (
              <li key={wallet.id}>
                <button
                  className="flex w-full items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-left hover:bg-neutral-50"
                  onClick={() => void connect(wallet.id)}
                  type="button"
                >
                  {wallet.icon ? <img alt="" className="h-6 w-6 rounded" src={wallet.icon} /> : null}
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

const BridgeAndExplore = ({ wallet }: { wallet: ReturnType<typeof useActiveWallet> & object }) => {
  const [bridge, setBridge] = useState<ButrAdapterBridge | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const ws = (await wallet.connector.getSigner()) as WalletStandardWallet;
        if (cancelled) return;
        setBridge(new ButrAdapterBridge(wallet.connector, ws, wallet.account.walletAddress));
      } catch (e) {
        if (!cancelled) setError(formatError(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wallet.account.walletAddress, wallet.connector]);

  if (error) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
    );
  }

  if (!bridge) {
    return <p className="text-sm text-neutral-500">Building bridge…</p>;
  }

  const wallets = [bridge];

  return (
    <ConnectionProvider endpoint={DEVNET}>
      <SolanaWalletProvider autoConnect wallets={wallets}>
        <AdapterConsumer butrWallet={wallet} />
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

const AdapterConsumer = ({
  butrWallet,
}: {
  butrWallet: ReturnType<typeof useActiveWallet> & object;
}) => {
  // From here down it's STANDARD @solana/wallet-adapter-react usage —
  // any tutorial or dapp using these hooks works unchanged.
  const { connection } = useConnection();
  const { publicKey, signMessage, sendTransaction, wallet: adapter } = useWallet();
  const disconnect = useDisconnectWallet();
  const [balance, setBalance] = useState<string>("…");
  const [signature, setSignature] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pubkey = useMemo(() => publicKey ?? null, [publicKey]);

  useEffect(() => {
    if (!pubkey) return;
    let cancelled = false;
    void (async () => {
      try {
        const lamports = await connection.getBalance(pubkey);
        if (!cancelled) setBalance(`${lamports / LAMPORTS_PER_SOL} SOL`);
      } catch (e) {
        if (!cancelled) setBalance("error");
        console.warn("getBalance failed:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connection, pubkey]);

  const handleSign = async () => {
    if (!signMessage) return;
    setError(null);
    try {
      const sig = await signMessage(
        new TextEncoder().encode("Hello from butr + @solana/wallet-adapter-react"),
      );
      setSignature(toBase58(sig));
    } catch (e) {
      setError(formatError(e));
    }
  };

  const handleSendTx = async () => {
    if (!pubkey) return;
    setError(null);
    try {
      const tx = new Transaction().add(
        SystemProgram.transfer({ fromPubkey: pubkey, toPubkey: BURN_ADDRESS, lamports: 0 }),
      );
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = pubkey;
      const sig = await sendTransaction(tx, connection);
      setTxSignature(sig);
    } catch (e) {
      setError(formatError(e));
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            Connected via adapter bridge
          </p>
          <p className="font-mono text-sm text-neutral-900">{adapter?.adapter.name ?? "—"}</p>
          <p className="break-all font-mono text-xs text-neutral-500">{pubkey?.toBase58()}</p>
        </div>
        <button
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
          onClick={() => disconnect(butrWallet.connector.id)}
          type="button"
        >
          Disconnect
        </button>
      </div>
      <Row label="Network">Devnet (via useConnection)</Row>
      <Row label="Balance">{balance}</Row>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
          disabled={!signMessage}
          onClick={() => void handleSign()}
          type="button"
        >
          Sign &quot;Hello from butr + adapter&quot;
        </button>
        <button
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
          disabled={!pubkey}
          onClick={() => void handleSendTx()}
          type="button"
        >
          Send 0 SOL to System Program
        </button>
      </div>
      {signature ? (
        <Row label="Signature">
          <code className="break-all font-mono text-xs">{signature}</code>
        </Row>
      ) : null}
      {txSignature ? (
        <Row label="Tx signature">
          <a
            className="break-all font-mono text-xs text-blue-600 hover:underline"
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            rel="noreferrer noopener"
            target="_blank"
          >
            {txSignature}
          </a>
        </Row>
      ) : null}
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      ) : null}
    </section>
  );
};

const Row = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div className="flex items-baseline gap-3 rounded-lg border border-neutral-200 bg-white p-4">
    <span className="w-28 shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-500">
      {label}
    </span>
    <span className="text-sm text-neutral-900">{children}</span>
  </div>
);

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const toBase58 = (bytes: Uint8Array): string => {
  let intVal = 0n;
  for (const byte of bytes) intVal = (intVal << 8n) | BigInt(byte);
  let out = "";
  while (intVal > 0n) {
    const remainder = intVal % 58n;
    intVal /= 58n;
    out = BASE58_ALPHABET[Number(remainder)] + out;
  }
  for (const byte of bytes) {
    if (byte !== 0) break;
    out = "1" + out;
  }
  return out;
};

const formatError = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  return String(e);
};

export { App };
