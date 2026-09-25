import type { ConnectedWallet } from "@usebutr/core";
import { useConnect, useSigner, useWallet, useWalletManager } from "@usebutr/react";
import { useEffect, useMemo, useState } from "react";
import {
  type Address,
  createPublicClient,
  createWalletClient,
  custom,
  formatEther,
  http,
  isAddress,
  parseEther,
} from "viem";
import { sepolia } from "viem/chains";

import { useDiscoveredWallets } from "./wallet-provider";

const BURN_ADDRESS: Address = "0x000000000000000000000000000000000000dEaD";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

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
  wallet: ConnectedWallet;
}) => {
  const signer = useSigner(wallet);
  const [balance, setBalance] = useState<string>("…");
  const [signature, setSignature] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const account: Address = useMemo(() => {
    const candidate = wallet.account.walletAddress;
    if (!isAddress(candidate)) {
      throw new Error(`Invalid EVM address: ${candidate}`);
    }
    return candidate;
  }, [wallet.account.walletAddress]);

  const walletClient = useMemo(
    () =>
      signer.data?.kind === "eip1193"
        ? createWalletClient({ account, chain: sepolia, transport: custom(signer.data.provider) })
        : null,
    [account, signer.data],
  );
  const shownError = errorMsg ?? (signer.status === "error" ? signer.error.message : null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const wei = await publicClient.getBalance({ address: account });
        if (!cancelled) {
          setBalance(`${formatEther(wei)} ETH`);
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
  }, [account]);

  const handleSign = async () => {
    if (!walletClient) {
      return;
    }
    setErrorMsg(null);
    try {
      const sig = await walletClient.signMessage({ account, message: "Hello from butr + viem" });
      setSignature(sig);
    } catch (error) {
      setErrorMsg(formatError(error instanceof Error ? error : String(error)));
    }
  };

  const handleSendTx = async () => {
    if (!walletClient) {
      return;
    }
    setErrorMsg(null);
    try {
      const hash = await walletClient.sendTransaction({
        account,
        chain: sepolia,
        to: BURN_ADDRESS,
        value: parseEther("0"),
      });
      setTxHash(hash);
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
          <p className="text-foreground-muted font-mono text-xs">{account}</p>
        </div>
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm"
          onClick={onDisconnect}
          type="button"
        >
          Disconnect
        </button>
      </div>
      <Row label="Network">Sepolia (chain id 11155111)</Row>
      <Row label="Balance">{balance}</Row>
      <div className="flex flex-wrap gap-2">
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={!walletClient}
          onClick={() => {
            void handleSign();
          }}
          type="button"
        >
          Sign &quot;Hello from butr + viem&quot;
        </button>
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={!walletClient}
          onClick={() => {
            void handleSendTx();
          }}
          type="button"
        >
          Send 0 ETH to burn address
        </button>
      </div>
      {signature !== null && signature !== "" ? (
        <Row label="Signature">
          <code className="font-mono text-xs break-all">{signature}</code>
        </Row>
      ) : null}
      {txHash !== null && txHash !== "" ? (
        <Row label="Tx hash">
          <a
            className="text-info-accent font-mono text-xs break-all hover:underline"
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            rel="noreferrer noopener"
            target="_blank"
          >
            {txHash}
          </a>
        </Row>
      ) : null}
      {shownError !== null && shownError !== "" ? (
        <p className="border-danger-border bg-danger-surface text-danger-foreground rounded-md border p-3 text-sm">
          {shownError}
        </p>
      ) : null}
    </section>
  );
};

const Content = () => {
  const active = useWallet();
  const { connect } = useConnect();
  const { disconnect } = useWalletManager();
  const discovered = useDiscoveredWallets();

  if (!active) {
    return (
      <section className="space-y-3">
        <h2 className="font-semibold">Available wallets</h2>
        {discovered.length === 0 ? (
          <p className="text-foreground-muted text-sm">
            No EIP-6963 wallets detected. Install MetaMask, Rabby, or another EVM browser wallet and
            refresh.
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

  return (
    <Connected
      onDisconnect={() => {
        disconnect(active.connector.id);
      }}
      wallet={active}
    />
  );
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
        <h1 className="text-3xl font-semibold tracking-tight">butr + viem</h1>
        <p className="text-foreground-muted mt-1 text-sm">
          butr handles wallet discovery and connection state. viem wraps the EIP-1193 provider that{" "}
          <code>useSigner()</code> resolves with <code>createWalletClient</code> for chain reads,
          signing, and tx submission.
        </p>
      </header>
      <Content />
    </main>
  </>
);

export { App };
