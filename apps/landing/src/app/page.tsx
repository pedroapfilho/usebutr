import {
  NetworkArbitrumOne,
  NetworkBase,
  NetworkBinanceSmartChain,
  NetworkBitcoin,
  NetworkEthereum,
  NetworkOptimism,
  NetworkPolkadot,
  NetworkPolygon,
  NetworkSolana,
  NetworkSui,
} from "@web3icons/react";

import { BrandLogo } from "@/components/brand-logo";
import { BrandMark } from "@/components/brand-mark";
import { ButtonLink } from "@/components/button-link";
import { CodeBlock } from "@/components/code-block";
import { InstallTabs } from "@/components/install-tabs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  CONCEPTS_URL,
  DEMO_URL,
  DOCS_URL,
  GITHUB_URL,
  INTEGRATIONS_URL,
  QUICKSTART_URL,
  WALLETS_VERSION,
} from "@/lib/site";

const CHIPS = [
  { label: "license", value: "MIT" },
  { label: "wallets", value: `v${WALLETS_VERSION}` },
  { label: "packages", value: "12" },
  { label: "react", value: "18+" },
];

const FEATURES = [
  {
    body: "Connect MetaMask and Phantom at the same time. One pool, each platform tracked on its own.",
    href: CONCEPTS_URL,
    title: "Multi-chain",
  },
  {
    body: "Injected, WalletConnect, Ledger, or your own: every wallet is a WalletAdapter on one seam.",
    href: CONCEPTS_URL,
    title: "Connector-shaped",
  },
  {
    body: "getSigner() hands back the wallet's own provider, tagged by kind. Bridge it into viem, wagmi, gill, or @solana/kit.",
    href: INTEGRATIONS_URL,
    title: "No lock-in",
  },
  {
    body: "Core has no React and no protocol code. Install only the chain packages you need.",
    href: `${DOCS_URL}/getting-started/installation`,
    title: "Modular",
  },
];

const CHAINS = [
  { Icon: NetworkEthereum, name: "Ethereum" },
  { Icon: NetworkSolana, name: "Solana" },
  { Icon: NetworkBitcoin, name: "Bitcoin" },
  { Icon: NetworkBase, name: "Base" },
  { Icon: NetworkArbitrumOne, name: "Arbitrum" },
  { Icon: NetworkOptimism, name: "Optimism" },
  { Icon: NetworkPolygon, name: "Polygon" },
  { Icon: NetworkBinanceSmartChain, name: "BNB Chain" },
  { Icon: NetworkSui, name: "Sui" },
  { Icon: NetworkPolkadot, name: "Polkadot" },
];

const OVERVIEW_CODE = `// 1. Import the provider and hooks.
import {
  WalletManagerProvider,
  useConnect,
  useDiscoveredWallets,
  useIsHydrated,
} from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";

// 2. Discover the browser's wallets; config is read once.
const config = { sources: [autoDiscovery()] };

export const App = () => (
  <WalletManagerProvider config={config}>
    <WalletPicker />
  </WalletManagerProvider>
);

// 3. Read the pool; UI stays yours.
const WalletPicker = () => {
  const wallets = useDiscoveredWallets();
  const { connect } = useConnect();
  const isHydrated = useIsHydrated();
  // Wait for persisted connections before showing the picker.
  if (!isHydrated) return null;

  return wallets.map(({ id, name }) => (
    <button key={id} onClick={() => connect(id)} type="button">
      Connect {name}
    </button>
  ));
};`;

const BRIDGE_CODE = `import {
  useSelectedWallet,
  useSigner,
} from "@usebutr/react";
import {
  createWalletClient,
  custom,
  getAddress,
} from "viem";
import { sepolia } from "viem/chains";

export const useSelectedWalletClient = () => {
  const wallet = useSelectedWallet("evm");
  const { data: signer } = useSigner(wallet);
  if (!wallet || signer?.kind !== "eip1193") return null;

  return createWalletClient({
    account: getAddress(wallet.account.walletAddress),
    chain: sepolia,
    transport: custom(signer.provider),
  });
};`;

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  codeRepository: GITHUB_URL,
  description: "Multi-chain wallet discovery and connection state for React.",
  license: `${GITHUB_URL}/blob/main/LICENSE`,
  name: "butr",
  programmingLanguage: "TypeScript",
  url: "https://www.usebutr.com",
};

