import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import CardItem from '@/components/ui/CardItem';
import { ArrowLeft } from 'lucide-react';
import Seo from '@/components/Seo';
import { GridSkeleton } from '@/components/ui/LoadingStates';
import NewsletterSignup from '@/components/NewsletterSignup';

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
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Project[];
    }
  });

  const projectListSchema = projects && projects.length > 0 ? [
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
        description: project.description ?? undefined
      }))
    }
  ] : undefined;

  return (
    <div className="min-h-screen bg-black text-white py-24 px-4">
      <Seo
        title="Projects"
        description="Explore a collection of my projects in data engineering, AI, and machine learning. See live demos and browse the source code."
        keywords="data engineering projects, machine learning projects, ai projects, python projects, react projects, open source, github projects, portfolio projects"
        type="website"
        schemaType="CollectionPage"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Projects', path: '/projects' }
        ]}
        additionalSchemas={projectListSchema}
      />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-black mb-4">Projects</h1>
            <div className="w-24 h-1 bg-white/40"></div>
          </div>
        </div>

        {isLoading ? (
          <GridSkeleton count={6} columns={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
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

        {projects && projects.length === 0 && (
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
