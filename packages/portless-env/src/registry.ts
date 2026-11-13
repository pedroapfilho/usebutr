const apps = {
  "demo-vite": { name: "usebutr.demo-vite", port: 4173 },
  docs: { name: "usebutr.docs", port: 4000 },
  landing: { name: "usebutr.landing", port: 4001 },
} as const;

const urlEnv = {
  NEXT_PUBLIC_DEMO_URL: ["demo-vite"],
  NEXT_PUBLIC_DOCS_URL: ["docs"],
  VITE_DOCS_URL: ["docs"],
  VITE_WEB_URL: ["landing"],
} as const satisfies Record<string, ReadonlyArray<keyof typeof apps>>;

export { apps, urlEnv };