const Page = () => (
  <div className="bg-background text-foreground min-h-dvh">
    <SiteHeader />

    <main>
      <script type="application/ld+json">{JSON.stringify(JSON_LD)}</script>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <BrandMark className="w-hero-glow pointer-events-none absolute top-1/2 -right-24 -translate-y-1/2 opacity-6 select-none max-lg:hidden" />
        <div className="lg:grid-cols-equal-pair relative mx-auto grid w-full max-w-6xl gap-12 px-6 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div>
            <h1>
              <BrandLogo className="h-16 sm:h-20" />
              <span className="sr-only">butr</span>
            </h1>
            <p className="text-muted-foreground max-w-measure-44 mt-7 text-xl text-pretty">
              Discover and connect <strong className="text-foreground font-semibold">EVM</strong>,{" "}
              <strong className="text-foreground font-semibold">Solana</strong>,{" "}
              <strong className="text-foreground font-semibold">Sui</strong>,{" "}
              <strong className="text-foreground font-semibold">Bitcoin</strong>, and{" "}
              <strong className="text-foreground font-semibold">Polkadot</strong> wallets from one
              React hook surface. Bring your own chain library.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href={QUICKSTART_URL} variant="primary">
                Get started
              </ButtonLink>
              <ButtonLink href="#why" variant="secondary">
                Why butr?
              </ButtonLink>
              <ButtonLink href={GITHUB_URL} variant="secondary">
                GitHub
              </ButtonLink>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5">
            <InstallTabs />
            <ul className="flex flex-wrap gap-1.5">
              {CHIPS.map(({ label, value }) => (
                <li
                  className="bg-card border-border inline-flex items-center overflow-hidden rounded-md border font-mono text-xs"
                  key={label}
                >
                  <span className="border-border text-muted-foreground border-r px-2.5 py-1.5">
                    {label}
                  </span>
                  <span className="text-foreground px-2 py-1.5 font-medium">{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto w-full max-w-6xl px-6">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ body, href, title }) => (
            <li className="bg-card border-border flex flex-col rounded-lg border p-6" key={title}>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-muted-foreground mt-2 grow text-pretty">{body}</p>
              <a
                className="text-foreground focus-visible:outline-ring mt-4 inline-flex items-center gap-1 self-start rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                href={href}
              >
                See more
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Overview */}
      <section className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 pt-24 sm:pt-32" id="why">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Overview</h2>
          <p className="text-muted-foreground max-w-measure-60 mt-4 text-lg text-pretty">
            Wrap the tree once, read the discovered pool through hooks, and keep the picker UI
            yours. butr handles discovery and connection state across reloads; it ships no modal and
            no RPC stack.
          </p>
          <div className="mt-8">
            <CodeBlock code={OVERVIEW_CODE} />
          </div>
        </div>
      </section>

      {/* Chains */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-24 sm:pt-32">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Supported chains</h2>
        <p className="text-muted-foreground max-w-measure-60 mt-4 text-lg text-pretty">
          One discovery seam across EVM networks, Solana, Sui, Bitcoin, and Polkadot: EIP-6963, the
          Wallet Standard, injected fallbacks, and injectedWeb3.
        </p>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {CHAINS.map(({ Icon, name }) => (
            <li
              className="bg-card border-border flex items-center gap-3 rounded-lg border px-4 py-4"
              key={name}
            >
              <Icon aria-hidden className="shrink-0" size={24} variant="branded" />
              <span className="text-sm font-medium">{name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Bridge */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pt-24 sm:pt-32 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Hand the signer to your library.
          </h2>
          <p className="text-muted-foreground max-w-measure-48 mt-4 text-lg text-pretty">
            <code className="bg-card border-border rounded-sm border px-1.5 py-0.5 font-mono text-base">
              getSigner()
            </code>{" "}
            hands back the wallet&apos;s own provider, tagged by kind. Wrap it with viem, wagmi,
            gill, or @solana/kit and keep the stack you already have.
          </p>
          <div className="mt-8">
            <ButtonLink href={INTEGRATIONS_URL} variant="secondary">
              Integration guides
            </ButtonLink>
          </div>
        </div>
        <CodeBlock code={BRIDGE_CODE} />
      </section>

      {/* Closing */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-32">
        <div className="bg-card border-border flex flex-col items-center gap-8 rounded-lg border px-6 py-14 text-center sm:py-20">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Get started in a few lines.
            </h2>
            <p className="text-muted-foreground max-w-measure-48 mx-auto mt-4 text-lg text-pretty">
              Install, quickstart, core concepts, and the full API reference are in the docs.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <ButtonLink href={QUICKSTART_URL} variant="primary">
              Read the docs
            </ButtonLink>
            <ButtonLink href={DEMO_URL} variant="secondary">
              Try the live demo
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
);

export default Page;
