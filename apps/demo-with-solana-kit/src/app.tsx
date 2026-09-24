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
import { useEffect, useMemo, useState } from "react";

const SYSTEM_PROGRAM = address("11111111111111111111111111111111");
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
import type { ConnectedWallet } from "@usebutr/core";
import { bytesToBase58 } from "@usebutr/core";
import { useConnect, useSelectedWallet, useSigner, useWalletManager } from "@usebutr/react";
import type { SolanaSignAndSendTransactionFeature, SolanaSignMessageFeature } from "@usebutr/svm";
import { findAccount, getFeature } from "@usebutr/wallet-standard-shared";

import { useDiscoveredWallets } from "./wallet-provider";

const DEVNET = "https://api.devnet.solana.com";
const BURN_ADDRESS = address("11111111111111111111111111111111");

const rpc = createSolanaRpc(DEVNET);

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
  wallet: ConnectedWallet<"svm">;
}) => {
  const signer = useSigner(wallet);
  const [balance, setBalance] = useState<string>("…");
  const [signature, setSignature] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Signing goes through the wallet's own Wallet Standard features, which
  // butr hands over as the raw wallet; @solana/kit only builds and reads.
  const walletStd = signer.data?.kind === "wallet-standard" ? signer.data.wallet : null;
  const signerError =
    signer.status === "error"
      ? formatError(signer.error instanceof Error ? signer.error : String(signer.error))
      : null;
  const shownError = errorMsg ?? signerError;

  const addr: Address = useMemo(
    () => address(wallet.account.walletAddress),
    [wallet.account.walletAddress],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { value } = await rpc.getBalance(addr).send();
        if (!cancelled) {
          const sol = Number(value) / 1_000_000_000;
          setBalance(`${sol} SOL`);
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
    if (!walletStd) {
      return;
    }
    setErrorMsg(null);
    try {
      const feature = getFeature<SolanaSignMessageFeature>(
        walletStd,
        "solana:signMessage",
        "signMessage",
      );
      if (feature === undefined) {
        throw new Error("Wallet does not advertise solana:signMessage");
      }
      const account = findAccount(walletStd.accounts, wallet.account.walletAddress);
      if (account === undefined) {
        throw new Error("Wallet does not expose the active account");
      }
      const message = new TextEncoder().encode("Hello from butr + @solana/kit");
      const [output] = await feature.signMessage({ account, message });
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

      const feature = getFeature<SolanaSignAndSendTransactionFeature>(
        walletStd,
        "solana:signAndSendTransaction",
        "signAndSendTransaction",
      );
      if (feature === undefined) {
        throw new Error("Wallet does not advertise solana:signAndSendTransaction");
      }
      const account = findAccount(walletStd.accounts, wallet.account.walletAddress);
      if (account === undefined) {
        throw new Error("Wallet does not expose the active account");
      }
      const [output] = await feature.signAndSendTransaction({
        account,
        chain: "solana:devnet",
        transaction: bytes,
      });
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
      <Row label="Network">Solana Devnet (via @solana/kit RPC)</Row>
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
          Sign &quot;Hello from butr + @solana/kit&quot;
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
      {shownError !== null && shownError !== "" ? (
        <p className="border-danger-border bg-danger-surface text-danger-foreground rounded-md border p-3 text-sm">
          {shownError}
        </p>
      ) : null}
    </section>
  );
};

const Content = () => {
  const active = useSelectedWallet("svm");
  const { connect } = useConnect();
  const { disconnect } = useWalletManager();
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
        <h1 className="text-3xl font-semibold tracking-tight">butr + @solana/kit</h1>
        <p className="text-foreground-muted mt-1 text-sm">
          Solana&apos;s next-generation modular SDK (formerly <code>@solana/web3.js</code> v2). butr
          discovers and manages the wallet; <code>@solana/kit</code> handles the RPC and
          transaction-message builder; the wallet&apos;s Wallet Standard features supply signing +
          submission.
        </p>
      </header>
      <Content />
    </main>
  </>
);

export { App };
