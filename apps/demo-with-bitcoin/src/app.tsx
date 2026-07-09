import { useActiveWallet, useConnectWallet, useDisconnectWallet } from "@usebutr/react";
import { networks } from "bitcoinjs-lib";
import { useMemo, useState } from "react";

import { useDiscoveredWallets } from "./wallet-provider";

// Map CAIP-2 chain references to their bitcoinjs-lib network config so
const NETWORK_BY_CHAIN_REF: Record<string, typeof networks.bitcoin> = {
  "000000000019d6689c085ae165831e93": networks.bitcoin,
  "000000000933ea01ad0ee984209779ba": networks.testnet,
  "0f9188f13cb7b2c71f2a335e3a4fc328": networks.regtest,
};

const formatError = (e: unknown): string => {
  if (e instanceof Error) {
    return e.message;
  }
  return String(e);
};

const bytesToHex = (bytes: Uint8Array): string => {
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
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
  const [signature, setSignature] = useState<string | null>(null);
  const [signedPsbt, setSignedPsbt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addr = useMemo(() => wallet.account.walletAddress, [wallet.account.walletAddress]);
  const chainId = useMemo(() => wallet.account.chain.id, [wallet.account.chain.id]);

  const bech32Prefix = useMemo(() => {
    const ref = chainId.split(":")[1] ?? "";
    return NETWORK_BY_CHAIN_REF[ref]?.bech32 ?? "unknown";
  }, [chainId]);

  const handleSign = async () => {
    setErrorMsg(null);
    try {
      const message = new TextEncoder().encode("Hello from butr + bitcoinjs-lib");
      const result = await wallet.connector.signMessage(message);
      setSignature(bytesToHex(result.signature));
    } catch (error) {
      setErrorMsg(formatError(error));
    }
  };

  const handleSignPsbt = async () => {
    setErrorMsg(null);
    try {
      // doesn't have signTransaction at all; the discriminant teaches
      const connector = wallet.connector;
      if (connector.chainPlatform !== "bitcoin" || !connector.signTransaction) {
        throw new Error(
          "This wallet does not advertise PSBT signing (bitcoin:signPsbt). Try Phantom, Magic Eden, or Leather.",
        );
      }
      // Hand-built minimal PSBT (empty global tx, no inputs/outputs) —
      // UTXOs. Bytes: PSBT magic `psbt\xff`, then a single unsigned tx
      // map terminator. Built via hex parsing to dodge oxfmt's
      const psbtHex = "70736274FF010A02000000000000000000";
      const psbt = new Uint8Array(psbtHex.length / 2);
      for (let i = 0; i < psbt.length; i += 1) {
        psbt[i] = Number.parseInt(psbtHex.slice(i * 2, i * 2 + 2), 16);
      }
      const signed = await connector.signTransaction(psbt);
      setSignedPsbt(bytesToHex(signed));
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
      <Row label="Chain">
        <code className="font-mono text-xs break-all">{chainId}</code>
      </Row>
      <Row label="Addr format">
        native SegWit prefix: <code className="font-mono text-xs">{bech32Prefix}1…</code>
      </Row>
      <Row label="Capabilities">
        <span className="font-mono text-xs">
          send={String(wallet.connector.capabilities.sendTransaction)} signMsg=
          {String(wallet.connector.capabilities.signMessage)} signPsbt=
          {String(wallet.connector.capabilities.signTransaction)}
        </span>
      </Row>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
          disabled={!wallet.connector.capabilities.signMessage}
          onClick={() => void handleSign()}
          type="button"
        >
          Sign &quot;Hello from butr + bitcoinjs-lib&quot;
        </button>
        <button
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
          disabled={!wallet.connector.capabilities.signTransaction}
          onClick={() => void handleSignPsbt()}
          type="button"
        >
          Sign empty PSBT round-trip
        </button>
      </div>
      {signature ? (
        <Row label="Signature">
          <code className="font-mono text-xs break-all">{signature}</code>
        </Row>
      ) : null}
      {signedPsbt ? (
        <Row label="Signed PSBT">
          <code className="font-mono text-xs break-all">{signedPsbt}</code>
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
            No Bitcoin wallets detected. Install Phantom, Magic Eden, Leather, Xverse, Unisat, or
            OKX Wallet and refresh.
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
      <h1 className="text-3xl font-semibold tracking-tight">butr + Bitcoin</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Bitcoin wallets through their two routes: <strong>Wallet Standard</strong> (Phantom, Magic
        Eden, Leather, OKX) plus an injected fallback covering <strong>sats-connect</strong>{" "}
        (Xverse) and the legacy <strong>window.unisat</strong> shape (Unisat, OKX legacy, generic{" "}
        <code>window.btc</code>).
      </p>
    </header>
    <Content />
  </main>
);

export { App };
