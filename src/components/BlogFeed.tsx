import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import CardItem from '@/components/ui/CardItem';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GridSkeleton } from '@/components/ui/LoadingStates';
import SectionHeader from '@/components/SectionHeader';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { readPrerenderData } from '@/lib/prerender-data';
import { POST_SUMMARY_SELECT } from '@/lib/content-selects';
import type { PostSummary } from '@/types/content';

const BlogFeed = () => {
  const initialPosts = useMemo(() => readPrerenderData<PostSummary[]>('posts'), []);
  const initialUpdatedAt = useRef<number | undefined>(initialPosts?.length ? Date.now() : undefined);
  const { ref: sectionRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '200px',
  });

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
    enabled: isIntersecting,
  });
  const showSkeleton =
    isIntersecting && (isLoading || isFetching) && (!posts || posts.length === 0);

  return (
    <section ref={sectionRef} className="section relative">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-0 w-2/3 h-px bg-white"></div>
        <div className="absolute bottom-1/3 right-1/4 w-1/2 h-px bg-white"></div>
        <div className="absolute right-1/3 top-0 w-px h-full bg-white"></div>
      </div>

      <div className="container-site">
        {/* Section header */}
        <div className="mb-20 flex items-center justify-between">
          <div className="w-full max-w-xl">
            <SectionHeader title={<span className="text-brand-gradient">Latest Insights</span>} />
          </div>
          <Link to="/blogs" className="link-enhanced focus-enhanced z-10">
            View all posts
          </Link>
        </div>

        {/* 4-column grid layout for blogs, matching Latest Projects */}
        {showSkeleton ? (
          <GridSkeleton count={3} columns={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-gap-default">
            {posts?.slice(0, 3).map((post) => (
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
        )}
      </div>
    </section>
  );
};

export default BlogFeed;
