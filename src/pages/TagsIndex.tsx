import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Seo from '@/components/Seo';
import SectionHeader from '@/components/SectionHeader';
import { tagSlug, tagToUrl } from '@/lib/tags';
import { Link } from 'react-router-dom';

interface Post { tags: string[] | null }
interface Project { tech_tags: string[] | null }

type TagCount = {
  slug: string;
  label: string;
  posts: number;
  projects: number;
  total: number;
};

const TagsIndex = () => {
  const { data: posts = [] } = useQuery({
    queryKey: ['all-post-tags'],
    queryFn: async () => {
      const { data, error } = await supabase.from('posts').select('tags');
      if (error) throw error;
      return (data as Post[]) ?? [];
    },
    staleTime: 60_000,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['all-project-tags'],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('tech_tags');
      if (error) throw error;
      return (data as Project[]) ?? [];
    },
    staleTime: 60_000,
  });

  const tags: TagCount[] = useMemo(() => {
    const map = new Map<string, TagCount>();

    for (const p of posts) {
      for (const t of p.tags || []) {
        const slug = tagSlug(t);
        if (!slug) continue;
        const current = map.get(slug) || { slug, label: t, posts: 0, projects: 0, total: 0 };
        current.label = current.label || t;
        current.posts += 1;
        current.total += 1;
        map.set(slug, current);
      }
    }

    for (const pr of projects) {
      for (const t of pr.tech_tags || []) {
        const slug = tagSlug(t);
        if (!slug) continue;
        const current = map.get(slug) || { slug, label: t, posts: 0, projects: 0, total: 0 };
        current.label = current.label || t;
        current.projects += 1;
        current.total += 1;
        map.set(slug, current);
      }
    }

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [posts, projects]);

  return (
    <div className="min-h-screen bg-black text-white section pt-14">
      <Seo
        title="Tags"
        description="Browse all tags across posts and projects."
        type="website"
        schemaType="CollectionPage"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Tags', path: '/tags' },
        ]}
      />

      <div className="container-site">
        <SectionHeader title={<span className="text-brand-gradient">Tags</span>} />
        {tags.length === 0 ? (
          <div className="text-center py-12 text-white/60">No tags yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {tags.map((t) => (
              <Link
                key={t.slug}
                to={tagToUrl(t.label)}
                className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition"
              >
                <span className="text-white/90">#{t.label}</span>
                <span className="text-xs text-white/60">{t.posts} posts · {t.projects} projects</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagsIndex;
