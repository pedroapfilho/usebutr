import { Chains } from "@/components/chains";
import { CodeExample } from "@/components/code-example";
import { DocsCta } from "@/components/docs-cta";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const Page = () => (
  <>
    <SiteHeader />
    <main>
      <Hero />
      <Chains />
      <Features />
      <CodeExample />
      <DocsCta />
    </main>
    <SiteFooter />
  </>
);

export default Page;
