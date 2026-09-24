import { SuiGrpcClient } from "@mysten/sui/grpc";
import { Transaction } from "@mysten/sui/transactions";
import type { ConnectedWallet } from "@usebutr/core";
import { bytesToHex, SUI_CHAINS } from "@usebutr/core";
import { useConnect, useSelectedWallet, useWalletManager } from "@usebutr/react";
import { useEffect, useMemo, useState } from "react";

import { useDiscoveredWallets } from "./wallet-provider";

const RPC_URL = "https://fullnode.testnet.sui.io:443";

const client = new SuiGrpcClient({ baseUrl: RPC_URL, network: "testnet" });

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

const Connected = ({
  onDisconnect,
  wallet,
}: {
  onDisconnect: () => void;
  wallet: ConnectedWallet<"sui">;
}) => {
  const [balance, setBalance] = useState<string>("…");
  const [signature, setSignature] = useState<string | null>(null);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addr = useMemo(() => wallet.account.walletAddress, [wallet.account.walletAddress]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await client.getBalance({ owner: addr });
        if (!cancelled) {
          const sui = Number(result.balance.balance) / 1_000_000_000;
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
      if (!wallet.connector.signMessage) {
        throw new Error(`${wallet.connector.name} does not support sui:signPersonalMessage`);
      }
      const message = new TextEncoder().encode("Hello from butr + @mysten/sui");
      const result = await wallet.connector.signMessage(message, { account: wallet.account });
      setSignature(bytesToHex(result.signature));
    } catch (error) {
      setErrorMsg(formatError(error instanceof Error ? error : String(error)));
    }
  };

  const handleSendTx = async () => {
    setErrorMsg(null);
    try {
      if (!wallet.connector.sendTx) {
        throw new Error(`${wallet.connector.name} does not support sui:signAndExecuteTransaction`);
      }
      const tx = new Transaction();
      tx.setSender(addr);
      const [coin] = tx.splitCoins(tx.gas, [0]);
      tx.transferObjects([coin], addr);

      // The Transaction goes in as-is; the wallet serialises it. Pin testnet:
      // without `chain` the adapter uses its current chain, mainnet by default.
      const digest = await wallet.connector.sendTx(tx, {
        account: wallet.account,
        chain: SUI_CHAINS.testnet,
      });
      setTxDigest(digest);
    } catch (error) {
      setErrorMsg(formatError(error instanceof Error ? error : String(error)));
    }
  };

  return (
    <section className="space-y-4">
      <div className="border-success-border bg-success-surface flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="text-success-foreground text-xs font-medium tracking-wide uppercase">
            Connected
          </p>
          <p className="text-foreground-primary font-mono text-sm">{wallet.connector.name}</p>
          <p className="text-foreground-muted font-mono text-xs break-all">{addr}</p>
        </div>
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm"
          onClick={onDisconnect}
          type="button"
        >
          Disconnect
        </button>
      </div>
      <Row label="Network">Sui Testnet (via @mysten/sui SuiGrpcClient)</Row>
      <Row label="Balance">{balance}</Row>
      <div className="flex flex-wrap gap-2">
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={!wallet.connector.signMessage}
          onClick={() => {
            void handleSign();
          }}
          type="button"
        >
          Sign &quot;Hello from butr + @mysten/sui&quot;
        </button>
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={!wallet.connector.sendTx}
          onClick={() => {
            void handleSendTx();
          }}
          type="button"
        >
          Send 0-MIST self-transfer
        </button>
      </div>
      {signature !== null && signature !== "" ? (
        <Row label="Signature">
          <code className="font-mono text-xs break-all">{signature}</code>
        </Row>
      ) : null}
      {txDigest !== null && txDigest !== "" ? (
        <Row label="Tx digest">
          <a
            className="text-info-accent font-mono text-xs break-all hover:underline"
            href={`https://suiscan.xyz/testnet/tx/${txDigest}`}
            rel="noreferrer noopener"
            target="_blank"
          >
            {txDigest}
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

const Content = () => {
  const wallet = useSelectedWallet("sui");
  const { connect } = useConnect();
  const { disconnect } = useWalletManager();
  const discovered = useDiscoveredWallets();

  if (!wallet) {
    return (
      <section className="space-y-3">
        <h2 className="font-semibold">Available wallets</h2>
        {discovered.length === 0 ? (
          <p className="text-foreground-muted text-sm">
            No Sui Wallet Standard wallets detected. Install Sui Wallet, Suiet, Phantom, or Surf and
            refresh.
          </p>
        ) : (
          <ul className="space-y-2">
            {discovered.map((adapter) => (
              <li key={adapter.id}>
                <button
                  className="border-border-default hover:bg-surface-subtle flex w-full items-center gap-3 rounded-lg border bg-white px-4 py-3 text-left"
                  onClick={() => {
                    connect(adapter.id);
                  }}
                  type="button"
                >
                  {adapter.icon !== undefined && adapter.icon !== "" ? (
                    <img alt="" className="size-6 rounded" src={adapter.icon} />
                  ) : null}
                  <span className="font-medium">{adapter.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return (
    <Connected
      onDisconnect={() => {
        disconnect(wallet.connector.id);
      }}
      wallet={wallet}
    />
  );
};

const App = () => (
  <main className="text-foreground-primary mx-auto max-w-2xl px-6 py-10 font-sans">
    <header className="mb-8">
      <h1 className="text-3xl font-semibold tracking-tight">butr + @mysten/sui</h1>
      <p className="text-foreground-muted mt-1 text-sm">
        Sui&apos;s official TypeScript SDK. butr discovers and manages the wallet;{" "}
        <code>@mysten/sui</code> handles the RPC and transaction builder; the wallet&apos;s Wallet
        Standard features supply signing + execution.
      </p>
    </header>
    <Content />
  </main>
);

export { App };
