/**
 * Simple logger utility that can be disabled in production
 * Only logs in development mode or when explicitly enabled
 */

const isDevelopment = import.meta.env.DEV;
const ENABLE_LOGS = isDevelopment || import.meta.env.VITE_ENABLE_LOGS === 'true';

export const logger = {
  log: (...args: unknown[]) => {
    if (ENABLE_LOGS) console.log(...args);
  },

  warn: (...args: unknown[]) => {
    if (ENABLE_LOGS) console.warn(...args);
  },

  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args);
  },

  info: (...args: unknown[]) => {
    if (ENABLE_LOGS) console.info(...args);
  },

  debug: (...args: unknown[]) => {
    if (ENABLE_LOGS) console.debug(...args);
  },
};
