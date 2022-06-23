const SECOND_IN_MS = 1000;
const MINUTE_IN_MS = 60 * SECOND_IN_MS;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;

export const formatNumber = (num: number): string =>
  num.toLocaleString(undefined, { maximumFractionDigits: 2 });

// formatMs converts a number of milliseconds to a string of the form "XhXXmXXsXXms"
export const formatMs = (ms?: number): string => {
  if (!ms) {
    return "0s";
  }
  if (ms < SECOND_IN_MS) {
    return `${formatNumber(ms)}ms`;
  }
  if (ms < MINUTE_IN_MS) {
    return `${formatNumber(ms / SECOND_IN_MS)}s`;
  }
  if (ms < HOUR_IN_MS) {
    return `${Math.floor(ms / MINUTE_IN_MS)}m${formatMs(ms % MINUTE_IN_MS)}`;
  }
  if (ms < DAY_IN_MS) {
    return `${Math.floor(ms / HOUR_IN_MS)}h${formatMs(ms % HOUR_IN_MS)}`;
  }
  return `${Math.floor(ms / DAY_IN_MS)}d${formatMs(ms % DAY_IN_MS)}`;
};
