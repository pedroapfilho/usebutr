const StatusBar = ({ status }: { status: string }) => (
  <div className="flex items-center gap-2 text-sm text-neutral-600">
    <span className="font-medium">Status:</span>
    <output
      aria-live="polite"
      className="rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-xs"
    >
      {status}
    </output>
  </div>
);

export { StatusBar };
