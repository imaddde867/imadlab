import { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import { EntryList, Page, PageTitle } from '@/components/layout/Page';
import { readPrerenderData } from '@/lib/prerender-data';
import { PROJECT_LIST_SELECT } from '@/lib/content-selects';
import type { ProjectSummary } from '@/types/content';

const Projects = () => {
  const initialProjects = useMemo(() => readPrerenderData<ProjectSummary[]>('projects'), []);
  const initialUpdatedAt = useRef<number | undefined>(
    initialProjects?.length ? Date.now() : undefined
  );

  const { data: projects = [], isLoading } = useQuery({
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

  // Same order as the homepage: the thesis first, then newest.
  const sortedProjects = useMemo(
    () =>
      [...projects].sort(
        (a, b) =>
          Number(b.title.startsWith('IPKE')) - Number(a.title.startsWith('IPKE')) ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [projects]
  );

  const projectListSchema =
    sortedProjects.length > 0
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Projects list',
            itemListOrder: 'Descending',
            numberOfItems: sortedProjects.length,
            itemListElement: sortedProjects.map((project, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `https://imadlab.com/projects/${project.id}`,
              name: project.title,
              description: project.description ?? undefined,
            })),
          },
        ]
      : undefined;

  return (
    <Page>
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
      <PageTitle
        title="Projects"
        description="Selected applied research projects in multimodal industrial AI, procedural knowledge extraction, and deployable data/ML systems."
      />
      {isLoading && projects.length === 0 ? (
        <p className="text-[color:var(--nd-ink-3)]">Loading…</p>
      ) : (
        <EntryList
          entries={sortedProjects.map((p) => ({
            key: p.id,
            to: `/projects/${p.id}`,
            title: p.title,
            description: p.description,
            meta: p.tech_tags?.slice(0, 4).join(', '),
          }))}
        />
      )}
    </Page>
  );
};

export default Projects;
