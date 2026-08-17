import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { codeToHast } from "shiki";

type CodeBlockProps = {
  code: string;
  lang?: string;
};

/**
 * `defaultColor: false` makes shiki emit both palettes as CSS variables, which
 * globals.css resolves against `prefers-color-scheme` so the panel tracks the
 * page rather than pinning dark.
 */
const CodeBlock = async ({ code, lang = "tsx" }: CodeBlockProps) => {
  const hast = await codeToHast(code, {
    defaultColor: false,
    lang,
    themes: { dark: "vitesse-dark", light: "vitesse-light" },
  });

  return (
    <div className="overflow-hidden rounded-lg font-mono text-sm shadow-lg ring-1 ring-black/5 dark:shadow-none dark:ring-white/10 [&_pre]:overflow-x-auto [&_pre]:p-5 [&_pre]:leading-6">
      {toJsxRuntime(hast, { Fragment, jsx, jsxs })}
    </div>
  );
};

export { CodeBlock };
