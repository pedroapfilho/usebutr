import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

import { Mermaid } from "@/components/mermaid";

const pre = (props: ComponentProps<"pre">) => (
  <CodeBlock {...props} viewportProps={{ className: "max-h-none" }}>
    <Pre>{props.children}</Pre>
  </CodeBlock>
);

const table = (props: ComponentProps<"table">) => (
  <div className="prose-no-margin fd-scroll-container relative my-6 overflow-auto">
    <table {...props} />
  </div>
);

export const getMDXComponents = (components?: MDXComponents): MDXComponents => ({
  ...defaultMdxComponents,
  Mermaid,
  pre,
  table,
  ...components,
});
