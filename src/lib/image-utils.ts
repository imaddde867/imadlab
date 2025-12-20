const ABSOLUTE_PREFIXES = ['http://', 'https://', 'data:', 'blob:'];

export const resolveImageUrl = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (ABSOLUTE_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl && (trimmed.startsWith('storage/') || trimmed.startsWith('storage/v1/'))) {
    return `${supabaseUrl.replace(/\/$/, '')}/${trimmed}`;
  }

  return `/${trimmed}`;
};
