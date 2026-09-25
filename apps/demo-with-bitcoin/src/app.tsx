import type { ConnectedWallet } from "@usebutr/core";
import { bytesToHex, hexToBytes } from "@usebutr/core";
import { useConnect, useSelectedWallet, useWalletManager } from "@usebutr/react";
import { networks } from "bitcoinjs-lib";
import { useMemo, useState } from "react";

import { useDiscoveredWallets } from "./wallet-provider";

const NETWORK_BY_CHAIN_REF = new Map<string, typeof networks.bitcoin>([
  ["000000000019d6689c085ae165831e93", networks.bitcoin],
  ["000000000933ea01ad0ee984209779ba", networks.testnet],
  ["0f9188f13cb7b2c71f2a335e3a4fc328", networks.regtest],
]);

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
  wallet: ConnectedWallet<"bitcoin">;
}) => {
  const [signature, setSignature] = useState<string | null>(null);
  const [signedPsbt, setSignedPsbt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addr = useMemo(() => wallet.account.walletAddress, [wallet.account.walletAddress]);
  const chainId = useMemo(() => wallet.account.chain.id, [wallet.account.chain.id]);

  const bech32Prefix = useMemo(() => {
    const ref = chainId.split(":")[1] ?? "";
    return NETWORK_BY_CHAIN_REF.get(ref)?.bech32 ?? "unknown";
  }, [chainId]);

  const handleSign = async () => {
    setErrorMsg(null);
    try {
      if (!wallet.connector.signMessage) {
        throw new Error(`${wallet.connector.name} does not support message signing`);
      }
      const message = new TextEncoder().encode("Hello from butr + bitcoinjs-lib");
      const result = await wallet.connector.signMessage(message, { account: wallet.account });
      setSignature(bytesToHex(result.signature));
    } catch (error) {
      setErrorMsg(formatError(error instanceof Error ? error : String(error)));
    }
  };

  const handleSignPsbt = async () => {
    setErrorMsg(null);
    try {
      if (!wallet.connector.signTransaction) {
        throw new Error(
          "This wallet does not advertise PSBT signing (bitcoin:signPsbt). Try Phantom, Magic Eden, or Leather.",
        );
      }
      const psbt = hexToBytes("70736274FF010A02000000000000000000");
      const signed = await wallet.connector.signTransaction(psbt, { account: wallet.account });
      setSignedPsbt(bytesToHex(signed));
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
      <Row label="Chain">
        <code className="font-mono text-xs break-all">{chainId}</code>
      </Row>
      <Row label="Addr format">
        native SegWit prefix: <code className="font-mono text-xs">{bech32Prefix}1…</code>
      </Row>
      <Row label="Capabilities">
        <span className="font-mono text-xs">
          send={String(wallet.connector.sendTx !== undefined)} signMsg=
          {String(wallet.connector.signMessage !== undefined)} signPsbt=
          {String(wallet.connector.signTransaction !== undefined)}
        </span>
      </Row>
      <div className="flex flex-wrap gap-2">
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={!wallet.connector.signMessage}
          onClick={() => {
            void handleSign();
          }}
          type="button"
        >
          Sign &quot;Hello from butr + bitcoinjs-lib&quot;
        </button>
        <button
          className="border-border-strong hover:bg-surface-subtle rounded-md border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={!wallet.connector.signTransaction}
          onClick={() => {
            void handleSignPsbt();
          }}
          type="button"
        >
          Sign empty PSBT round-trip
        </button>
      </div>
      {signature !== null && signature !== "" ? (
        <Row label="Signature">
          <code className="font-mono text-xs break-all">{signature}</code>
        </Row>
      ) : null}
      {signedPsbt !== null && signedPsbt !== "" ? (
        <Row label="Signed PSBT">
          <code className="font-mono text-xs break-all">{signedPsbt}</code>
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
  const wallet = useSelectedWallet("bitcoin");
  const { connect } = useConnect();
  const { disconnect } = useWalletManager();
  const discovered = useDiscoveredWallets();

  if (!wallet) {
    return (
      <section className="space-y-3">
        <h2 className="font-semibold">Available wallets</h2>
        {discovered.length === 0 ? (
          <p className="text-foreground-muted text-sm">
            No Bitcoin wallets detected. Install Phantom, Magic Eden, Leather, Xverse, Unisat, or
            OKX Wallet and refresh.
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
      <h1 className="text-3xl font-semibold tracking-tight">butr + Bitcoin</h1>
      <p className="text-foreground-muted mt-1 text-sm">
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
