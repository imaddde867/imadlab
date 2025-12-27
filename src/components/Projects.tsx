import { useMemo, useRef, type CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProjectCard from '@/components/ProjectCard';
import SectionHeader from '@/components/SectionHeader';
import { GridSkeleton } from '@/components/ui/LoadingStates';
import { useIsCoarsePointer } from '@/hooks/useIsCoarsePointer';
import { readPrerenderData } from '@/lib/prerender-data';
import { PROJECT_LIST_SELECT } from '@/lib/content-selects';
import type { ProjectSummary } from '@/types/content';

const Projects = () => {
  const initialProjects = useMemo(
    () => readPrerenderData<ProjectSummary[]>('projects')?.slice(0, 3),
    []
  );
  const initialUpdatedAt = useRef<number | undefined>(
    initialProjects?.length ? Date.now() : undefined
  );
  const isCoarsePointer = useIsCoarsePointer();
  const {
    data: projects = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['projects', 'latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(PROJECT_LIST_SELECT)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as ProjectSummary[];
    },
    initialData: initialProjects?.length ? initialProjects : undefined,
    initialDataUpdatedAt: initialUpdatedAt.current,
    staleTime: 1000 * 60,
  });
  const showSkeleton = (isLoading || isFetching) && projects.length === 0;
  const dots = useMemo(() => {
    const count = isCoarsePointer ? 15 : 50;
    return Array.from({ length: count }, () => {
      const size = Math.random() * 8 + 4;
      const opacity = Math.random() * 0.7 + 0.3;
      const translateX = (Math.random() - 0.5) * 200;
      const translateY = (Math.random() - 0.5) * 200;

      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: `${opacity}`,
        animationDelay: `${Math.random() * 10}s`,
        '--tw-translate-x': `${translateX}px`,
        '--tw-translate-y': `${translateY}px`,
      } satisfies CSSProperties & {
        '--tw-translate-x'?: string;
        '--tw-translate-y'?: string;
      };
    });
  }, [isCoarsePointer]);

  return (
    <section id="projects" className="section relative overflow-hidden scroll-mt-20">
      {/* Modern background inspired by Hero */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {/* Animated background glow (stronger) */}
        <div
          className="absolute inset-0 opacity-35 animate-subtle-flicker"
          style={{
            background:
              'radial-gradient(800px circle at 50% 30%, rgba(255,255,255,0.12), transparent 55%)',
          }}
        />
        {/* Background dots (larger, more opaque) */}
        {dots.map((style, i) => (
          <div
            key={i}
            className="absolute bg-white/40 rounded-full animate-dot-move"
            style={style}
          />
        ))}
        {/* Asymmetrical grid lines (thicker, more visible) */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 left-0 w-full h-px bg-white"></div>
          <div className="absolute top-2/3 left-0 w-2/3 h-px bg-white"></div>
          <div className="absolute left-1/4 top-0 w-px h-full bg-white"></div>
          <div className="absolute right-1/3 top-0 w-px h-2/3 bg-white"></div>
        </div>
      </div>

      <div className="container-site">
        <div className="ml-8 lg:ml-16 flex items-center justify-between">
          <div className="w-full max-w-xl">
            <SectionHeader
              eyebrow="Latest"
              title={<span className="ml-0">Projects</span>}
            />
          </div>
          <a
            href="/projects"
            className="link-enhanced focus-enhanced mr-4 mt-4 md:mt-0 md:mr-8 ml-12 md:ml-0"
          >
            View all projects
          </a>
        </div>

        {/* 4-column grid layout for projects, matching /projects page */}
        {showSkeleton ? (
          <GridSkeleton count={3} columns={3} className="gap-8" />
        ) : projects.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                linkTo={`/projects/${project.id}`}
                linkLabel="View Project"
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-white/60">No projects yet.</div>
        )}
      </div>
    </section>
  );
};

export default Projects;
