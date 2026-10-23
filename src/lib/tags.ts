export const normalizeTag = (tag: string): string => tag.trim();
export const tagSlug = (tag: string): string =>
  normalizeTag(tag)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
export const tagToUrl = (tag: string): string => `/tags/${encodeURIComponent(tagSlug(tag))}`;
export const tagMatchesSlug = (tag: string, slug: string): boolean => tagSlug(tag) === slug;
