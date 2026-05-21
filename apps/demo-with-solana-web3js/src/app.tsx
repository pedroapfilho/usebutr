import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  useActiveWallet,
  useConnectWallet,
  useDisconnectWallet,
  useIsHydrated,
} from "@usebutr/react";
import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignMessageFeature,
  WalletStandardWallet,
} from "@usebutr/svm";
import { useEffect, useMemo, useState } from "react";

import { useDiscoveredWallets } from "./wallet-provider";

const DEVNET = "https://api.devnet.solana.com";
// SOL burn-equivalent: System Program address. Sending 0 lamports here
// is harmless and proves the signer + connection are wired.
const BURN_ADDRESS = new PublicKey("11111111111111111111111111111111");

const connection = new Connection(DEVNET, "confirmed");

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const bytesToBase58 = (bytes: Uint8Array): string => {
  // Tiny base58 encoder so the demo doesn't pull bs58 just for one display.
  // Not for production use — Solana provides bs58 in its tooling.
  let intVal = 0n;
  for (const byte of bytes) {
    intVal = (intVal << 8n) | BigInt(byte);
  }
  let out = "";
  while (intVal > 0n) {
    const remainder = intVal % 58n;
    intVal /= 58n;
    out = BASE58_ALPHABET[Number(remainder)] + out;
  }
  for (const byte of bytes) {
    if (byte !== 0) {
      break;
    }
    out = `1${out}`;
  }
  return out;
};

const formatError = (e: unknown): string => {
  if (e instanceof Error) {
    return e.message;
  }
  return String(e);
};

const Row = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div className="flex items-baseline gap-3 rounded-lg border border-neutral-200 bg-white p-4">
    <span className="w-28 shrink-0 text-xs font-medium tracking-wide text-neutral-500 uppercase">
      {label}
    </span>
    <span className="text-sm text-neutral-900">{children}</span>
  </div>
);

const Connected = ({
  onDisconnect,
  wallet,
}: {
  onDisconnect: () => void;
  wallet: ReturnType<typeof useActiveWallet> & object;
}) => {
  const [walletStd, setWalletStd] = useState<WalletStandardWallet | null>(null);
  const [balance, setBalance] = useState<string>("…");
  const [signature, setSignature] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const publicKey = useMemo(
    () => new PublicKey(wallet.account.walletAddress),
    [wallet.account.walletAddress],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const ws = (await wallet.connector.getSigner()) as WalletStandardWallet;
        if (!cancelled) {
          setWalletStd(ws);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMsg(formatError(error));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wallet.connector]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const lamports = await connection.getBalance(publicKey);
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
  }, [publicKey]);

  const handleSign = async () => {
    if (!walletStd) {
      return;
    }
    setErrorMsg(null);
    try {
      const feature = walletStd.features["solana:signMessage"] as
        | SolanaSignMessageFeature
        | undefined;
      if (!feature) {
        throw new Error("Wallet does not advertise solana:signMessage");
      }
      const message = new TextEncoder().encode("Hello from butr + @solana/web3.js");
      const account = walletStd.accounts[0];
      if (!account) {
        throw new Error("No exposed account");
      }
      const [output] = await feature.signMessage({ account, message });
      if (!output) {
        throw new Error("signMessage returned no outputs");
      }
      setSignature(bytesToBase58(output.signature));
    } catch (error) {
      setErrorMsg(formatError(error));
    }
  };

  const handleSendTx = async () => {
    if (!walletStd) {
      return;
    }
    setErrorMsg(null);
    try {
      // Build the tx with @solana/web3.js
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          lamports: 0,
          toPubkey: BURN_ADDRESS,
        }),
      );
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      // Hand the serialized tx to the wallet's Wallet Standard feature.
      const feature = walletStd.features["solana:signAndSendTransaction"] as
        | SolanaSignAndSendTransactionFeature
        | undefined;
      if (!feature) {
        throw new Error("Wallet does not advertise solana:signAndSendTransaction");
      }
      const account = walletStd.accounts[0];
      if (!account) {
        throw new Error("No exposed account");
      }
      const serialised = tx.serialize({ requireAllSignatures: false });
      const [output] = await feature.signAndSendTransaction({
        account,
        chain: "solana:devnet",
        transaction: new Uint8Array(serialised),
      });
      if (!output) {
        throw new Error("signAndSendTransaction returned no outputs");
      }
      setTxSignature(bytesToBase58(output.signature));
    } catch (error) {
      setErrorMsg(formatError(error));
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-emerald-700 uppercase">Connected</p>
          <p className="font-mono text-sm text-neutral-900">{wallet.connector.name}</p>
          <p className="font-mono text-xs break-all text-neutral-500">
            {wallet.account.walletAddress}
          </p>
        </div>
        <button
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
          onClick={onDisconnect}
          type="button"
        >
          Disconnect
        </button>
      </div>
      <Row label="Network">Solana Devnet (via web3.js Connection)</Row>
      <Row label="Balance">{balance}</Row>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
          disabled={!walletStd}
          onClick={() => void handleSign()}
          type="button"
        >
          Sign &quot;Hello from butr + @solana/web3.js&quot;
        </button>
        <button
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
          disabled={!walletStd}
          onClick={() => void handleSendTx()}
          type="button"
        >
          Send 0 SOL to System Program
        </button>
      </div>
      {signature ? (
        <Row label="Signature">
          <code className="font-mono text-xs break-all">{signature}</code>
        </Row>
      ) : null}
      {txSignature ? (
        <Row label="Tx signature">
          <a
            className="font-mono text-xs break-all text-blue-600 hover:underline"
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            rel="noreferrer noopener"
            target="_blank"
          >
            {txSignature}
          </a>
        </Row>
      ) : null}
      {errorMsg ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </p>
      ) : null}
    </section>
  );
};

const Content = () => {
  const isHydrated = useIsHydrated();
  const active = useActiveWallet();
  const connect = useConnectWallet();
  const disconnect = useDisconnectWallet();
  const discovered = useDiscoveredWallets();

  if (!isHydrated) {
    return <p className="text-sm text-neutral-500">Loading…</p>;
  }

  if (!active) {
    return (
      <section className="space-y-3">
        <h2 className="font-semibold">Available wallets</h2>
        {discovered.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No Wallet Standard wallets detected. Install Phantom, Solflare, or Backpack and refresh.
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
                  {wallet.icon ? (
                    <img
                      alt=""
                      className="h-6 w-6 rounded"
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

  return <Connected onDisconnect={() => disconnect(active.connector.id)} wallet={active} />;
};

const App = () => (
  <>
    <a
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow"
      href="#main"
    >
      Skip to content
    </a>
    <main className="mx-auto max-w-2xl px-6 py-10 font-sans text-neutral-900" id="main">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">butr + @solana/web3.js</h1>
        <p className="mt-1 text-sm text-neutral-500">
          butr discovers Solana Wallet Standard wallets and manages the connection.{" "}
          <code>@solana/web3.js</code> provides <code>Connection</code> for chain reads and the{" "}
          <code>Transaction</code>/<code>SystemProgram</code> builders; signing + sending flow
          through the wallet&apos;s native Wallet Standard features.
        </p>
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <strong>Legacy.</strong> <code>@solana/web3.js</code> v1 is in maintenance mode. For new
          apps, prefer framework-kit (<code>demo-with-solana-framework-kit</code>), gill (
          <code>demo-with-gill</code>), or <code>@solana/kit</code> (
          <code>demo-with-solana-kit</code>).
        </p>
      </header>
      <Content />
    </main>
  </>
);

export { App };
