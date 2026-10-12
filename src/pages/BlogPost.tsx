import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import SubscribeForm from '@/components/SubscribeForm';
import { Page, PageTitle } from '@/components/layout/Page';
import { tagToUrl } from '@/lib/tags';
import { calculateReadingTime, stripMarkdown } from '@/lib/markdown-utils';
import { resolveImageUrl } from '@/lib/image-utils';
import { PageLoader } from '@/components/ui/LoadingStates';
import { GfmMarkdown } from '@/components/markdown/GfmMarkdown';
import { POST_DETAIL_SELECT } from '@/lib/content-selects';
import { readPrerenderData } from '@/lib/prerender-data';
import type { PostDetail } from '@/types/content';

const buildMetaDescription = (excerpt?: string | null, body?: string | null) => {
  if (excerpt && excerpt.trim().length > 60) {
    return excerpt.trim();
  }
  if (body) {
    const plain = stripMarkdown(body);
    return plain.slice(0, 155) + (plain.length > 155 ? '...' : '');
  }
  return 'Read data engineering and AI insights by Imad Eddine El Mouss.';
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const initialPost = useMemo(
    () => (slug ? readPrerenderData<PostDetail>(`post:${slug}`) : undefined),
    [slug]
  );
  const initialUpdatedAt = useRef<number | undefined>(initialPost ? Date.now() : undefined);

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      const { data, error } = await supabase
        .from('posts')
        .select(POST_DETAIL_SELECT)
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data as PostDetail | null;
    },
    enabled: !!slug,
    initialData: initialPost,
    initialDataUpdatedAt: initialUpdatedAt.current,
  });

  // Calculate reading time if not provided
  const estimatedReadTime = post?.body ? calculateReadingTime(post.body) : null;

  if (isLoading) {
    return <PageLoader text="Loading article..." variant="orbit" />;
  }

  if (error || !post) {
    return (
      <Page>
        <PageTitle
          title="Post not found"
          description="The article you're looking for doesn't exist."
          back={{ to: '/blogs', label: 'Writing' }}
        />
      </Page>
    );
  }

  const articleTags = post.tags?.filter((tag): tag is string => Boolean(tag && tag.trim())) ?? [];
  const metaDescription = buildMetaDescription(post.excerpt, post.body);
  const breadcrumbTrail = [
    { name: 'Home', path: '/' },
    { name: 'Writing', path: '/blogs' },
    { name: post.title, url: `https://imadlab.com/blogs/${post.slug}` },
  ];
  const articleReadTime = post.read_time || estimatedReadTime || undefined;
  const speakableSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'SpeakableSpecification',
      xpath: ["//*[@id='main']//h1", "//*[@id='main']//p[1]"],
    },
  ];

  const body = post.body ?? '';
  const enableMermaid = body.includes('```mermaid');
  const coverImage = resolveImageUrl(post.image_url);

  const published = new Date(post.published_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Page>
      <SEO
        title={post.title}
        description={metaDescription}
        keywords={
          articleTags.length
            ? articleTags.join(', ')
            : 'data engineering, machine learning, ai, programming'
        }
        type="article"
        publishedTime={post.published_date}
        modifiedTime={post.updated_at ?? post.published_date}
        image={coverImage || undefined}
        imageAlt={post.title}
        tags={articleTags}
        breadcrumbs={breadcrumbTrail}
        additionalSchemas={speakableSchema}
      />
      <PageTitle title={post.title} back={{ to: '/blogs', label: 'Writing' }}>
        <p className="mt-4 text-sm text-[color:var(--nd-ink-3)]">
          {published}
          {articleReadTime ? ` · ${articleReadTime} min read` : ''}
          {articleTags.length > 0 && ' · '}
          {articleTags.map((tag, i) => (
            <span key={tag}>
              {i > 0 && ', '}
              <Link to={tagToUrl(tag)} className="nd-quiet-link whitespace-nowrap">
                {tag}
              </Link>
            </span>
          ))}
        </p>
        {post.excerpt && (
          <p className="mt-6 text-lg text-[color:var(--nd-ink-2)]">{post.excerpt}</p>
        )}
      </PageTitle>

      <article className="border-t border-[color:var(--nd-line)] pt-10">
        {post.body ? (
          <GfmMarkdown source={post.body} config={{ enableMermaid }} />
        ) : (
          <p className="text-[color:var(--nd-ink-3)]">No content available for this article.</p>
        )}
      </article>

      <aside className="mt-14 border-t border-[color:var(--nd-line)] pt-10">
        <SubscribeForm />
      </aside>
    </Page>
  );
};

export default BlogPost;
