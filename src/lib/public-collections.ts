import { supabase } from '@/integrations/supabase/client';
import { fetchAllById } from '@/lib/public-pagination.js';

type PublicPostRow = { id: string; published_date: string };
type PublicProjectRow = { id: string; created_at: string; featured?: boolean | null };

export async function fetchPublicPosts<T extends PublicPostRow>(columns: string): Promise<T[]> {
  const rows = await fetchAllById<T>(
    async (cursor, pageSize) => {
      let query = supabase.from('posts').select(columns, { count: 'exact' });
      if (cursor) query = query.gt('id', cursor);
      const { data, error, count } = await query.order('id', { ascending: true }).range(0, pageSize - 1);
      return { data: data as unknown as T[] | null, error, count };
    },
    async () => {
      const { count, error } = await supabase.from('posts').select('id', { count: 'exact', head: true });
      return { count, error };
    },
    { label: 'posts' },
  );
  return rows.sort(
    (a, b) => Date.parse(b.published_date) - Date.parse(a.published_date) || a.id.localeCompare(b.id),
  );
}

export async function fetchPublicProjects<T extends PublicProjectRow>(columns: string): Promise<T[]> {
  const rows = await fetchAllById<T>(
    async (cursor, pageSize) => {
      let query = supabase.from('projects').select(columns, { count: 'exact' }).eq('published', true);
      if (cursor) query = query.gt('id', cursor);
      const { data, error, count } = await query.order('id', { ascending: true }).range(0, pageSize - 1);
      return { data: data as unknown as T[] | null, error, count };
    },
    async () => {
      const { count, error } = await supabase.from('projects')
        .select('id', { count: 'exact', head: true }).eq('published', true);
      return { count, error };
    },
    { label: 'projects' },
  );
  return rows.sort(
    (a, b) =>
      Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
      Date.parse(b.created_at) - Date.parse(a.created_at) ||
      a.id.localeCompare(b.id),
  );
}
