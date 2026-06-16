import { BrandLogo } from "./brand-logo";

const DOCS_URL = "https://docs.usebutr.com";
const GITHUB_URL = "https://github.com/pedroapfilho/usebutr";
const NPM_URL = "https://www.npmjs.com/org/usebutr";

// Resolved once at module load so the footer year is a constant by render time.
const CURRENT_YEAR = new Date().getFullYear();

const GitHubIcon = () => (
  <svg
    aria-hidden="true"
    className="size-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.34-1.72-1.34-1.72-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.3-5.47-5.79 0-1.28.47-2.33 1.23-3.15-.12-.3-.53-1.5.12-3.13 0 0 1-.32 3.3 1.2.96-.26 1.98-.39 3-.4 1.02.01 2.04.14 3 .4 2.28-1.52 3.29-1.2 3.29-1.2.65 1.63.24 2.83.12 3.13.77.82 1.23 1.87 1.23 3.15 0 4.5-2.81 5.48-5.49 5.77.43.36.81 1.08.81 2.18 0 1.58-.01 2.85-.01 3.24 0 .31.21.68.83.56A12.01 12.01 0 0 0 24 12.29C24 5.78 18.63.5 12 .5Z" />
  </svg>
);

const SiteHeader = () => (
  <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-6">
      <a
        aria-label="butr homepage"
        className="flex items-center gap-2 rounded-sm"
        href="https://usebutr.com"
      >
        <BrandLogo className="h-5" />
        <span className="bg-brand/15 text-brand-foreground rounded-full px-2 py-0.5 text-xs font-medium">
          Demo
        </span>
      </a>
      <nav aria-label="Primary" className="flex items-center gap-1">
        <a
          className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          href={DOCS_URL}
        >
          Docs
        </a>
        <a
          aria-label="butr on GitHub"
          className="relative inline-flex size-9 items-center justify-center rounded-md text-neutral-600 transition-colors hover:text-neutral-900"
          href={GITHUB_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          <GitHubIcon />
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden"
          />
        </a>
      </nav>
    </div>
  </header>
);

const FOOTER_LINKS = [
  { href: DOCS_URL, label: "Docs" },
  { href: GITHUB_URL, label: "GitHub" },
  { href: NPM_URL, label: "npm" },
];

const SiteFooter = () => (
  <footer className="mt-16 border-t border-neutral-200">
    <div className="mx-auto flex max-w-2xl flex-col gap-3 px-6 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
      <p>© {CURRENT_YEAR} butr</p>
      <ul className="flex items-center gap-5">
        {FOOTER_LINKS.map((link) => (
          <li key={link.label}>
            <a
              className="font-normal text-neutral-600 transition-colors hover:text-neutral-900"
              href={link.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </footer>
);

export { SiteHeader, SiteFooter };
