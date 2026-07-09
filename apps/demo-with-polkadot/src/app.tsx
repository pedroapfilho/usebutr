import { MultiAddress, paseo } from "@polkadot-api/descriptors";
import type { PolkadotSignerHandle } from "@usebutr/polkadot";
import { useActiveWallet, useConnectWallet, useDisconnectWallet } from "@usebutr/react";
import { createClient } from "polkadot-api";
import { connectInjectedExtension } from "polkadot-api/pjs-signer";
import { getWsProvider } from "polkadot-api/ws";
import { useEffect, useRef, useState } from "react";

import { useDiscoveredWallets } from "./wallet-provider";

// the transaction builder. The connected wallet's injected signer is
const PASEO_WS = "wss://paseo.rpc.amforc.com";
const PASEO_DECIMALS = 10;

const client = createClient(getWsProvider(PASEO_WS));
const api = client.getTypedApi(paseo);

const formatError = (e: unknown): string => {
  if (e instanceof Error) {
    return e.message;
  }
  return String(e);
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
  const [balance, setBalance] = useState<string>("…");
  const [signature, setSignature] = useState<string | null>(null);
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const txSubRef = useRef<{ unsubscribe: () => void } | null>(null);

  const addr = wallet.account.walletAddress;

  // so its callbacks don't update state after we're gone.
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
      // signedMessage is the <Bytes>-wrapped payload sent to the wallet's signRaw
      setSignedMessage(toHex(result.signedMessage));
    } catch (error) {
      setErrorMsg(formatError(error));
    }
  };

  const handleTransfer = async () => {
    setErrorMsg(null);
    setTxStatus("Bridging signer…");
    try {
      const handle = (await wallet.connector.getSigner()) as PolkadotSignerHandle;
      const extension = await connectInjectedExtension(handle.extensionName);
      const account = extension.getAccounts().find((a) => a.address === handle.address);
      if (!account) {
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
        complete: () => setTxStatus("Finalized"),
        error: (error: unknown) => {
          setTxStatus(null);
          setErrorMsg(formatError(error));
        },
        next: (event) => setTxStatus(`Tx: ${event.type}`),
      });
    } catch (error) {
      setTxStatus(null);
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
      <Row label="Network">Paseo testnet (via polkadot-api)</Row>
      <Row label="Balance">{balance}</Row>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
          onClick={() => void handleSign()}
          type="button"
        >
          Sign &quot;Hello from butr + Polkadot&quot;
        </button>
        <button
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
          onClick={() => void handleTransfer()}
          type="button"
        >
          Self-transfer 0.1 PAS
        </button>
      </div>
      {txStatus ? <Row label="Transfer">{txStatus}</Row> : null}
      {signature ? (
        <Row label="Signature">
          <code className="font-mono text-xs break-all">{signature}</code>
        </Row>
      ) : null}
      {signedMessage ? (
        <Row label="Signed payload">
          <span className="text-xs text-neutral-500">
            {"<Bytes>"}-wrapped hex sent to signRaw:{" "}
          </span>
          <code className="font-mono text-xs break-all">{signedMessage}</code>
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
  const active = useActiveWallet();
  const connect = useConnectWallet();
  const disconnect = useDisconnectWallet();
  const discovered = useDiscoveredWallets();

  if (!active) {
    return (
      <section className="space-y-3">
        <h2 className="font-semibold">Available wallets</h2>
        {discovered.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No Polkadot wallets detected. Install Polkadot&#123;.js&#125;, Talisman, or SubWallet
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
                  {wallet.icon ? <img alt="" className="size-6 rounded" src={wallet.icon} /> : null}
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
      <h1 className="text-3xl font-semibold tracking-tight">butr + polkadot-api</h1>
      <p className="mt-1 text-sm text-neutral-500">
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
