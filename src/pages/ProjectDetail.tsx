import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import { Page, PageTitle } from '@/components/layout/Page';
import { PageLoader } from '@/components/ui/LoadingStates';
import { stripMarkdown } from '@/lib/markdown-utils';
import { tagToUrl } from '@/lib/tags';
import { GfmMarkdown } from '@/components/markdown/GfmMarkdown';
import { getSeoTitle } from '@/lib/seo-utils';
import { resolveImageUrl } from '@/lib/image-utils';
import { PROJECT_DETAIL_SELECT } from '@/lib/content-selects';
import type { ProjectDetail as ProjectDetailType } from '@/types/content';
import { parseGithubRepo } from '@/lib/github';
import { readPrerenderData } from '@/lib/prerender-data';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const initialProject = useMemo(
    () => (id ? readPrerenderData<ProjectDetailType>(`project:${id}`) : undefined),
    [id]
  );
  const initialUpdatedAt = useRef<number | undefined>(initialProject ? Date.now() : undefined);

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
        .select(PROJECT_DETAIL_SELECT)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as ProjectDetailType | null;
    },
    enabled: !!id,
    initialData: initialProject,
    initialDataUpdatedAt: initialUpdatedAt.current,
  });

  if (isLoading) {
    return <PageLoader text="Loading project..." variant="orbit" />;
  }

  if (error || !project) {
    return (
      <Page>
        <PageTitle
          title="Project not found"
          description="The project you're looking for doesn't exist."
          back={{ to: '/projects', label: 'Projects' }}
        />
      </Page>
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
    { name: project.title, url: `https://imadlab.com/projects/${project.id}` },
  ];
  const seoTitle = getSeoTitle(project.title);
  const coverImage = resolveImageUrl(project.image_url);
  const projectUrl = `https://imadlab.com/projects/${project.id}`;
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
      url: 'https://imadlab.com',
    },
    sameAs: [project.repo_url, project.demo_url].filter(Boolean),
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
  const repoRef = parseGithubRepo(project.repo_url);
  const repository = repoRef ? { owner: repoRef.owner, name: repoRef.repo } : undefined;
  const logClick = (event: string, data: Record<string, unknown>) => {
    import('@/lib/events')
      .then(({ logEvent }) => logEvent(event, { project_id: project.id, ...data }))
      .catch(() => {});
  };

  return (
    <Page>
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
      <PageTitle title={seoTitle} back={{ to: '/projects', label: 'Projects' }}>
        <p className="mt-4 text-sm text-[color:var(--nd-ink-3)]">
          {new Date(project.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
          })}
          {projectTags.length > 0 && ' · '}
          {projectTags.map((tag, i) => (
            <span key={tag}>
              {i > 0 && ', '}
              <Link to={tagToUrl(tag)} className="nd-quiet-link whitespace-nowrap">
                {tag}
              </Link>
            </span>
          ))}
        </p>
        {project.description && (
          <p className="mt-6 text-lg text-[color:var(--nd-ink-2)]">{project.description}</p>
        )}
        {(project.repo_url || project.demo_url) && (
          <p className="mt-4 flex gap-5">
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => logClick('repo_click', { repo_url: project.repo_url })}
                className="nd-link"
              >
                Source code
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => logClick('demo_click', { demo_url: project.demo_url })}
                className="nd-link"
              >
                Live demo
              </a>
            )}
          </p>
        )}
      </PageTitle>

      {coverImage && (
        <figure className="mb-10">
          <img
            src={coverImage}
            alt={project.title}
            className="w-full rounded-md border border-[color:var(--nd-line)]"
            loading="lazy"
            decoding="async"
          />
        </figure>
      )}

      <article className="border-t border-[color:var(--nd-line)] pt-10">
        {project.full_description ? (
          <GfmMarkdown
            source={project.full_description}
            repository={repository}
            config={{ enableMermaid }}
          />
        ) : (
          <p className="text-[color:var(--nd-ink-3)]">
            No detailed description available for this project.
          </p>
        )}
      </article>
    </Page>
  );
};

export default ProjectDetail;
