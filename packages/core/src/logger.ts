/* eslint-disable no-console -- central logging sink; the one sanctioned console use */
const logWarn = (...args: ReadonlyArray<unknown>): void => {
  console.warn(...args);
};

const logError = (...args: ReadonlyArray<unknown>): void => {
  console.error(...args);
};
/* eslint-enable no-console */

export { logError, logWarn };
