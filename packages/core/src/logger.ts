const logWarn = (...args: ReadonlyArray<unknown>): void => {
  console.warn(...args);
};

const logError = (...args: ReadonlyArray<unknown>): void => {
  console.error(...args);
};

export { logError, logWarn };
