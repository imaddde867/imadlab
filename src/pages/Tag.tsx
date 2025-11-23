import { useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import SectionHeader from '@/components/SectionHeader';
import CardItem from '@/components/ui/CardItem';
import { ArrowLeft } from 'lucide-react';
import { tagMatchesSlug } from '@/lib/tags';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  tags: string[] | null;
  published_date: string;
  read_time: number | null;
  image_url: string | null;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  full_description: string | null;
  image_url: string | null;
  tech_tags: string[] | null;
  repo_url: string | null;
  created_at: string;
}

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
        .select('id,title,slug,excerpt,tags,published_date,read_time,image_url')
        .order('published_date', { ascending: false });
      if (error) throw error;
      return (data as Post[]) ?? [];
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
        .select('id,title,description,full_description,image_url,tech_tags,repo_url,created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as Project[]) ?? [];
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
    const fromPosts = allPosts.find((p) => (p.tags || []).some((t) => tagMatchesSlug(t, tagSlugParam)))?.tags?.find((t) => tagMatchesSlug(t, tagSlugParam));
    if (fromPosts) return fromPosts;
    const fromProjects = allProjects.find((p) => (p.tech_tags || []).some((t) => tagMatchesSlug(t, tagSlugParam)))?.tech_tags?.find((t) => tagMatchesSlug(t, tagSlugParam));
    if (fromProjects) return fromProjects;
    return tagSlugParam.replace(/-/g, ' ');
  }, [allPosts, allProjects, tagSlugParam]);

  useEffect(() => {
    import('@/lib/events').then(({ logEvent }) => logEvent('tag_view', { slug: tagSlugParam, tag: displayTag })).catch(() => {});
  }, [tagSlugParam, displayTag]);

  const breadcrumbTrail = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blogs' },
    { name: `Tag: ${displayTag}`, url: `https://imadlab.me/tags/${encodeURIComponent(tagSlugParam)}` },
  ];

  const additionalSchemas = [
    hasPosts
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Posts tagged ${displayTag}`,
          numberOfItems: posts.length,
          itemListElement: posts.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.title, url: `https://imadlab.me/blogs/${p.slug}` })),
        }
      : undefined,
    hasProjects
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Projects tagged ${displayTag}`,
          numberOfItems: projects.length,
          itemListElement: projects.map((pr, i) => ({ '@type': 'ListItem', position: i + 1, name: pr.title, url: `https://imadlab.me/projects/${pr.id}` })),
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
                linkLabel={`Read ${post.title}`}
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
                  <CardItem
                    key={project.id}
                    title={project.title}
                    tags={project.tech_tags || []}
                    description={project.description || ''}
                    linkTo={`/projects/${project.id}`}
                    linkLabel="View Project"
                    githubUrl={project.repo_url || undefined}
                    image_url={project.image_url || undefined}
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
