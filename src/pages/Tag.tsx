import { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import { EntryList, Page, PageTitle, Section } from '@/components/layout/Page';
import { formatMonth } from '@/lib/utils';
import { tagMatchesSlug } from '@/lib/tags';
import { POST_SUMMARY_SELECT, PROJECT_LIST_SELECT } from '@/lib/content-selects';
import type { PostSummary, ProjectSummary } from '@/types/content';

const findMatchingTag = <T,>(
  items: T[],
  extractTags: (item: T) => string[] | null | undefined,
  slug: string
) => {
  for (const item of items) {
    const tags = extractTags(item) ?? [];
    const match = tags.find((tag) => tagMatchesSlug(tag, slug));
    if (match) return match;
  }
  return null;
};

const logTagView = (slug: string, tag: string) => {
  import('@/lib/events')
    .then(({ logEvent }) => logEvent('tag_view', { slug, tag }))
    .catch(() => {});
};

const Tag = () => {
  const { tag: slug } = useParams<{ tag: string }>();
  const tagSlugParam = slug ?? '';

  const {
    data: allPosts = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['tag-posts', tagSlugParam],
    enabled: Boolean(tagSlugParam),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(POST_SUMMARY_SELECT)
        .order('published_date', { ascending: false });
      if (error) throw error;
      return (data as PostSummary[]) ?? [];
    },
    staleTime: 60_000,
  });

  const posts = useMemo(
    () => allPosts.filter((p) => (p.tags || []).some((t) => tagMatchesSlug(t, tagSlugParam))),
    [allPosts, tagSlugParam]
  );

  const { data: allProjects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['tag-projects', tagSlugParam],
    enabled: Boolean(tagSlugParam),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(PROJECT_LIST_SELECT)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as ProjectSummary[]) ?? [];
    },
    staleTime: 60_000,
  });

  const projects = useMemo(
    () =>
      allProjects.filter((p) => (p.tech_tags || []).some((t) => tagMatchesSlug(t, tagSlugParam))),
    [allProjects, tagSlugParam]
  );

  const isSkeletonVisible = isLoading && !posts.length && !isFetching;
  const hasPosts = posts.length > 0;
  const hasProjects = projects.length > 0;

  const displayTag = useMemo(() => {
    return (
      findMatchingTag(allPosts, (post) => post.tags, tagSlugParam) ??
      findMatchingTag(allProjects, (project) => project.tech_tags, tagSlugParam) ??
      tagSlugParam.replace(/-/g, ' ')
    );
  }, [allPosts, allProjects, tagSlugParam]);

  useEffect(() => {
    logTagView(tagSlugParam, displayTag);
  }, [tagSlugParam, displayTag]);

  const breadcrumbTrail = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blogs' },
    {
      name: `Tag: ${displayTag}`,
      url: `https://imadlab.com/tags/${encodeURIComponent(tagSlugParam)}`,
    },
  ];

  const additionalSchemas = [
    hasPosts
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Posts tagged ${displayTag}`,
          numberOfItems: posts.length,
          itemListElement: posts.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: post.title,
            url: `https://imadlab.com/blogs/${post.slug}`,
          })),
        }
      : undefined,
    hasProjects
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Projects tagged ${displayTag}`,
          numberOfItems: projects.length,
          itemListElement: projects.map((project, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: project.title,
            url: `https://imadlab.com/projects/${project.id}`,
          })),
        }
      : undefined,
  ].filter(Boolean) as Array<Record<string, unknown>>;

  return (
    <Page>
      <SEO
        title={`Tag: ${displayTag}`}
        description={`Content tagged with ${displayTag}.`}
        type="website"
        schemaType="CollectionPage"
        breadcrumbs={breadcrumbTrail}
        additionalSchemas={additionalSchemas}
      />
      <PageTitle title={displayTag} back={{ to: '/tags', label: 'All tags' }} />

      {(isSkeletonVisible || hasPosts) && (
        <Section title="Writing">
          {isSkeletonVisible ? (
            <p className="text-[color:var(--nd-ink-3)]">Loading…</p>
          ) : (
            <EntryList
              entries={posts.map((post) => ({
                key: post.id,
                to: `/blogs/${post.slug}`,
                title: post.title,
                description: post.excerpt,
                meta: [
                  formatMonth(post.published_date),
                  post.read_time ? `${post.read_time} min read` : '',
                ]
                  .filter(Boolean)
                  .join(' · '),
              }))}
            />
          )}
        </Section>
      )}

      {(loadingProjects || hasProjects) && (
        <Section title="Projects">
          {loadingProjects ? (
            <p className="text-[color:var(--nd-ink-3)]">Loading…</p>
          ) : (
            <EntryList
              entries={projects.map((project) => ({
                key: project.id,
                to: `/projects/${project.id}`,
                title: project.title,
                description: project.description,
                meta: project.tech_tags?.slice(0, 4).join(', '),
              }))}
            />
          )}
        </Section>
      )}

      {!isSkeletonVisible && !loadingProjects && !hasPosts && !hasProjects && (
        <p className="text-[color:var(--nd-ink-3)]">No posts or projects for this tag yet.</p>
      )}
    </Page>
  );
};

export default Tag;
