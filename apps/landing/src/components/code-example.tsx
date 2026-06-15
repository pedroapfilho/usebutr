import { ButtonLink } from "@/components/button-link";
import { CodeBlock } from "@/components/code-block";
import { QUICKSTART_URL } from "@/lib/site";

const EXAMPLE_CODE = `import {
  WalletManagerProvider,
  useDiscoveredWallets,
  useConnectWallet,
} from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";

const discovery = autoDiscovery();

export const App = () => (
  <WalletManagerProvider discovery={discovery} storageKeyPrefix="my-app">
    <Connect />
  </WalletManagerProvider>
);

const Connect = () => {
  const wallets = useDiscoveredWallets();
  const connect = useConnectWallet();

  return wallets.map((wallet) => (
    <button key={wallet.id} onClick={() => connect(wallet.id)}>
      Connect {wallet.name}
    </button>
  ));
};`;

const CodeExample = () => (
  <section className="border-border bg-muted/40 border-y">
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
      <div>
        <h2 className="max-w-[24ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Wire up your wallets in one provider.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-[56ch] text-lg text-pretty">
          Drop{" "}
          <code className="bg-card rounded-sm px-1.5 py-0.5 font-mono text-[0.9em]">
            autoDiscovery()
          </code>{" "}
          into the provider and read wallets from a hook. You get discovered wallets and connection
          state, without writing chain-specific UI or per-wallet branches.
        </p>
        <div className="mt-8">
          <ButtonLink href={QUICKSTART_URL} variant="secondary">
            Read the quickstart
          </ButtonLink>
        </div>
      </div>

      <CodeBlock code={EXAMPLE_CODE} />
    </div>
  </section>
);

export { CodeExample };
