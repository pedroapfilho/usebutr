import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import {
  useActiveWallet,
  useConnectWallet,
  useDisconnectWallet,
  useIsHydrated,
} from "@usebutr/react";
import type { WalletStandardWallet } from "@usebutr/sui";
import { useEffect, useMemo, useState } from "react";

import { useDiscoveredWallets } from "./wallet-provider";

const RPC_URL = "https://fullnode.testnet.sui.io:443";

const client = new SuiClient({ url: RPC_URL });

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
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addr = useMemo(() => wallet.account.walletAddress, [wallet.account.walletAddress]);

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
        const result = await client.getBalance({ owner: addr });
        if (!cancelled) {
          const sui = Number(result.totalBalance) / 1_000_000_000;
          setBalance(`${sui} SUI`);
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
  }, [addr]);

  const handleSign = async () => {
    setErrorMsg(null);
    try {
      const message = new TextEncoder().encode("Hello from butr + @mysten/sui");
      const result = await wallet.connector.signMessage(message);
      // butr returns the signature bytes; render as hex for the UI.
      let hex = "";
      for (const byte of result.signature) {
        hex += byte.toString(16).padStart(2, "0");
      }
      setSignature(hex);
    } catch (error) {
      setErrorMsg(formatError(error));
    }
  };

  const handleSendTx = async () => {
    setErrorMsg(null);
    try {
      // Build a no-op transaction that splits 0 MIST off the gas coin
      // and transfers it back to the sender — a safe roundtrip on
      // testnet that proves end-to-end signing + execution.
      const tx = new Transaction();
      tx.setSender(addr);
      const [coin] = tx.splitCoins(tx.gas, [0]);
      tx.transferObjects([coin], addr);

      // Use the wallet's chain-side broadcast.
      const digest = await wallet.connector.sendTx(tx);
      setTxDigest(digest);
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
          <p className="font-mono text-xs break-all text-neutral-500">{addr}</p>
        </div>
        <button
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
          onClick={onDisconnect}
          type="button"
        >
          Disconnect
        </button>
      </div>
      <Row label="Network">Sui Testnet (via @mysten/sui SuiClient)</Row>
      <Row label="Balance">{balance}</Row>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
          disabled={!walletStd}
          onClick={() => void handleSign()}
          type="button"
        >
          Sign &quot;Hello from butr + @mysten/sui&quot;
        </button>
        <button
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
          disabled={!walletStd}
          onClick={() => void handleSendTx()}
          type="button"
        >
          Send 0-MIST self-transfer
        </button>
      </div>
      {signature ? (
        <Row label="Signature">
          <code className="font-mono text-xs break-all">{signature}</code>
        </Row>
      ) : null}
      {txDigest ? (
        <Row label="Tx digest">
          <a
            className="font-mono text-xs break-all text-blue-600 hover:underline"
            href={`https://suiscan.xyz/testnet/tx/${txDigest}`}
            rel="noreferrer noopener"
            target="_blank"
          >
            {txDigest}
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
            No Sui Wallet Standard wallets detected. Install Sui Wallet, Suiet, Phantom, or Surf and
            refresh.
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
                    <img alt="" className="h-6 w-6 rounded" src={wallet.icon} />
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
  <main className="mx-auto max-w-2xl px-6 py-10 font-sans text-neutral-900">
    <header className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">butr + @mysten/sui</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Sui&apos;s official TypeScript SDK. butr discovers and manages the wallet;{" "}
        <code>@mysten/sui</code> handles the RPC and transaction builder; the wallet&apos;s Wallet
        Standard features supply signing + execution.
      </p>
    </header>
    <Content />
  </main>
);

export { App };
