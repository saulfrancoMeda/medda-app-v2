const enabled = process.env.EXPO_PUBLIC_ENABLE_LOGS === 'true';

export const logger = {
  warn: (...args: unknown[]): void => {
    if (enabled) console.warn(...args);
  },
  log: (...args: unknown[]): void => {
    if (enabled) console.log(...args);
  },
  error: (...args: unknown[]): void => {
    if (enabled) console.error(...args);
  },
};
