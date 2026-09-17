import type { Metadata } from "next";

import { ButtonLink } from "@/components/button-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const metadata: Metadata = {
  title: "Page not found",
};

const NotFound = () => (
  <div className="bg-background text-foreground flex min-h-dvh flex-col">
    <SiteHeader />
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Page not found</h1>
      <p className="text-muted-foreground max-w-measure-60 mt-4 text-lg text-pretty">
        There is no page at this address.
      </p>
      <ButtonLink className="mt-8" href="/" variant="primary">
        Back to the homepage
      </ButtonLink>
    </main>
    <SiteFooter />
  </div>
);

export { metadata };
export default NotFound;
