import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import {
  DEMO_URL,
  DOCS_URL,
  GITHUB_URL,
  INSTALLATION_URL,
  NPM_URL,
  QUICKSTART_URL,
} from "@/lib/site";

type FooterLink = {
  href: string;
  label: string;
};

type FooterColumnProps = {
  links: Array<FooterLink>;
  title: string;
};

const RESOURCE_LINKS: Array<FooterLink> = [
  { href: DOCS_URL, label: "Docs" },
  { href: INSTALLATION_URL, label: "Installation" },
  { href: QUICKSTART_URL, label: "Quickstart" },
  { href: DEMO_URL, label: "Demo" },
];

const PROJECT_LINKS: Array<FooterLink> = [
  { href: GITHUB_URL, label: "GitHub" },
  { href: NPM_URL, label: "npm" },
];

// Resolved once at module load (server-side for this static page) so the year
// is a constant by render time, never a non-deterministic value reached from JSX.
const CURRENT_YEAR = new Date().getFullYear();

const FooterColumn = ({ links, title }: FooterColumnProps) => (
  <div>
    <h2 className="text-foreground text-sm font-medium">{title}</h2>
    <ul className="mt-4 space-y-3">
      {links.map((link) => (
        <li key={link.label}>
          <a
            className="text-muted-foreground hover:text-foreground focus-visible:outline-ring rounded-sm text-sm font-normal transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            href={link.href}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const SiteFooter = () => (
  <footer className="border-border border-t">
    <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
      <div className="col-span-2">
        <Link
          aria-label="Homepage"
          className="focus-visible:outline-ring inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
          href="/"
        >
          <BrandLogo />
        </Link>
        <p className="text-muted-foreground mt-4 max-w-[36ch] text-sm text-pretty">
          Multi-chain wallet discovery and connection state for React.
        </p>
      </div>

      <FooterColumn links={RESOURCE_LINKS} title="Resources" />
      <FooterColumn links={PROJECT_LINKS} title="Project" />
    </div>

    <div className="mx-auto w-full max-w-6xl px-6 pb-10">
      <p className="text-muted-foreground text-sm">© {CURRENT_YEAR} butr</p>
    </div>
  </footer>
);

export { SiteFooter };
