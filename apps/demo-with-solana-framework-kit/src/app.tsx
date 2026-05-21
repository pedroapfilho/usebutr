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
// System program (also doubles as a safe burn destination on devnet).
const BURN_ADDRESS = address("11111111111111111111111111111111");

// Transaction building rides on @solana/kit (the substrate framework-kit is
// built on); the wallet — managed by butr — signs and submits.
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

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const bytesToBase58 = (bytes: Uint8Array): string => {
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

const base64ToBytes = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.codePointAt(i) ?? 0;
  }
  return bytes;
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
  const [signature, setSignature] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addr: Address = useMemo(
    () => address(wallet.account.walletAddress),
    [wallet.account.walletAddress],
  );

  // framework-kit reactive read: auto-fetches and watches the balance for
  // butr's connected address — no manual refetch wiring.
  const { error: balanceError, fetching, lamports } = useBalance(wallet.account.walletAddress);
  const balance = useMemo(() => {
    if (lamports !== null) {
      return `${Number(lamports) / 1_000_000_000} SOL`;
    }
    if (balanceError) {
      return "error";
    }
    return fetching ? "…" : "—";
  }, [lamports, fetching, balanceError]);

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
      const account = walletStd.accounts[0];
      if (!account) {
        throw new Error("No exposed account");
      }
      const message = new TextEncoder().encode("Hello from butr + framework-kit");
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
      const [output] = await feature.signAndSendTransaction({
        account,
        chain: "solana:devnet",
        transaction: bytes,
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
      <Row label="Network">Solana Devnet (framework-kit useBalance)</Row>
      <Row label="Balance">{balance}</Row>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
          disabled={!walletStd}
          onClick={() => void handleSign()}
          type="button"
        >
          Sign &quot;Hello from butr + framework-kit&quot;
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
        <h1 className="text-3xl font-semibold tracking-tight">butr + framework-kit</h1>
        <p className="mt-1 text-sm text-neutral-500">
          The recommended modern Solana stack. butr discovers and manages the wallet; Solana
          Foundation&apos;s framework-kit (<code>@solana/client</code> +{" "}
          <code>@solana/react-hooks</code>) is the reactive RPC/data layer — <code>useBalance</code>{" "}
          auto-fetches and watches; the wallet&apos;s Wallet Standard features supply signing +
          submission.
        </p>
      </header>
      <Content />
    </main>
  </>
);

export { App };
