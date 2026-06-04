import { useActiveWallet, useConnectWallet, useDisconnectWallet } from "@usebutr/react";
import { useState } from "react";

import { useDiscoveredWallets } from "./wallet-provider";

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
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addr = wallet.account.walletAddress;

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
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
          onClick={() => void handleSign()}
          type="button"
        >
          Sign &quot;Hello from butr + Polkadot&quot;
        </button>
      </div>
      {signature ? (
        <Row label="Signature">
          <code className="font-mono text-xs break-all">{signature}</code>
        </Row>
      ) : null}
      {signedMessage ? (
        <Row label="Signed payload">
          <span className="text-xs text-neutral-500">
            {'<Bytes>'}-wrapped hex sent to signRaw:{" "}
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
      <h1 className="text-3xl font-semibold tracking-tight">butr + Polkadot</h1>
      <p className="mt-1 text-sm text-neutral-500">
        butr discovers and manages the wallet via injectedWeb3 (Polkadot&#123;.js&#125;, Talisman,
        SubWallet). Message signing uses the injected signer&apos;s signRaw.
      </p>
    </header>
    <Content />
  </main>
);

export { App };
