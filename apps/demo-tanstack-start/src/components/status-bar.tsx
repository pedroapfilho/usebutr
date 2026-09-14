const StatusBar = ({ status }: { status: string }) => (
  <div className="text-foreground-subtle flex items-center gap-2 text-sm">
    <span className="font-medium">Status:</span>
    <output
      aria-live="polite"
      className="bg-surface-muted rounded-full px-2 py-0.5 font-mono text-xs"
    >
      {status}
    </output>
  </div>
);

export { StatusBar };
