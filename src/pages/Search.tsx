import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import SectionHeader from '@/components/SectionHeader';
import CardItem from '@/components/ui/CardItem';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body?: string | null;
  tags: string[] | null;
  published_date: string;
  read_time: number | null;
  image_url: string | null;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  full_description?: string | null;
  image_url: string | null;
  tech_tags: string[] | null;
  repo_url: string | null;
  created_at: string;
}

const normalize = (s: string) => s.toLowerCase();
const includes = (text: string, q: string) => normalize(text).includes(normalize(q));

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
        .select('id,title,slug,excerpt,body,tags,published_date,read_time,image_url')
        .order('published_date', { ascending: false });
      if (error) throw error;
      return (data as Post[]) ?? [];
    },
    staleTime: 60_000,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['search-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id,title,description,full_description,tech_tags,image_url,repo_url,created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as Project[]) ?? [];
    },
    staleTime: 60_000,
  });

  const results = useMemo(() => {
    if (!debounced) return { posts: [], projects: [] };
    const term = debounced;
    const postHits = posts.filter((p) =>
      includes(p.title, term) || includes(p.excerpt || '', term) || (p.tags || []).some((t) => includes(t, term))
    );
    const projectHits = projects.filter((p) =>
      includes(p.title, term) || includes(p.description || '', term) || (p.tech_tags || []).some((t) => includes(t, term))
    );
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
                    linkLabel={`Read ${post.title}`}
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
                  <CardItem
                    key={p.id}
                    title={p.title}
                    tags={p.tech_tags || []}
                    description={p.description || ''}
                    linkTo={`/projects/${p.id}`}
                    linkLabel="View Project"
                    githubUrl={p.repo_url || undefined}
                    image_url={p.image_url || undefined}
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
