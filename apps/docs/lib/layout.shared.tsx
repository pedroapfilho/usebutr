import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

const GITHUB_URL = "https://github.com/pedroapfilho/usebutr";
const DEMO_URL = process.env.NEXT_PUBLIC_DEMO_URL ?? "https://demo.usebutr.com";

export const baseOptions = (): BaseLayoutProps => ({
  githubUrl: GITHUB_URL,
  links: [
    { external: true, text: "usebutr.com", url: "https://www.usebutr.com" },
    { external: true, text: "Demo", url: DEMO_URL },
  ],
  nav: {
    title: (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG logo; next/image does not optimize SVGs */}
        <img
          alt="butr"
          className="block h-5 w-auto dark:hidden"
          height={20}
          src="/butr-logo-light.svg"
          width={80}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG logo; next/image does not optimize SVGs */}
        <img
          alt="butr"
          className="hidden h-5 w-auto dark:block"
          height={20}
          src="/butr-logo-dark.svg"
          width={80}
        />
      </>
    ),
    transparentMode: "top",
  },
});
