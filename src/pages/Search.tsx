import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicPosts, fetchPublicProjects } from '@/lib/public-collections';
import SEO from '@/components/SEO';
import { EntryList, Page, PageTitle, Section } from '@/components/layout/Page';
import { formatMonth } from '@/lib/utils';
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

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['search-posts'],
    queryFn: async () => {
      return fetchPublicPosts<PostDetail>(POST_SEARCH_SELECT);
    },
    staleTime: 60_000,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['search-projects'],
    queryFn: async () => {
      return fetchPublicProjects<ProjectDetail>(PROJECT_SEARCH_SELECT);
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
    if (debounced)
      import('@/lib/events')
        .then(({ logEvent }) => logEvent('search_query', { q: debounced }))
        .catch(() => {});
  }, [debounced]);

  return (
    <Page>
      <SEO
        title="Search"
        description="Search posts and projects"
        type="website"
        schemaType="SearchResultsPage"
        noindex
        nofollow
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Search', path: '/search' },
        ]}
      />

      <PageTitle title="Search" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search posts and projects by title, tags, or content"
        aria-label="Search posts and projects"
        className="mb-10 w-full border-b border-[color:var(--nd-line)] bg-transparent pb-2 text-[color:var(--nd-ink)] placeholder:text-[color:var(--nd-ink-3)] focus:border-[color:var(--nd-link)] focus:outline-none"
      />
      {debounced && (postsLoading || projectsLoading) && (
        <p className="text-[color:var(--nd-ink-3)]">Searching…</p>
      )}

      {debounced && (
        <>
          <Section title={`Writing (${results.posts.length})`}>
            {results.posts.length ? (
              <EntryList
                entries={results.posts.map((post) => ({
                  key: post.id,
                  to: `/blogs/${post.slug}`,
                  title: post.title,
                  description: post.excerpt,
                  meta: formatMonth(post.published_date),
                }))}
              />
            ) : (
              <p className="text-[color:var(--nd-ink-3)]">No posts found.</p>
            )}
          </Section>
          <Section title={`Projects (${results.projects.length})`}>
            {results.projects.length ? (
              <EntryList
                entries={results.projects.map((p) => ({
                  key: p.id,
                  to: `/projects/${p.id}`,
                  title: p.title,
                  description: p.description,
                  meta: p.tech_tags?.slice(0, 4).join(', '),
                }))}
              />
            ) : (
              <p className="text-[color:var(--nd-ink-3)]">No projects found.</p>
            )}
          </Section>
        </>
      )}
    </Page>
  );
};

export default Search;
