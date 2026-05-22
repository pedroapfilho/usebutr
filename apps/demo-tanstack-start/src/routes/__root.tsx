import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { WalletProvider } from "../wallet-provider";

const RootDocument = ({ children }: { children: React.ReactNode }) => (
  // oxlint-disable-next-line no-head-element -- TanStack Start uses native <head>, not Next.js
  <html lang="en" style={{ colorScheme: "light" }}>
    {/* oxlint-disable-next-line no-head-element -- TanStack Start shell */}
    <head>
      <HeadContent />
    </head>
    <body>
      <WalletProvider>{children}</WalletProvider>
      <Scripts />
    </body>
  </html>
);

export const Route = createRootRoute({
  component: () => (
    <RootDocument>
      <Outlet />
    </RootDocument>
  ),
  head: () => ({
    links: [
      {
        href: appCss,
        rel: "stylesheet",
      },
    ],
    meta: [
      { charSet: "utf8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { title: "butr · TanStack Start" },
    ],
  }),
});
