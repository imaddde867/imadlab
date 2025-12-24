import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { calculateReadingTime, stripMarkdown } from '@/lib/markdown-utils';
import { resolveImageUrl } from '@/lib/image-utils';
import { PageLoader } from '@/components/ui/LoadingStates';
import BackRow from '@/components/BackRow';
import TagList from '@/components/TagList';
import { GfmMarkdown } from '@/components/markdown/GfmMarkdown';
import CardItem from '@/components/ui/CardItem';
import ProjectCard from '@/components/ProjectCard';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { POST_DETAIL_SELECT, POST_SUMMARY_SELECT, PROJECT_LIST_SELECT } from '@/lib/content-selects';
import { expandTagVariants } from '@/lib/tag-variants';
import type { PostDetail, PostSummary, ProjectSummary } from '@/types/content';

const RelatedPosts = ({ currentSlug, tags }: { currentSlug: string; tags: string[] }) => {
  const queryTags = useMemo(() => expandTagVariants(tags), [tags]);
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ rootMargin: '200px' });
  const { data: related = [] } = useQuery({
    queryKey: ['related-posts', currentSlug, queryTags.slice().sort().join(',')],
    enabled: tags.length > 0 && isIntersecting,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(POST_SUMMARY_SELECT)
        .overlaps('tags', queryTags)
        .neq('slug', currentSlug)
        .order('published_date', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data as PostSummary[];
    },
    staleTime: 60_000,
  });

  if (!related.length && !isIntersecting) return null;

  return (
    <section ref={ref} className="mt-12 border-t border-white/10 pt-8">
      <h2 className="text-xl font-semibold mb-6">Related articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((p) => (
          <CardItem
            key={p.id}
            title={p.title}
            tags={p.tags || []}
            date={new Date(p.published_date).toLocaleDateString('en-US')}
            excerpt={p.excerpt || ''}
            linkTo={`/blogs/${p.slug}`}
            linkLabel="Read"
            readTime={p.read_time || undefined}
            isBlog
            image_url={p.image_url || undefined}
          />
        ))}
      </div>
    </section>
  );
};

const RelatedProjects = ({ currentSlug, tags }: { currentSlug: string; tags: string[] }) => {
  const queryTags = useMemo(() => expandTagVariants(tags), [tags]);
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ rootMargin: '200px' });
  const { data: related = [] } = useQuery({
    queryKey: ['related-projects', currentSlug, queryTags.slice().sort().join(',')],
    enabled: tags.length > 0 && isIntersecting,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(PROJECT_LIST_SELECT)
        .overlaps('tech_tags', queryTags)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data as ProjectSummary[];
    },
    staleTime: 60_000,
  });

  if (!related.length && !isIntersecting) return null;

  return (
    <section ref={ref} className="mt-12 border-t border-white/10 pt-8">
      <h2 className="text-xl font-semibold mb-6">Related projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            linkTo={`/projects/${p.id}`}
            linkLabel="View Project"
          />
        ))}
      </div>
    </section>
  );
};

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
  });

  // Calculate reading time if not provided
  const estimatedReadTime = post?.body ? calculateReadingTime(post.body) : null;

  if (isLoading) {
    return <PageLoader text="Loading article..." variant="orbit" />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-white/60 mb-8">The article you're looking for doesn't exist.</p>
          <Link to="/blogs">
            <Button className="bg-white/10 hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const articleTags = post.tags?.filter((tag): tag is string => Boolean(tag && tag.trim())) ?? [];
  const metaDescription = buildMetaDescription(post.excerpt, post.body);
  const breadcrumbTrail = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blogs' },
    { name: post.title, url: `https://imadlab.me/blogs/${post.slug}` },
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
  const enableMath = /\$\$|\\\(|\\\[/.test(body);
  const coverImage = resolveImageUrl(post.image_url);

  return (
    <div className="min-h-screen bg-black text-white pt-14">
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

      <BackRow
        to="/blogs"
        label="Back to Blog"
        icon={
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
        }
        right={
          articleReadTime ? (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {articleReadTime} min read
            </div>
          ) : undefined
        }
      />
      {/* Hero Section */}
      <header className="relative pt-8 md:pt-12 pb-10">
        <div className="container-narrow">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-y-4 gap-x-6 mb-8">
            <div className="flex items-center text-sm text-white/70">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(post.published_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            {articleTags.length > 0 && <TagList tags={articleTags} label="Tags:" />}
          </div>
          {post.excerpt && (
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {coverImage && (
        <div className="w-full container-narrow mb-12">
          <div className="aspect-video w-full overflow-hidden rounded-lg shadow-xl">
            <img
              src={coverImage}
              alt={post.title}
              width="1200"
              height="675"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container-narrow pb-16">
        {post.body ? (
          <GfmMarkdown
            source={post.body}
            className="prose-lg"
            config={{ enableMermaid, enableMath, showToc: true }}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-white/60 mb-4">No content available for this article.</div>
          </div>
        )}

        {articleTags.length > 0 && (
          <>
            <RelatedPosts currentSlug={post.slug} tags={articleTags} />
            <RelatedProjects currentSlug={post.slug} tags={articleTags} />
          </>
        )}
      </main>

      {/* Page footer removed; global Footer is used */}
    </div>
  );
};

export default BlogPost;
