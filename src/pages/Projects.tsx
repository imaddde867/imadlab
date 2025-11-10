import { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import CardItem from '@/components/ui/CardItem';
import { ArrowLeft } from 'lucide-react';
import Seo from '@/components/Seo';
import { GridSkeleton } from '@/components/ui/LoadingStates';
import NewsletterSignup from '@/components/NewsletterSignup';
import { readPrerenderData } from '@/lib/prerender-data';
import SectionHeader from '@/components/SectionHeader';
import { tagToUrl } from '@/lib/tags';

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

const Projects = () => {
  const initialProjects = useMemo(() => readPrerenderData<Project[]>('projects'), []);
  const initialUpdatedAt = useRef<number | undefined>(initialProjects ? Date.now() : undefined);

  const {
    data: projects = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
    initialData: initialProjects,
    initialDataUpdatedAt: initialUpdatedAt.current,
    staleTime: 1000 * 60,
  });

  const isSkeletonVisible = isLoading && !projects.length && !isFetching;

  // Popular project tags (top 12)
  const popularTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      if (Array.isArray(p.tech_tags)) for (const t of p.tech_tags) {
        const key = t.trim();
        if (!key) continue;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);
  }, [projects]);

  const projectListSchema =
    projects.length > 0
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Projects list',
            itemListOrder: 'Descending',
            numberOfItems: projects.length,
            itemListElement: projects.map((project, index) => ({
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
      <Seo
        title="Projects"
        description="Explore a collection of my projects in data engineering, AI, and machine learning. See live demos and browse the source code."
        keywords="data engineering projects, machine learning projects, ai projects, python projects, react projects, open source, github projects, portfolio projects"
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

        {popularTags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm text-white/60 mb-3">Popular tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Link key={tag} to={tagToUrl(tag)} className="px-2 py-1 text-xs bg-white/10 rounded-md text-white/90 hover:bg-white/20">
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {isSkeletonVisible ? (
          <GridSkeleton count={6} columns={3} />
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
