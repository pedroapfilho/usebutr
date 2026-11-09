const logWarn = (message: string, ...details: ReadonlyArray<unknown>): void => {
  console.warn(`[butr] ${message}`, ...details);
};

const logError = (message: string, ...details: ReadonlyArray<unknown>): void => {
  console.error(`[butr] ${message}`, ...details);
};

export { logError, logWarn };
