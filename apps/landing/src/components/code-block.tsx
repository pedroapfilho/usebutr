import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { codeToHast } from "shiki";

import { cn } from "@/lib/cn";

type CodeBlockProps = {
  className?: string;
  code: string;
  lang?: string;
};

/** Server-rendered Shiki panel: one border, no shadow, light and dark themes. */
const CodeBlock = async ({ className, code, lang = "tsx" }: CodeBlockProps) => {
  const hast = await codeToHast(code, {
    defaultColor: false,
    lang,
    themes: { dark: "github-dark", light: "github-light" },
  });

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
