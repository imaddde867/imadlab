import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import CardItem from '@/components/ui/CardItem';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import SectionHeader from '@/components/SectionHeader';
import NewsletterSignup from '@/components/NewsletterSignup';
import { readPrerenderData } from '@/lib/prerender-data';
import { getTopTags, tagToUrl } from '@/lib/tags';
import { POST_SUMMARY_SELECT } from '@/lib/content-selects';
import type { PostSummary } from '@/types/content';

type PostSort = 'newest' | 'oldest' | 'shortest' | 'title-asc';

const Blogs = () => {
  const initialPosts = useMemo(() => readPrerenderData<PostSummary[]>('posts'), []);
  const initialUpdatedAt = useRef<number | undefined>(initialPosts?.length ? Date.now() : undefined);
  const [sortBy, setSortBy] = useState<PostSort>('newest');

  const {
    data: posts = [],
    isLoading,
    isFetching,
  } = useQuery({
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

  const isSkeletonVisible = isLoading && !posts.length && !isFetching;

  const sortedPosts = useMemo(() => {
    if (posts.length <= 1) return posts;
    const list = [...posts];
    const getPublishedTime = (post: PostSummary) => new Date(post.published_date).getTime();
    const getReadTime = (post: PostSummary) => post.read_time ?? Number.POSITIVE_INFINITY;

    switch (sortBy) {
      case 'oldest':
        return list.sort((a, b) => getPublishedTime(a) - getPublishedTime(b));
      case 'shortest':
        return list.sort((a, b) => getReadTime(a) - getReadTime(b));
      case 'title-asc':
        return list.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
      case 'newest':
      default:
        return list.sort((a, b) => getPublishedTime(b) - getPublishedTime(a));
    }
  }, [posts, sortBy]);

  // Derive popular tags from posts (top 12)
  const popularTags = useMemo(() => getTopTags(posts, (post) => post.tags), [posts]);

  const postItemOrder =
    sortBy === 'oldest' || sortBy === 'shortest' || sortBy === 'title-asc'
      ? 'Ascending'
      : 'Descending';
  const postListSchema =
    sortedPosts.length > 0
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Latest blog posts',
            itemListOrder: postItemOrder,
            numberOfItems: sortedPosts.length,
            itemListElement: sortedPosts.map((post, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `https://imadlab.me/blogs/${post.slug}`,
              name: post.title,
              description: post.excerpt ?? undefined,
            })),
          },
        ]
      : undefined;

  return (
    <div className="min-h-screen bg-black text-white section pt-14">
      <SEO
        title="Blog"
        description="Technical notes on industrial AI systems, local LLM extraction pipelines, architecture tradeoffs, and evaluation."
        keywords="industrial ai blog, applied research engineering notes, local llm pipelines, procedural knowledge extraction, ai system architecture, evaluation methodology"
        type="website"
        schemaType="CollectionPage"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blogs' },
        ]}
        additionalSchemas={postListSchema}
      />
      <div className="container-site">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
        <div>
          <SectionHeader title={<span className="text-brand-gradient">Blog</span>} />
        </div>

        {(popularTags.length > 0 || posts.length > 1) && (
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            {popularTags.length > 0 && (
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="text-sm text-white/60">Popular tags</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <Link
                      to="/tags"
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      All tags
                    </Link>
                    <Link
                      to="/search"
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      Search
                    </Link>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, index) => (
                    <Link
                      key={tag}
                      to={tagToUrl(tag)}
                      className={`px-2 py-1 text-xs bg-white/10 rounded-md text-white/90 hover:bg-white/20 ${
                        index >= 5 ? 'hidden md:inline-flex' : 'inline-flex'
                      }`}
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {posts.length > 1 && (
              <div className="flex items-center gap-2 text-xs text-white/60 md:pt-1">
                <label className="flex items-center gap-2">
                  Sort by
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as PostSort)}
                    className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/90 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="shortest">Shortest read</option>
                    <option value="title-asc">Title A-Z</option>
                  </select>
                </label>
              </div>
            )}
          </div>
        )}

        {isSkeletonVisible ? (
          <div className="text-center py-12">
            <div className="text-white/60">Loading posts...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-default">
            {sortedPosts.map((post) => (
              <CardItem
                key={post.id}
                title={post.title}
                tags={post.tags || []}
                date={new Date(post.published_date).toLocaleDateString()}
                excerpt={post.excerpt || ''}
                linkTo={`/blogs/${post.slug}`}
                linkLabel="Read"
                isBlog={true}
                readTime={post.read_time || undefined}
                image_url={post.image_url || undefined}
              />
            ))}
          </div>
        )}

        {!isSkeletonVisible && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/60 mb-4">No posts yet</div>
          </div>
        )}
      </div>

      {/* Newsletter signup component */}
      <NewsletterSignup />
    </div>
  );
};

export default Blogs;
