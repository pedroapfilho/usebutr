import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import type { BundledTheme } from "shiki";
import { codeToHast } from "shiki";

import { cn } from "@/lib/cn";

type CodeBlockProps = {
  className?: string;
  code: string;
  lang?: string;
  theme?: BundledTheme;
};

/** Server-rendered Shiki panel: one light theme, one border, no shadow. */
const CodeBlock = async ({
  className,
  code,
  lang = "tsx",
  theme = "github-light",
}: CodeBlockProps) => {
  const hast = await codeToHast(code, { lang, theme });

  return (
    <div
      className={cn(
        "border-border overflow-hidden rounded-lg border font-mono text-sm [&_pre]:overflow-x-auto [&_pre]:p-5 [&_pre]:leading-6",
        className,
      )}
    >
      {toJsxRuntime(hast, { Fragment, jsx, jsxs })}
    </div>
  );
};

export { CodeBlock };
