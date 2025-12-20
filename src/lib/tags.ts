export const normalizeTag = (tag: string): string => tag.trim();
export const tagSlug = (tag: string): string =>
  normalizeTag(tag)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
export const tagToUrl = (tag: string): string => `/tags/${encodeURIComponent(tagSlug(tag))}`;
export const tagMatchesSlug = (tag: string, slug: string): boolean => tagSlug(tag) === slug;

export const getTopTags = <T>(
  items: T[],
  extractTags: (item: T) => string[] | null | undefined,
  limit = 12
): string[] => {
  const counts = new Map<string, number>();
  for (const item of items) {
    const tags = extractTags(item) ?? [];
    for (const tag of tags) {
      const key = tag.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
};
