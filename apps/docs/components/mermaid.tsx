"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

const render = async (node: HTMLPreElement, chart: string, dark: boolean) => {
  const { default: mermaid } = await import("mermaid");
  node.textContent = chart;
  delete node.dataset.processed;
  mermaid.initialize({
    fontFamily: "inherit",
    startOnLoad: false,
    theme: dark ? "dark" : "default",
  });
  await mermaid.run({ nodes: [node] });
};

const Mermaid = ({ chart }: { chart: string }) => {
  const container = useRef<HTMLPreElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (container.current) {
      void render(container.current, chart, resolvedTheme === "dark");
    }
  }, [chart, resolvedTheme]);

  return (
    <pre className="my-6 flex justify-center bg-transparent" ref={container}>
      {chart}
    </pre>
  );
};

export { Mermaid };
