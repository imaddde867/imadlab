import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, Code, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { PageLoader } from '@/components/ui/LoadingStates';
import BackRow from '@/components/BackRow';
import { stripMarkdown } from '@/lib/markdown-utils';
import { tagToUrl } from '@/lib/tags';
import { GfmMarkdown } from '@/components/markdown/GfmMarkdown';
import CardItem from '@/components/ui/CardItem';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { getSeoTitle } from '@/lib/seo-utils';
import { resolveImageUrl } from '@/lib/image-utils';

interface Project {
  id: string;
  title: string;
  description: string | null;
  full_description: string | null;
  image_url: string | null;
  tech_tags: string[] | null;
  repo_url: string | null;
  created_at: string;
  updated_at?: string | null;
}

const RelatedProjects = ({ currentId, tags }: { currentId: string; tags: string[] }) => {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ rootMargin: '200px' });
  const { data: related = [] } = useQuery({
    queryKey: ['related-projects', currentId, tags.sort().join(',')],
    enabled: tags.length > 0 && isIntersecting,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id,title,description,image_url,tech_tags,repo_url,created_at')
        .overlaps('tech_tags', tags)
        .neq('id', currentId)
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data as Project[];
    },
    staleTime: 60_000,
  });

  if (!related.length && !isIntersecting) return null;

  return (
    <section ref={ref} className="mt-12 border-t border-white/10 pt-8">
      <h2 className="text-xl font-semibold mb-6">Related projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((p) => (
          <CardItem
            key={p.id}
            title={p.title}
            tags={p.tech_tags || []}
            description={p.description}
            linkTo={`/projects/${p.id}`}
            linkLabel="View Project"
            githubUrl={p.repo_url || undefined}
            image_url={p.image_url || undefined}
          />
        ))}
      </div>
    </section>
  );
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [showAllTags, setShowAllTags] = useState(false);

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) throw new Error('No project ID provided');
      const { data, error } = await supabase
        .from('projects')
        .select('*, full_description, image_url')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Project | null;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <PageLoader text="Loading project..." variant="orbit" />;
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
          <p className="text-white/60 mb-8">The project you're looking for doesn't exist.</p>
          <Link to="/projects">
            <Button className="bg-white/10 hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const projectTags =
    project.tech_tags?.filter((tag): tag is string => Boolean(tag && tag.trim())) ?? [];
  const fallbackDescription = project.full_description
    ? (() => {
        const plain = stripMarkdown(project.full_description ?? '');
        return plain.slice(0, 155) + (plain.length > 155 ? '...' : '');
      })()
    : 'Explore a highlighted data or AI project delivered by Imad Eddine El Mouss.';
  const metaDescription = project.description?.trim().length
    ? project.description.trim()
    : fallbackDescription;
  const breadcrumbTrail = [
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: project.title, url: `https://imadlab.me/projects/${project.id}` },
  ];
  const seoTitle = getSeoTitle(project.title);
  const coverImage = resolveImageUrl(project.image_url);
  const projectUrl = `https://imadlab.me/projects/${project.id}`;
  const projectStructuredData = {
    '@context': 'https://schema.org',
    '@type': project.repo_url ? 'SoftwareApplication' : 'TechArticle',
    name: seoTitle,
    headline: seoTitle,
    description: metaDescription,
    url: projectUrl,
    image: coverImage || undefined,
    keywords: projectTags.length ? projectTags.join(', ') : undefined,
    datePublished: project.created_at,
    dateModified: project.updated_at ?? project.created_at,
    author: {
      '@type': 'Person',
      name: 'Imad Eddine',
      url: 'https://imadlab.me',
    },
    applicationCategory: project.repo_url ? 'DeveloperApplication' : undefined,
    operatingSystem: project.repo_url ? 'Cross-platform' : undefined,
    offers: project.repo_url
      ? {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        }
      : undefined,
    codeRepository: project.repo_url || undefined,
  };

  const longForm = project.full_description ?? '';
  const enableMermaid = longForm.includes('```mermaid');
  const enableMath = /\$\$|\\\(|\\\[/.test(longForm);

  return (
    <div className="min-h-screen bg-black text-white pt-14">
      <SEO
        title={seoTitle}
        description={metaDescription}
        keywords={
          projectTags.length
            ? projectTags.join(', ')
            : 'data engineering, machine learning, ai, programming'
        }
        type="project"
        schemaType="CreativeWork"
        publishedTime={project.created_at}
        modifiedTime={project.updated_at ?? project.created_at}
        image={coverImage || undefined}
        imageAlt={seoTitle}
        tags={projectTags}
        breadcrumbs={breadcrumbTrail}
        structuredData={projectStructuredData}
        url={projectUrl}
      />

      <BackRow
        to="/projects"
        label="Back to Projects"
        icon={
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
        }
        right={
          project.repo_url ? (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                import('@/lib/events').then(({ logEvent }) =>
                  logEvent('repo_click', { project_id: project.id, repo_url: project.repo_url })
                ).catch(() => {});
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md text-white/90 hover:text-white transition-all duration-200 text-sm"
            >
              <Code className="w-4 h-4" />
              View Code
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : undefined
        }
      />

      {/* Hero Section - Simplified */}
      <header className="relative pt-8 md:pt-12 pb-10">
        <div className="container-narrow">
          {/* Project Title */}
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{seoTitle}</h1>

          {/* Project Metadata */}
          <div className="flex flex-wrap items-center gap-y-4 gap-x-6 mb-8">
            <div className="flex items-center text-sm text-white/70">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(project.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>

            {projectTags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-white/70">Technologies:</span>
                {(showAllTags ? projectTags : projectTags.slice(0, 3)).map((tag, index) => (
                  <Link
                    key={index}
to={tagToUrl(tag)}
                    className="px-2 py-1 text-xs bg-white/10 rounded-md text-white/90 hover:bg-white/20"
                  >
                    {tag}
                  </Link>
                ))}

                {projectTags.length > 3 && (
                  <button
                    onClick={() => setShowAllTags(!showAllTags)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                    aria-label={showAllTags ? 'Show fewer tags' : 'Show all tags'}
                  >
                    {showAllTags ? (
                      <>
                        <ChevronUp className="w-3 h-3 mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3 mr-1" />+{projectTags.length - 3} more
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Project Description */}
          {project.description && (
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-3xl">
              {project.description}
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
              alt={project.title}
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
        {project.full_description ? (
          <GfmMarkdown
            source={project.full_description}
            className="prose-lg"
            config={{ enableMermaid, enableMath }}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-white/60 mb-4">
              No detailed description available for this project.
            </div>
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-200"
              >
                <Code className="w-4 h-4" />
                View Source Code
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
        {/* Related Projects */}
        <RelatedProjects currentId={project.id} tags={projectTags} />
      </main>

      {/* Page footer removed; global Footer is used */}
    </div>
  );
};

export default ProjectDetail;
