import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { DEMO_URL, DOCS_URL, GITHUB_URL, WALLETS_VERSION } from "@/lib/site";

const NAV_LINKS = [
  { href: DOCS_URL, label: "Docs" },
  { href: DEMO_URL, label: "Demo" },
  { href: GITHUB_URL, label: "GitHub" },
];

const SiteHeader = () => (
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
);

export { SiteHeader };
