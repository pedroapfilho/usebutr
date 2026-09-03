import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import type { BundledTheme } from "shiki";
import { codeToHast } from "shiki";

/**
 * Single-theme Shiki render for the alt worlds: each world pins its own
 * scheme, unlike the incumbent `CodeBlock`, which tracks the OS scheme.
 */
const highlight = async (code: string, theme: BundledTheme, lang = "tsx") => {
  const hast = await codeToHast(code, { lang, theme });

  return <>{toJsxRuntime(hast, { Fragment, jsx, jsxs })}</>;
};

export { highlight };
