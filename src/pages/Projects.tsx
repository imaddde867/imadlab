import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import { GridSkeleton } from '@/components/ui/LoadingStates';
import NewsletterSignup from '@/components/NewsletterSignup';
import { readPrerenderData } from '@/lib/prerender-data';
import SectionHeader from '@/components/SectionHeader';
import { getTopTags, tagToUrl } from '@/lib/tags';
import { PROJECT_LIST_SELECT } from '@/lib/content-selects';
import type { ProjectSummary } from '@/types/content';
import ProjectCard from '@/components/ProjectCard';

type ProjectSort = 'newest' | 'title-asc' | 'title-desc';

const Projects = () => {
  const initialProjects = useMemo(() => readPrerenderData<ProjectSummary[]>('projects'), []);
  const initialUpdatedAt = useRef<number | undefined>(
    initialProjects?.length ? Date.now() : undefined
  );
  const [sortBy, setSortBy] = useState<ProjectSort>('newest');

  const {
    data: projects = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(PROJECT_LIST_SELECT)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectSummary[];
    },
    initialData: initialProjects?.length ? initialProjects : undefined,
    initialDataUpdatedAt: initialUpdatedAt.current,
    staleTime: 1000 * 60,
  });

  const isSkeletonVisible = isLoading && !projects.length && !isFetching;

  const sortedProjects = useMemo(() => {
    if (projects.length <= 1) return projects;
    const list = [...projects];
    const getCreatedTime = (project: ProjectSummary) => new Date(project.created_at).getTime();
    switch (sortBy) {
      case 'title-asc':
        return list.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
      case 'title-desc':
        return list.sort((a, b) => b.title.localeCompare(a.title, undefined, { sensitivity: 'base' }));
      case 'newest':
      default:
        return list.sort((a, b) => getCreatedTime(b) - getCreatedTime(a));
    }
  }, [projects, sortBy]);

  // Popular project tags (top 12)
  const popularTags = useMemo(() => getTopTags(projects, (project) => project.tech_tags), [projects]);

  const projectItemOrder = sortBy === 'title-asc' ? 'Ascending' : 'Descending';
  const projectListSchema =
    sortedProjects.length > 0
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Projects list',
            itemListOrder: projectItemOrder,
            numberOfItems: sortedProjects.length,
            itemListElement: sortedProjects.map((project, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `https://imadlab.me/projects/${project.id}`,
              name: project.title,
              description: project.description ?? undefined,
            })),
          },
        ]
      : undefined;

  return (
    <div className="min-h-screen bg-black text-white section pt-14">
      <SEO
        title="Projects"
        description="Selected applied research projects in multimodal industrial AI, procedural knowledge extraction, and deployable data/ML systems."
        keywords="industrial ai projects, applied research engineering, multimodal data fusion projects, procedural knowledge extraction, deployable ai systems, edge-to-cloud architecture"
        type="website"
        schemaType="CollectionPage"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Projects', path: '/projects' },
        ]}
        additionalSchemas={projectListSchema}
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
          <SectionHeader title={<span className="text-brand-gradient">Projects</span>} />
        </div>

        {(popularTags.length > 0 || projects.length > 1) && (
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
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {projects.length > 1 && (
              <div className="flex items-center gap-2 text-xs text-white/60 md:pt-1">
                <label className="flex items-center gap-2">
                  Sort by
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as ProjectSort)}
                className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/90 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="newest">Newest</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>
                </label>
              </div>
            )}
          </div>
        )}

        {isSkeletonVisible ? (
          <GridSkeleton count={6} columns={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-default">
            {sortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                linkTo={`/projects/${project.id}`}
                linkLabel="View Project"
              />
            ))}
          </div>
        )}

        {!isSkeletonVisible && projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/60 mb-4">No projects yet</div>
          </div>
        )}

        <NewsletterSignup />
      </div>
    </div>
  );
};

export default Projects;
