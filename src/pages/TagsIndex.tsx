import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicPosts, fetchPublicProjects } from '@/lib/public-collections';
import SEO from '@/components/SEO';
import { Page, PageTitle } from '@/components/layout/Page';
import { tagSlug, tagToUrl } from '@/lib/tags';
import { Link } from 'react-router-dom';
import type { PostSummary, ProjectSummary } from '@/types/content';
import { POST_SUMMARY_SELECT, PROJECT_LIST_SELECT } from '@/lib/content-selects';

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
      return fetchPublicPosts<PostSummary>(POST_SUMMARY_SELECT);
    },
    staleTime: 60_000,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['all-project-tags'],
    queryFn: async () => {
      return fetchPublicProjects<ProjectSummary>(PROJECT_LIST_SELECT);
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

  // Log view
  useEffect(() => {
    import('@/lib/events').then(({ logEvent }) => logEvent('tags_index_view', {})).catch(() => {});
  }, []);

  // ItemList schema for tags
  const tagsSchema = tags.length
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'All tags',
          numberOfItems: tags.length,
          itemListElement: tags.map((t, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: t.label,
            url: `https://imadlab.com${tagToUrl(t.label)}`,
          })),
        },
      ]
    : undefined;

  return (
    <Page>
      <SEO
        title="Tags"
        description="Every tag used across my posts and projects."
        type="website"
        schemaType="CollectionPage"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Tags', path: '/tags' },
        ]}
        additionalSchemas={tagsSchema}
      />

      <PageTitle title="Tags" description="Every tag used across my posts and projects." />
      {tags.length === 0 ? (
        <p className="text-[color:var(--nd-ink-3)]">No tags yet.</p>
      ) : (
        <ul className="columns-1 gap-8 sm:columns-2">
          {tags.map((t) => (
            <li key={t.slug} className="break-inside-avoid py-1">
              <Link
                to={tagToUrl(t.label)}
                onClick={() => {
                  import('@/lib/events')
                    .then(({ logEvent }) => logEvent('tag_click', { tag: t.label }))
                    .catch(() => {});
                }}
                className="nd-link"
              >
                {t.label}
              </Link>{' '}
              <span className="text-sm text-[color:var(--nd-ink-3)]">({t.total})</span>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
};

export default TagsIndex;
