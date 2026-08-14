import { ButtonLink } from "@/components/button-link";
import { InstallCommand } from "@/components/install-command";
import { DEMO_URL, QUICKSTART_URL } from "@/lib/site";

const ADAPTERS = [
  { chain: "EVM", contract: "EIP-1193" },
  { chain: "Solana", contract: "Wallet Standard" },
  { chain: "Sui", contract: "Wallet Standard" },
  { chain: "Bitcoin", contract: "Provider API" },
  { chain: "Polkadot", contract: "Injected accounts" },
] as const;

const Hero = () => (
  <section className="wallet-network-hero border-border/60 relative overflow-hidden border-b">
    <div className="pt-20 pb-16 sm:pt-28 sm:pb-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="flex flex-col items-start gap-8">
          <div>
            <p className="text-muted-foreground font-mono text-sm tracking-wide uppercase">
              Multi-chain wallets for React
            </p>

            <h1 className="mt-5 max-w-[12ch] text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance sm:text-7xl">
              One hook surface for wallets on any chain.
            </h1>

            <p className="text-muted-foreground mt-6 max-w-[48ch] text-lg text-pretty sm:max-w-[40ch] sm:text-xl">
              butr discovers EVM, Solana, Sui, Bitcoin, and Polkadot wallets, manages their
              connection state across reloads, and hands you a raw signer. Bring your own chain
              library.
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

        <figure className="network-map border-border bg-card/55 relative border p-5 backdrop-blur sm:p-8">
          <figcaption className="text-muted-foreground flex items-center justify-between gap-4 font-mono text-xs">
            <span>connector graph</span>
            <span className="text-primary">one state layer</span>
          </figcaption>
          <div className="relative mt-8 grid gap-3 sm:grid-cols-2">
            <div className="border-primary bg-primary text-primary-foreground flex min-h-28 flex-col justify-between border p-4 sm:col-span-2 sm:mx-auto sm:w-56">
              <span className="font-mono text-xs">@usebutr/react</span>
              <strong className="text-lg">Wallet Manager</strong>
            </div>
            {ADAPTERS.map((adapter) => (
              <div
                className="border-border bg-background flex items-center justify-between gap-3 border p-4"
                key={adapter.chain}
              >
                <span className="font-medium">{adapter.chain}</span>
                <span className="text-muted-foreground font-mono text-xs">{adapter.contract}</span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground border-border mt-6 border-t pt-4 font-mono text-xs">
            discover → connect → persist → raw signer
          </p>
        </figure>
      </div>
    </div>
  </section>
);

export { Hero };
