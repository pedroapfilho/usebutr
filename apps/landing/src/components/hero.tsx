import { ButtonLink } from "@/components/button-link";
import { CodeBlock } from "@/components/code-block";
import { InstallCommand } from "@/components/install-command";
import { DEMO_URL, QUICKSTART_URL } from "@/lib/site";

const QUICKSTART_CODE = `import {
  WalletManagerProvider,
  useConnectWallet,
  useDiscoveredWallets,
} from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";

const discovery = autoDiscovery();

export const App = () => (
  <WalletManagerProvider discovery={discovery}>
    <WalletPicker />
  </WalletManagerProvider>
);

const WalletPicker = () => {
  const wallets = useDiscoveredWallets();
  const connect = useConnectWallet();

  return wallets.map(({ id, name }) => (
    <button key={id} onClick={() => connect(id)}>
      Connect {name}
    </button>
  ));
};`;

const Hero = () => (
  <section className="border-border border-b pt-20 pb-16 sm:pt-28 sm:pb-24">
    <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-6 lg:grid-cols-2">
      <div className="flex flex-col items-start gap-8">
        <div>
          <p className="text-muted-foreground font-mono text-sm tracking-wide uppercase">
            Multi-chain wallets for React
          </p>

          <h1 className="mt-5 max-w-[24ch] text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
            One hook surface for wallets on any chain.
          </h1>

          <p className="text-muted-foreground mt-6 max-w-[48ch] text-lg text-pretty">
            butr discovers EVM, Solana, Sui, Bitcoin, and Polkadot wallets, manages their connection
            state across reloads, and hands you a raw signer. Bring your own chain library.
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <ButtonLink href={QUICKSTART_URL} variant="primary">
            Read the docs
          </ButtonLink>
          <ButtonLink href={DEMO_URL} variant="secondary">
            Try the live demo
          </ButtonLink>
        </div>

        <InstallCommand />
      </div>

      <CodeBlock code={QUICKSTART_CODE} />
    </div>
  </section>
);

export { Hero };
