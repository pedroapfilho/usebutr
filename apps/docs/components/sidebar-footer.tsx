const LINKS = [
  { href: "https://www.usebutr.com", label: "usebutr.com" },
  { href: "https://github.com/pedroapfilho/usebutr", label: "GitHub" },
  { href: "https://www.npmjs.com/package/@usebutr/wallets", label: "npm" },
  { href: "https://github.com/pedroapfilho/usebutr/blob/main/LICENSE", label: "MIT" },
];

const SidebarFooter = () => (
  <nav aria-label="Project links" className="flex flex-wrap gap-x-3 gap-y-2 px-2 py-3 text-sm">
    {LINKS.map(({ href, label }) => (
      <a
        className="text-fd-muted-foreground hover:text-fd-foreground focus-visible:outline-fd-ring rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        href={href}
        key={label}
      >
        {label}
      </a>
    ))}
  </nav>
);

export { SidebarFooter };
