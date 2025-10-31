type PrerenderStore = Record<string, unknown>;

const PRERENDER_KEY = '__PRERENDERED_DATA__';

export const readPrerenderData = <T = unknown>(key: string): T | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const store = (window as Window & { [PRERENDER_KEY]?: PrerenderStore })[PRERENDER_KEY];
  if (!store || !(key in store)) {
    return undefined;
  }

  return store[key] as T;
};
