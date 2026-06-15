import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { codeToHast } from "shiki";

type CodeBlockProps = {
  code: string;
  lang?: string;
};

/**
 * Server-rendered syntax highlighting via shiki. We convert shiki's HAST into
 * real React elements (instead of dangerouslySetInnerHTML) so the highlighted
 * markup is rendered as ordinary children. The panel is always dark: a
 * deliberate fixed surface that reads as intentional on the static page.
 */
const CodeBlock = async ({ code, lang = "tsx" }: CodeBlockProps) => {
  const hast = await codeToHast(code, { lang, theme: "dracula" });

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 font-mono text-sm shadow-lg [&_pre]:overflow-x-auto [&_pre]:p-5 [&_pre]:leading-relaxed">
      {toJsxRuntime(hast, { Fragment, jsx, jsxs })}
    </div>
  );
};

export { CodeBlock };
