import { MultiAddress, paseo } from "@polkadot-api/descriptors";
import { isPolkadotSignerHandle } from "@usebutr/polkadot";
import { useActiveWallet, useConnectWallet, useDisconnectWallet } from "@usebutr/react";
import { createClient } from "polkadot-api";
import { connectInjectedExtension } from "polkadot-api/pjs-signer";
import { getWsProvider } from "polkadot-api/ws";
import { useEffect, useRef, useState } from "react";

import { useDiscoveredWallets } from "./wallet-provider";

const PASEO_WS = "wss://paseo.rpc.amforc.com";
const PASEO_DECIMALS = 10;

const client = createClient(getWsProvider(PASEO_WS));
const api = client.getTypedApi(paseo);

const formatError = (error: Error | string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return error;
};

const toHex = (bytes: Uint8Array): string => {
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
};

const formatPas = (planck: bigint): string => {
  const base = 10n ** BigInt(PASEO_DECIMALS);
  const whole = planck / base;
  const frac = (planck % base).toString().padStart(PASEO_DECIMALS, "0").replace(/0+$/v, "");
  return frac ? `${whole}.${frac} PAS` : `${whole} PAS`;
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
  const [balance, setBalance] = useState<string>("…");
  const [signature, setSignature] = useState<string | null>(null);
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const txSubRef = useRef<{ unsubscribe: () => void } | null>(null);

  const addr = wallet.account.walletAddress;

  useEffect(() => () => txSubRef.current?.unsubscribe(), []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const account = await api.query.System.Account.getValue(addr);
        if (!cancelled) {
          setBalance(formatPas(account.data.free));
        }
      } catch (error) {
        if (!cancelled) {
          setBalance("error");
        }
        console.warn("balance read failed:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [addr]);

  const handleSign = async () => {
    setErrorMsg(null);
    try {
      const result = await wallet.connector.signMessage(
        new TextEncoder().encode("Hello from butr + Polkadot"),
      );
      setSignature(toHex(result.signature));
      setSignedMessage(toHex(result.signedMessage));
    } catch (error) {
      setErrorMsg(formatError(error instanceof Error ? error : String(error)));
    }
  };

  const handleTransfer = async () => {
    setErrorMsg(null);
    setTxStatus("Bridging signer…");
    try {
      const handle = await wallet.connector.getSigner();
      if (!isPolkadotSignerHandle(handle)) {
        throw new Error("This demo requires an injected Polkadot signer");
      }
      const extension = await connectInjectedExtension(handle.extensionName);
      const account = extension.getAccounts().find((a) => a.address === handle.address);
      if (account === undefined) {
        setTxStatus(null);
        setErrorMsg("Active account not found in the injected extension");
        return;
      }
      setTxStatus("Awaiting signature…");
      const tx = api.tx.Balances.transfer_keep_alive({
        // oxlint-disable-next-line new-cap -- MultiAddress.Id is a polkadot-api enum-variant constructor
        dest: MultiAddress.Id(handle.address),
        value: 1_000_000_000n,
      });
      txSubRef.current?.unsubscribe();
      txSubRef.current = tx.signSubmitAndWatch(account.polkadotSigner).subscribe({
        complete: () => {
          setTxStatus("Finalized");
        },
        error: (error) => {
          setTxStatus(null);
          setErrorMsg(formatError(error instanceof Error ? error : String(error)));
        },
        next: (event) => {
          setTxStatus(`Tx: ${event.type}`);
        },
      });
    } catch (error) {
      setTxStatus(null);
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
      <Row label="Network">Paseo testnet (via polkadot-api)</Row>
      <Row label="Balance">{balance}</Row>
      <div className="flex flex-wrap gap-2">
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm"
          onClick={() => {
            void handleSign();
          }}
          type="button"
        >
          Sign &quot;Hello from butr + Polkadot&quot;
        </button>
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm"
          onClick={() => {
            void handleTransfer();
          }}
          type="button"
        >
          Self-transfer 0.1 PAS
        </button>
      </div>
      {txStatus !== null && txStatus !== "" ? <Row label="Transfer">{txStatus}</Row> : null}
      {signature !== null && signature !== "" ? (
        <Row label="Signature">
          <code className="font-mono text-xs break-all">{signature}</code>
        </Row>
      ) : null}
      {signedMessage !== null && signedMessage !== "" ? (
        <Row label="Signed payload">
          <span className="text-foreground-muted text-xs">
            {"<Bytes>"}-wrapped hex sent to signRaw:{" "}
          </span>
          <code className="font-mono text-xs break-all">{signedMessage}</code>
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
            No Polkadot wallets detected. Install Polkadot&#123;.js&#125;, Talisman, or SubWallet
            and refresh.
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
                    <img alt="" className="size-6 rounded" src={wallet.icon} />
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
  <main className="text-foreground-primary mx-auto max-w-2xl px-6 py-10 font-sans">
    <header className="mb-8">
      <h1 className="text-3xl font-semibold tracking-tight">butr + polkadot-api</h1>
      <p className="text-foreground-muted mt-1 text-sm">
        butr discovers and manages the wallet via injectedWeb3 (Polkadot&#123;.js&#125;, Talisman,
        SubWallet); polkadot-api handles the RPC, balance read, and the Paseo transfer. Message
        signing uses the injected signer&apos;s signRaw; the transaction is signed through
        PAPI&apos;s pjs-signer bridge.
      </p>
    </header>
    <Content />
  </main>
);

export { App };
