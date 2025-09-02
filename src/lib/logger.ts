// Lightweight logger that only prints debug logs when debug mode is enabled.
// Debug mode is enabled if any of the following are true:
// - VITE_DEBUG env var is set to '1' or 'true'
// - URL has ?debug
// - localStorage has key 'debug' with value '1' or 'true'

const getIsDebug = (): boolean => {
  try {
    // Vite env flag
    const envFlag = (import.meta as any)?.env?.VITE_DEBUG;
    if (envFlag === '1' || envFlag === 'true') return true;

    // URL flag
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('debug')) return true;

      // localStorage flag for quick toggling
      const ls = window.localStorage?.getItem('debug');
      if (ls === '1' || ls === 'true') return true;
    }
  } catch {
    // ignore
  }
  return false;
};

export const isDebug = getIsDebug();

export const logger = {
  debug: (...args: any[]) => {
    if (isDebug) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  info: (...args: any[]) => {
    // Keep info silent by default too; switch to console.info if preferred
    if (isDebug) {
      // eslint-disable-next-line no-console
      console.info(...args);
    }
  },
  warn: (...args: any[]) => {
    // eslint-disable-next-line no-console
    console.warn(...args);
  },
  error: (...args: any[]) => {
    // eslint-disable-next-line no-console
    console.error(...args);
  },
};

export default logger;
