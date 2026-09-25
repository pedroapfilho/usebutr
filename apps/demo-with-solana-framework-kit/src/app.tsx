import {
  AccountRole,
  type Address,
  type Instruction,
  address,
  appendTransactionMessageInstruction,
  createSolanaRpc,
  createTransactionMessage,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  compileTransaction,
  getBase64EncodedWireTransaction,
} from "@solana/kit";
import { useBalance } from "@solana/react-hooks";
import { bytesToBase58 } from "@usebutr/core";
import { useActiveWallet, useConnectWallet, useDisconnectWallet } from "@usebutr/react";
import { isSolanaSignAndSendTransactionFeature, isSolanaSignMessageFeature } from "@usebutr/svm";
import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";
import { getFeature, isWalletStandardWallet } from "@usebutr/wallet-standard-shared";
import { useEffect, useMemo, useState } from "react";

import { useDiscoveredWallets } from "./wallet-provider";

const DEVNET = "https://api.devnet.solana.com";
const BURN_ADDRESS = address("11111111111111111111111111111111");

const SYSTEM_PROGRAM = address("11111111111111111111111111111111");
const rpc = createSolanaRpc(DEVNET);

const buildTransferInstruction = (from: Address, to: Address, lamports: bigint): Instruction => {
  const data = new Uint8Array(12);
  const view = new DataView(data.buffer);
  view.setUint32(0, 2, true);
  view.setBigUint64(4, lamports, true);
  return {
    accounts: [
      { address: from, role: AccountRole.WRITABLE_SIGNER },
      { address: to, role: AccountRole.WRITABLE },
    ],
    data,
    programAddress: SYSTEM_PROGRAM,
  };
};

const base64ToBytes = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.codePointAt(i) ?? 0;
  }
  return bytes;
};

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
  const [walletStd, setWalletStd] = useState<WalletStandardWallet | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addr: Address = useMemo(
    () => address(wallet.account.walletAddress),
    [wallet.account.walletAddress],
  );

  const { error: balanceError, fetching, lamports } = useBalance(wallet.account.walletAddress);
  const balance = useMemo(() => {
    if (lamports !== null) {
      return `${Number(lamports) / 1_000_000_000} SOL`;
    }
    if (balanceError !== null && balanceError !== undefined) {
      return "error";
    }
    return fetching ? "…" : "—";
  }, [lamports, fetching, balanceError]);

  useEffect(() => {
    // SAFETY: the effect cleanup sets this after the await; TypeScript cannot see writes from closures
    let cancelled = false as boolean;
    void (async () => {
      try {
        const signer = await wallet.connector.getSigner();
        if (!isWalletStandardWallet(signer)) {
          throw new Error("SVM signer is not a Wallet Standard wallet");
        }
        if (!cancelled) {
          setWalletStd(signer);
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
  }, [wallet.connector]);

  const handleSign = async () => {
    if (!walletStd) {
      return;
    }
    setErrorMsg(null);
    try {
      const feature = getFeature(walletStd, "solana:signMessage", isSolanaSignMessageFeature);
      if (feature === undefined) {
        throw new Error("Wallet does not advertise solana:signMessage");
      }
      const account = walletStd.accounts.at(0);
      if (account === undefined) {
        throw new Error("No exposed account");
      }
      const message = new TextEncoder().encode("Hello from butr + framework-kit");
      const outputs = await feature.signMessage({ account, message });
      const output = outputs.at(0);
      if (output === undefined) {
        throw new Error("signMessage returned no outputs");
      }
      setSignature(bytesToBase58(output.signature));
    } catch (error) {
      setErrorMsg(formatError(error instanceof Error ? error : String(error)));
    }
  };

  const handleSendTx = async () => {
    if (!walletStd) {
      return;
    }
    setErrorMsg(null);
    try {
      const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
      const message = pipe(
        createTransactionMessage({ version: 0 }),
        (m) => setTransactionMessageFeePayer(addr, m),
        (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
        (m) =>
          appendTransactionMessageInstruction(buildTransferInstruction(addr, BURN_ADDRESS, 0n), m),
      );
      const compiled = compileTransaction(message);
      const wire = getBase64EncodedWireTransaction(compiled);
      const bytes = base64ToBytes(wire);

      const feature = getFeature(
        walletStd,
        "solana:signAndSendTransaction",
        isSolanaSignAndSendTransactionFeature,
      );
      if (feature === undefined) {
        throw new Error("Wallet does not advertise solana:signAndSendTransaction");
      }
      const account = walletStd.accounts.at(0);
      if (account === undefined) {
        throw new Error("No exposed account");
      }
      const outputs = await feature.signAndSendTransaction({
        account,
        chain: "solana:devnet",
        transaction: bytes,
      });
      const output = outputs.at(0);
      if (output === undefined) {
        throw new Error("signAndSendTransaction returned no outputs");
      }
      setTxSignature(bytesToBase58(output.signature));
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
      <Row label="Network">Solana Devnet (framework-kit useBalance)</Row>
      <Row label="Balance">{balance}</Row>
      <div className="flex flex-wrap gap-2">
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={!walletStd}
          onClick={() => {
            void handleSign();
          }}
          type="button"
        >
          Sign &quot;Hello from butr + framework-kit&quot;
        </button>
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={!walletStd}
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

const Content = () => {
  const active = useActiveWallet();
  const connect = useConnectWallet();
  const disconnect = useDisconnectWallet();
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
                    void connect(wallet.id);
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
        <h1 className="text-3xl font-semibold tracking-tight">butr + framework-kit</h1>
        <p className="text-foreground-muted mt-1 text-sm">
          The recommended modern Solana stack. butr discovers and manages the wallet; Solana
          Foundation&apos;s framework-kit (<code>@solana/client</code> +{" "}
          <code>@solana/react-hooks</code>) is the reactive RPC/data layer: <code>useBalance</code>{" "}
          auto-fetches and watches; the wallet&apos;s Wallet Standard features supply signing +
          submission.
        </p>
      </header>
      <Content />
    </main>
  </>
);

export { App };
