import { useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import SectionHeader from '@/components/SectionHeader';
import CardItem from '@/components/ui/CardItem';
import ProjectCard from '@/components/ProjectCard';
import { ArrowLeft } from 'lucide-react';
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
  const navigate = useNavigate();
  const tagSlugParam = slug ?? '';

  const { data: allPosts = [], isLoading, isFetching } = useQuery({
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
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as ProjectSummary[]) ?? [];
    },
    staleTime: 60_000,
  });

  const projects = useMemo(
    () => allProjects.filter((p) => (p.tech_tags || []).some((t) => tagMatchesSlug(t, tagSlugParam))),
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
      url: `https://imadlab.me/tags/${encodeURIComponent(tagSlugParam)}`,
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
            url: `https://imadlab.me/blogs/${post.slug}`,
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
            url: `https://imadlab.me/projects/${project.id}`,
          })),
        }
      : undefined,
  ].filter(Boolean) as Array<Record<string, unknown>>;

  return (
    <div className="min-h-screen bg-black text-white section pt-14">
      <SEO
        title={`Tag: ${displayTag}`}
        description={`Content tagged with ${displayTag}.`}
        type="website"
        schemaType="CollectionPage"
        breadcrumbs={breadcrumbTrail}
        additionalSchemas={additionalSchemas}
      />

      <div className="container-site">
        <div className="mb-8">
          <button
            onClick={(e) => {
              e.preventDefault();
              const ref = document.referrer;
              const sameOrigin = ref && ref.startsWith(window.location.origin);
              if (sameOrigin) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }}
            className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>

        <SectionHeader title={<span className="text-brand-gradient">#{displayTag}</span>} />

        {isSkeletonVisible ? (
          <div className="text-center py-12">
            <div className="text-white/60">Loading posts...</div>
          </div>
        ) : hasPosts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-default">
            {posts.map((post) => (
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
        ) : null}

        {(loadingProjects || hasProjects) && (
          <div className="mt-12">
            <SectionHeader title={<span className="text-brand-gradient">Projects</span>} />
            {loadingProjects ? (
              <div className="text-center py-8 text-white/60">Loading projects...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-default">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    linkTo={`/projects/${project.id}`}
                    linkLabel="View Project"
                    project={project}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!isSkeletonVisible && !loadingProjects && !hasPosts && !hasProjects && (
          <div className="text-center py-12">
            <div className="text-white/60">No posts or projects for this tag yet.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tag;
