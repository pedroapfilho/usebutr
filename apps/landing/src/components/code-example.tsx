import { ButtonLink } from "@/components/button-link";
import { CodeBlock } from "@/components/code-block";
import { INTEGRATIONS_URL } from "@/lib/site";

const BRIDGE_CODE = `import { useConnectedWallets } from "@usebutr/react";
import type { Address, EIP1193Provider } from "viem";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";

const [wallet] = useConnectedWallets();

const signer = await wallet.connector.getSigner();

const client = createWalletClient({
  account: wallet.account.walletAddress as Address,
  chain: sepolia,
  transport: custom(signer as EIP1193Provider),
});`;

const CodeExample = () => (
  <section className="border-border bg-muted/40 border-y py-16 sm:py-24">
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-6 lg:grid-cols-2">
      <div>
        <h2 className="max-w-[35ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Hand the signer to your chain library.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-[48ch] text-lg text-pretty">
          <code className="bg-card rounded-sm px-1.5 py-0.5 font-mono">getSigner()</code> returns
          the wallet&apos;s raw provider. Wrap it with viem, wagmi, gill, or @solana/kit and keep
          the stack you already have.
        </p>
        <div className="mt-8">
          <ButtonLink href={INTEGRATIONS_URL} variant="secondary">
            Read the integration guides
          </ButtonLink>
        </div>
      </div>

      <CodeBlock code={BRIDGE_CODE} />
    </div>
  </section>
);

export { CodeExample };
