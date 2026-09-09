import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

import { SidebarFooter } from "@/components/sidebar-footer";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

const Layout = ({ children }: { children: ReactNode }) => (
  <DocsLayout {...baseOptions()} sidebar={{ footer: <SidebarFooter /> }} tree={source.pageTree}>
    {children}
  </DocsLayout>
);

export default Layout;
