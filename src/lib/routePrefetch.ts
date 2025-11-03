type Loader = () => Promise<unknown>;

const loaders = new Map<string, Loader>();
const prefetched = new Set<string>();

export const registerRoutePrefetch = (path: string, loader: Loader) => {
  loaders.set(path, loader);
};

export const prefetchRoute = async (path: string) => {
  const loader = loaders.get(path);
  if (!loader || prefetched.has(path)) {
    return;
  }

  try {
    prefetched.add(path);
    await loader();
  } catch (error) {
    // If the prefetch fails we remove it from the cache so it can try again later.
    prefetched.delete(path);
    if (import.meta.env.DEV) {
      console.warn(`Prefetch for route "${path}" failed`, error);
    }
  }
};
