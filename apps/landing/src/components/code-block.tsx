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

/** Server-rendered Shiki panel. The landing is light-only, so one theme. */
const CodeBlock = async ({
  className,
  code,
  lang = "tsx",
  theme = "vitesse-light",
}: CodeBlockProps) => {
  const hast = await codeToHast(code, { lang, theme });

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg font-mono text-sm shadow-lg ring-1 ring-black/5 [&_pre]:overflow-x-auto [&_pre]:p-5 [&_pre]:leading-6",
        className,
      )}
    >
      {toJsxRuntime(hast, { Fragment, jsx, jsxs })}
    </div>
  );
};

export { CodeBlock };
