import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

const GITHUB_URL = "https://github.com/pedroapfilho/usebutr";
const DEMO_URL = process.env.NEXT_PUBLIC_DEMO_URL ?? "https://demo.usebutr.com";

export const baseOptions = (): BaseLayoutProps => ({
  githubUrl: GITHUB_URL,
  links: [{ external: true, text: "Demo", url: DEMO_URL }],
  nav: {
    title: (
      <picture>
        <source media="(prefers-color-scheme: dark)" srcSet="/butr-logo-dark.svg" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="butr" className="h-5 w-auto" height={20} src="/butr-logo-light.svg" width={80} />
      </picture>
    ),
    transparentMode: "top",
  },
});
