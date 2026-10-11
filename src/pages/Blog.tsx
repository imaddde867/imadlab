import { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import { EntryList, Page, PageTitle } from '@/components/layout/Page';
import { formatMonth } from '@/lib/utils';
import { readPrerenderData } from '@/lib/prerender-data';
import { POST_SUMMARY_SELECT } from '@/lib/content-selects';
import type { PostSummary } from '@/types/content';

const Blogs = () => {
  const initialPosts = useMemo(() => readPrerenderData<PostSummary[]>('posts'), []);
  const initialUpdatedAt = useRef<number | undefined>(
    initialPosts?.length ? Date.now() : undefined
  );

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(POST_SUMMARY_SELECT)
        .order('published_date', { ascending: false });

      if (error) throw error;
      return data as PostSummary[];
    },
    initialData: initialPosts?.length ? initialPosts : undefined,
    initialDataUpdatedAt: initialUpdatedAt.current,
    staleTime: 1000 * 60,
  });

  const postListSchema =
    posts.length > 0
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Latest blog posts',
            itemListOrder: 'Descending',
            numberOfItems: posts.length,
            itemListElement: posts.map((post, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `https://imadlab.com/blogs/${post.slug}`,
              name: post.title,
              description: post.excerpt ?? undefined,
            })),
          },
        ]
      : undefined;

  return (
    <Page>
      <SEO
        title="Writing"
        description="Technical notes on industrial AI systems, local LLM extraction pipelines, architecture tradeoffs, and evaluation."
        keywords="industrial ai blog, applied research engineering notes, local llm pipelines, procedural knowledge extraction, ai system architecture, evaluation methodology"
        type="website"
        schemaType="CollectionPage"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Writing', path: '/blogs' },
        ]}
        additionalSchemas={postListSchema}
      />
      <PageTitle
        title="Writing"
        description="Technical notes on industrial AI systems, local LLM extraction pipelines, architecture tradeoffs, and evaluation."
      />
      {isLoading && posts.length === 0 ? (
        <p className="text-[color:var(--nd-ink-3)]">Loading…</p>
      ) : (
        <EntryList
          entries={posts.map((p) => ({
            key: p.id,
            to: `/blogs/${p.slug}`,
            title: p.title,
            description: p.excerpt,
            meta: [formatMonth(p.published_date), p.read_time ? `${p.read_time} min read` : '']
              .filter(Boolean)
              .join(' · '),
          }))}
        />
      )}
    </Page>
  );
};

export default Blogs;
