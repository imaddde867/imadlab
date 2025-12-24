import { useQuery } from '@tanstack/react-query';
import { parseGithubRepo, type GithubRepoInfo } from '@/lib/github';

type CachedEntry = {
  expiresAt: number;
  data: GithubRepoInfo;
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h

const getCacheKey = (fullName: string) => `github_repo:${fullName.toLowerCase()}`;

const readCache = (key: string): GithubRepoInfo | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedEntry;
    if (!parsed?.data || typeof parsed.expiresAt !== 'number') return null;
    if (Date.now() > parsed.expiresAt) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const writeCache = (key: string, data: GithubRepoInfo) => {
  if (typeof window === 'undefined') return;
  try {
    const payload: CachedEntry = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
};

const readStaleCache = (key: string): GithubRepoInfo | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedEntry;
    if (!parsed?.data) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

export const useGithubRepoInfo = (repoUrl?: string | null) => {
  const repo = parseGithubRepo(repoUrl);
  const fullName = repo ? `${repo.owner}/${repo.repo}` : null;

  return useQuery({
    queryKey: ['github-repo', fullName],
    enabled: Boolean(fullName),
    staleTime: CACHE_TTL_MS,
    gcTime: CACHE_TTL_MS * 2,
    retry: false,
    queryFn: async () => {
      if (!fullName) return null;
      const cacheKey = getCacheKey(fullName);

      const cached = readCache(cacheKey);
      if (cached) return cached;

      try {
        const res = await fetch(`https://api.github.com/repos/${fullName}`, {
          headers: {
            Accept: 'application/vnd.github+json',
          },
        });

        if (!res.ok) {
          return readStaleCache(cacheKey);
        }

        const json = (await res.json()) as GithubRepoInfo;
        if (!json?.full_name) return readStaleCache(cacheKey);

        writeCache(cacheKey, json);
        return json;
      } catch {
        return readStaleCache(cacheKey);
      }
    },
  });
};

