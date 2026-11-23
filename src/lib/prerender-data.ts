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

export const readPrerenderFetchedAt = (): number => {
  if (typeof document === 'undefined') return 0;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="content-fetched-at"]');
  const value = Number(meta?.content);
  return Number.isSafeInteger(value) && value > 0 && value <= Date.now() ? value : 0;
};
