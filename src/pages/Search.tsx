import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import SectionHeader from '@/components/SectionHeader';
import CardItem from '@/components/ui/CardItem';
import ProjectCard from '@/components/ProjectCard';
import { POST_SEARCH_SELECT, PROJECT_SEARCH_SELECT } from '@/lib/content-selects';
import type { PostDetail, ProjectDetail } from '@/types/content';

const normalize = (value: string) => value.toLowerCase();
const includesNormalized = (text: string, normalizedQuery: string) =>
  normalize(text).includes(normalizedQuery);

const Search = () => {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const { data: posts = [] } = useQuery({
    queryKey: ['search-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(POST_SEARCH_SELECT)
        .order('published_date', { ascending: false });
      if (error) throw error;
      return (data as PostDetail[]) ?? [];
    },
    staleTime: 60_000,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['search-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(PROJECT_SEARCH_SELECT)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as ProjectDetail[]) ?? [];
    },
    staleTime: 60_000,
  });

  const results = useMemo(() => {
    if (!debounced) return { posts: [], projects: [] };
    const term = normalize(debounced);
    const postHits = posts.filter((p) => {
      const haystack = [p.title, p.excerpt ?? '', p.body ?? ''];
      return (
        haystack.some((value) => includesNormalized(value, term)) ||
        (p.tags || []).some((t) => includesNormalized(t, term))
      );
    });
    const projectHits = projects.filter((p) => {
      const haystack = [p.title, p.description ?? '', p.full_description ?? ''];
      return (
        haystack.some((value) => includesNormalized(value, term)) ||
        (p.tech_tags || []).some((t) => includesNormalized(t, term))
      );
    });
    return { posts: postHits, projects: projectHits };
  }, [debounced, posts, projects]);

  useEffect(() => {
    if (debounced) import('@/lib/events').then(({ logEvent }) => logEvent('search_query', { q: debounced })).catch(() => {});
  }, [debounced]);

  return (
    <div className="min-h-screen bg-black text-white section pt-14">
      <SEO
        title="Search"
        description="Search posts and projects"
        type="website"
        schemaType="SearchResultsPage"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Search', path: '/search' },
        ]}
      />

      <div className="container-site">
        <SectionHeader title={<span className="text-brand-gradient">Search</span>} />

        <div className="mb-8">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts and projects..."
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>

        {debounced && (
          <>
            <h3 className="text-sm text-white/60 mb-3">Posts ({results.posts.length})</h3>
            {results.posts.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-default mb-10">
                {results.posts.map((post) => (
                  <CardItem
                    key={post.id}
                    title={post.title}
                    tags={post.tags || []}
                    date={new Date(post.published_date).toLocaleDateString()}
                    excerpt={post.excerpt || ''}
                    linkTo={`/blogs/${post.slug}`}
                    linkLabel="Read"
                    readTime={post.read_time || undefined}
                    isBlog={true}
                    image_url={post.image_url || undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="text-white/50 mb-10">No posts found.</div>
            )}

            <h3 className="text-sm text-white/60 mb-3">Projects ({results.projects.length})</h3>
            {results.projects.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-default">
                {results.projects.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    linkTo={`/projects/${p.id}`}
                    linkLabel="View Project"
                  />
                ))}
              </div>
            ) : (
              <div className="text-white/50">No projects found.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
