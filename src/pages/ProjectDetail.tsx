import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Seo from '@/components/Seo';
import { MarkdownComponents } from '@/components/MarkdownComponents';

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
    <div className="min-h-screen bg-black text-white">
      <Seo title={project.title} description={project.description || ''} />

      {/* Hero Section */}
      <div className="relative w-full h-96 md:h-[500px] overflow-hidden">
        {project.image_url && (
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover opacity-50"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        {/* Sticky GitHub button */}
        {project.repo_url && (
          <div className="fixed top-8 right-8 z-40">
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-lg backdrop-blur-md">
                View on GitHub <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        )}
        <div className="absolute inset-0 flex items-end pb-16 px-4 md:px-8 max-w-4xl mx-auto">
          <div className="w-full">
            <Link to="/projects" className="inline-flex items-center text-white/60 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Link>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              {project.title}
            </h1>
            {project.tech_tags && project.tech_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-0"> {/* Remove extra space below tags */}
                {project.tech_tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-white/10 rounded-full text-white/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto py-12 px-4 md:px-8">
        <div className="bg-white/5 rounded-2xl shadow-xl border border-white/10 p-8 md:p-12">
          {project.full_description && (
            <div className="prose prose-invert prose-lg max-w-none mb-8 mt-0"> {/* Remove space above description */}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={MarkdownComponents}
              >
                {project.full_description}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
