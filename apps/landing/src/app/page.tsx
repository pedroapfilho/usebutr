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
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { BrandMark } from "@/components/brand-mark";
import { ButtonLink } from "@/components/button-link";
import { CodeBlock } from "@/components/code-block";
import { InstallTabs } from "@/components/install-tabs";
import { SiteFooter } from "@/components/site-footer";
import { DEMO_URL, DOCS_URL, GITHUB_URL, INTEGRATIONS_URL, QUICKSTART_URL } from "@/lib/site";

const DIRECTION_CONTRACT = `<!--
THESIS: The category standard played straight - an open-source TypeScript library landing at viem's craft level, every fact true, nothing invented; chosen over three authored alternatives on 2026-09-03.
OWN-WORLD: The incumbent butr system (Geist, butter-yellow primary, light only, 10px radius) executed at benchmark fidelity: wordmark-as-headline, bolded-keyword subline, install tabs card, fact chips, four feature cards, numbered overview code, ghosted butter mark watermark.
STORY: A React dev recognizes the viem/wagmi genre instantly, reads the chains in bold, picks their package manager, copies the install, reads the numbered overview, and goes to the docs.
FIRST VIEWPORT: Header (wordmark, Docs/Demo/GitHub, version chip); left: giant wordmark, subline, Get started / Why butr? / GitHub; right: install tabs card over fact chips (MIT, v1.1.2, 12 packages, React 18+); faint butter mark bleeding off the right edge.
FORM: Canon, competitor-benchmarked against viem; seed 4b42851a. No signature interaction by design - the genre's own affordances are the interaction.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

const WALLETS_VERSION = "1.1.2";

const CHIPS = [
  { label: "license", value: "MIT" },
  { label: "wallets", value: `v${WALLETS_VERSION}` },
  { label: "packages", value: "12" },
  { label: "react", value: "18+" },
];

const FEATURES = [
  {
    body: "Connect MetaMask and Phantom at the same time. One pool, each platform tracked on its own.",
    href: `${DOCS_URL}/core-concepts`,
    title: "Multi-chain",
  },
  {
    body: "Injected, WalletConnect, Ledger, or your own: every wallet is a WalletAdapter on one seam.",
    href: `${DOCS_URL}/core-concepts`,
    title: "Connector-shaped",
  },
  {
    body: "getSigner() returns the raw provider. Bridge it into viem, wagmi, gill, or @solana/kit.",
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
  useConnectWallet,
  useDiscoveredWallets,
} from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";

// 2. Discover the browser's wallets.
const discovery = autoDiscovery();

export const App = () => (
  <WalletManagerProvider discovery={discovery}>
    <WalletPicker />
  </WalletManagerProvider>
);

// 3. Read the pool; UI stays yours.
const WalletPicker = () => {
  const wallets = useDiscoveredWallets();
  const connect = useConnectWallet();

  return wallets.map(({ id, name }) => (
    <button key={id} onClick={() => connect(id)}>
      Connect {name}
    </button>
  ));
};`;

const BRIDGE_CODE = `import { useSelectedWallet, useSigner } from "@usebutr/react";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";

const wallet = useSelectedWallet("evm");
const signer = useSigner(wallet?.connector.id);

// signer.data is the raw EIP-1193 provider.
const client = createWalletClient({
  account: wallet.account.walletAddress,
  chain: sepolia,
  transport: custom(signer.data),
});`;

const NAV_LINKS = [
  { href: DOCS_URL, label: "Docs" },
  { href: DEMO_URL, label: "Demo" },
  { href: GITHUB_URL, label: "GitHub" },
];

const Page = () => (
  <div className="bg-background text-foreground min-h-dvh">
    {/* The direction contract must land in the served markup as a comment. */}
    {/* eslint-disable-next-line react/no-danger -- static build-time constant, no user input */}
    <div dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} hidden />

    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
        <Link
          aria-label="Homepage"
          className="focus-visible:outline-ring flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
          href="/"
        >
          <BrandLogo className="h-5" />
          <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 font-mono text-xs">
            v{WALLETS_VERSION}
          </span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              className="text-muted-foreground hover:text-foreground focus-visible:outline-ring rounded-md px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
              href={href}
              key={label}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>

    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <BrandMark className="pointer-events-none absolute top-1/2 -right-24 w-[min(46rem,70vw)] -translate-y-1/2 opacity-[0.06] select-none max-lg:hidden" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 pt-20 pb-16 lg:grid-cols-[1fr_1fr] lg:pt-28 lg:pb-24">
          <div>
            <h1>
              <BrandLogo className="h-16 sm:h-20" />
              <span className="sr-only">butr</span>
            </h1>
            <p className="text-muted-foreground mt-7 max-w-[44ch] text-xl text-pretty">
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
          <p className="text-muted-foreground mt-4 max-w-[60ch] text-lg text-pretty">
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
        <p className="text-muted-foreground mt-4 max-w-[60ch] text-lg text-pretty">
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
          <p className="text-muted-foreground mt-4 max-w-[48ch] text-lg text-pretty">
            <code className="bg-card border-border rounded-sm border px-1.5 py-0.5 font-mono text-base">
              getSigner()
            </code>{" "}
            returns the wallet&apos;s raw provider. Wrap it with viem, wagmi, gill, or @solana/kit
            and keep the stack you already have.
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
            <p className="text-muted-foreground mx-auto mt-4 max-w-[48ch] text-lg text-pretty">
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
