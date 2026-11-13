const logWarn = (message: string, ...details: ReadonlyArray<unknown>): void => {
  console.warn(`[butr] ${message}`, ...details);
};

export { logWarn };
