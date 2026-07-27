import { ButtonLink } from "@/components/button-link";
import { InstallCommand } from "@/components/install-command";
import { DEMO_URL, QUICKSTART_URL } from "@/lib/site";

const Hero = () => (
  <section className="relative overflow-hidden">
    {/* Soft amber wash behind the hero, weighted left to sit behind the headline. */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[28rem] bg-[radial-gradient(50%_60%_at_30%_0%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent)]"
    />

    <div className="pt-20 pb-16 sm:pt-28 sm:pb-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-6">
        <div>
          <p className="text-muted-foreground font-mono text-sm tracking-wide uppercase">
            Multi-chain wallets for React
          </p>

          <h1 className="mt-5 max-w-[30ch] text-5xl font-semibold tracking-tight text-balance sm:max-w-[20ch] sm:text-7xl">
            One hook surface for wallets on any chain.
          </h1>

          <p className="text-muted-foreground mt-6 max-w-[48ch] text-lg text-pretty sm:max-w-[40ch] sm:text-xl">
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
    </div>
  </section>
);

export { Hero };
