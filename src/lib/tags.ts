export const normalizeTag = (tag: string): string => tag.trim();
export const tagToUrl = (tag: string): string => `/tags/${encodeURIComponent(normalizeTag(tag))}`;