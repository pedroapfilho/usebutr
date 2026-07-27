import { ButtonLink } from "@/components/button-link";
import { DOCS_URL, GITHUB_URL } from "@/lib/site";

const DocsCta = () => (
  <section className="py-20 sm:py-28">
    <div className="mx-auto w-full max-w-6xl px-6">
      <div className="border-border bg-card flex flex-col items-center gap-9 rounded-lg border px-6 py-14 text-center sm:py-20">
        <div>
          <h2 className="mx-auto max-w-[40ch] text-3xl font-semibold tracking-tight text-balance sm:max-w-[30ch] sm:text-5xl">
            Ready to wire up wallets?
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-[48ch] text-lg text-pretty">
            Install, quickstart, core concepts, and the full API reference are all in the docs.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {/* Soft, not filled: the hero owns the page's only primary button. */}
          <ButtonLink href={DOCS_URL} variant="soft">
            Read the docs
          </ButtonLink>
          <ButtonLink href={GITHUB_URL} variant="secondary">
            View on GitHub
          </ButtonLink>
        </div>
      </div>
    </div>
  </section>
);

export { DocsCta };
