import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { POST_SUMMARY_SELECT, PROJECT_LIST_SELECT } from '@/lib/content-selects';
import { expandTagVariants } from '@/lib/tag-variants';
import CardItem from '@/components/ui/CardItem';
import ProjectCard from '@/components/ProjectCard';
import type { PostSummary, ProjectSummary } from '@/types/content';

export const RelatedPosts = ({
  currentSlug,
  tags,
}: {
  currentSlug?: string;
  tags: string[];
}) => {
  const queryTags = useMemo(() => expandTagVariants(tags), [tags]);
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ rootMargin: '200px' });
  const { data: related = [] } = useQuery({
    queryKey: ['related-posts', currentSlug ?? '', queryTags.slice().sort().join(',')],
    enabled: tags.length > 0 && isIntersecting,
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(POST_SUMMARY_SELECT)
        .overlaps('tags', queryTags)
        .order('published_date', { ascending: false })
        .limit(3);
      if (currentSlug) {
        query = query.neq('slug', currentSlug);
      }
      const { data, error } = await query;
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

export const RelatedProjects = ({
  currentId,
  tags,
}: {
  currentId?: string;
  tags: string[];
}) => {
  const queryTags = useMemo(() => expandTagVariants(tags), [tags]);
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ rootMargin: '200px' });
  const { data: related = [] } = useQuery({
    queryKey: ['related-projects', currentId ?? '', queryTags.slice().sort().join(',')],
    enabled: tags.length > 0 && isIntersecting,
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select(PROJECT_LIST_SELECT)
        .overlaps('tech_tags', queryTags)
        .order('created_at', { ascending: false })
        .limit(3);
      if (currentId) {
        query = query.neq('id', currentId);
      }
      const { data, error } = await query;
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
