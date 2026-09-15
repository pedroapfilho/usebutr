import type { WalletSigner } from "@usebutr/core";
import { isEip1193Provider } from "@usebutr/evm";
import { useActiveWallet, useConnectWallet, useDisconnectWallet } from "@usebutr/react";
import { injected } from "@wagmi/connectors";
import {
  type Config,
  connect,
  createConfig,
  getBalance,
  sendTransaction,
  signMessage,
} from "@wagmi/core";
import { useEffect, useMemo, useState } from "react";
import { type Address, type EIP1193Provider, formatEther, http, isAddress, parseEther } from "viem";
import { sepolia } from "viem/chains";

import { useDiscoveredWallets } from "./wallet-provider";

const BURN_ADDRESS: Address = "0x000000000000000000000000000000000000dEaD";

const isWagmiProvider = (provider: WalletSigner): provider is EIP1193Provider =>
  isEip1193Provider(provider) &&
  "on" in provider &&
  typeof provider.on === "function" &&
  "removeListener" in provider &&
  typeof provider.removeListener === "function";

const buildWagmiConfig = (provider: EIP1193Provider, butrName: string, butrId: string): Config =>
  createConfig({
    chains: [sepolia],
    connectors: [
      injected({
        target: {
          id: butrId,
          name: butrName,
          provider: () => provider,
        },
      }),
    ],
    transports: {
      [sepolia.id]: http(),
    },
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
  wallet: ReturnType<typeof useActiveWallet> & object;
}) => {
  const [wagmiConfig, setWagmiConfig] = useState<Config | null>(null);
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

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        if (cancelled) {
          return;
        }
        const provider = await wallet.connector.getSigner();
        if (!isWagmiProvider(provider)) {
          throw new Error("EVM signer is not an EIP-1193 provider");
        }
        if (cancelled) {
          return;
        }
        const cfg = buildWagmiConfig(provider, wallet.connector.name, wallet.connector.id);
        const connector = cfg.connectors[0];
        if (connector !== undefined) {
          await connect(cfg, { connector });
        }
        if (!cancelled) {
          setWagmiConfig(cfg);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMsg(formatError(error instanceof Error ? error : String(error)));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [account, wallet.connector]);

  useEffect(() => {
    if (wagmiConfig === null) {
      return undefined;
    }
    let cancelled = false;
    void (async () => {
      try {
        const result = await getBalance(wagmiConfig, { address: account });
        if (!cancelled) {
          setBalance(`${formatEther(result.value)} ${result.symbol}`);
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
  }, [account, wagmiConfig]);

  const handleSign = async () => {
    if (!wagmiConfig) {
      return;
    }
    setErrorMsg(null);
    try {
      const sig = await signMessage(wagmiConfig, { message: "Hello from butr + wagmi" });
      setSignature(sig);
    } catch (error) {
      setErrorMsg(formatError(error instanceof Error ? error : String(error)));
    }
  };

  const handleSendTx = async () => {
    if (!wagmiConfig) {
      return;
    }
    setErrorMsg(null);
    try {
      const hash = await sendTransaction(wagmiConfig, {
        chainId: sepolia.id,
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
      <Row label="Network">Sepolia (via wagmi)</Row>
      <Row label="Balance">{balance}</Row>
      <div className="flex flex-wrap gap-2">
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={!wagmiConfig}
          onClick={() => {
            void handleSign();
          }}
          type="button"
        >
          Sign &quot;Hello from butr + wagmi&quot;
        </button>
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={!wagmiConfig}
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
      {errorMsg !== null && errorMsg !== "" ? (
        <p className="border-danger-border bg-danger-surface text-danger-foreground rounded-md border p-3 text-sm">
          {errorMsg}
        </p>
      ) : null}
    </section>
  );
};

const Content = () => {
  const active = useActiveWallet();
  const connectWallet = useConnectWallet();
  const disconnect = useDisconnectWallet();
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
                    void connectWallet(wallet.id);
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
        <h1 className="text-3xl font-semibold tracking-tight">butr + wagmi</h1>
        <p className="text-foreground-muted mt-1 text-sm">
          butr discovers and manages the wallet connection (EIP-6963 + multi-platform pool). wagmi
          (via <code>@wagmi/core</code>) handles chain reads, signing, and tx submission against the
          same EIP-1193 provider butr exposes through <code>wallet.connector.getSigner()</code>.
        </p>
      </header>
      <Content />
    </main>
  </>
);

export { App };
