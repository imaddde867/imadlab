import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading, error } = useQuery({
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
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/60">Loading project details...</div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-black text-white py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/projects" className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Link>

        <article>
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              {project.title}
            </h1>

            {project.tech_tags && project.tech_tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {project.tech_tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-1 text-sm bg-white/10 rounded-full text-white/80 border border-white/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {project.image_url && (
            <div className="mb-8">
              <img src={project.image_url} alt={project.title} className="w-full h-auto object-cover rounded-lg" loading="lazy" />
            </div>
          )}

          {project.full_description && (
            <div className="prose prose-invert prose-lg max-w-none mb-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.full_description}</ReactMarkdown>
            </div>
          )}

          {project.repo_url && (
            <div className="mt-8 flex justify-center">
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white">
                  View on GitHub <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              </a>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

export default ProjectDetail;
