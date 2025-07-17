import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowUpRight, Calendar, Code, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Seo from '@/components/Seo';
import { MarkdownComponents } from '@/components/MarkdownComponents';
import { PageLoader } from '@/components/ui/LoadingStates';

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

  return (
    <div className="min-h-screen bg-black text-white">
      <Seo 
        title={project.title} 
        description={project.description || ''} 
        keywords={project.tech_tags ? project.tech_tags.join(', ') : 'data engineering, machine learning, ai, programming'}
        type="article"
        publishedTime={project.created_at}
        image={project.image_url || undefined}
      />

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
        
        {/* Floating GitHub button */}
        {project.repo_url && (
          <div className="absolute top-8 right-8 z-20">
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-black/60 hover:border-white/30 transition-all duration-300 shadow-lg"
            >
              <Code className="w-4 h-4" />
              <span className="text-sm font-medium">View Code</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
        
        <div className="absolute inset-0 flex items-end pb-16 px-4 md:px-8 max-w-4xl mx-auto">
          <div className="w-full">
            <Link to="/projects" className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors group">
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Projects
            </Link>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
              {project.title}
            </h1>
            
            {/* Enhanced metadata section */}
            <div className="flex flex-wrap items-center gap-4 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              {project.tech_tags && project.tech_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tech_tags.slice(0, 4).map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-white/15 rounded-full text-white/90 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tech_tags.length > 4 && (
                    <span className="px-3 py-1 text-sm bg-white/10 rounded-full text-white/70">
                      +{project.tech_tags.length - 4}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(project.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Project
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section with enhanced typography */}
      <div className="max-w-4xl mx-auto py-16 px-4 md:px-8">
        <article className="bg-white/5 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Project description if available */}
          {project.description && (
            <div className="px-8 md:px-12 pt-8 md:pt-12 pb-6 border-b border-white/10">
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed italic font-light">
                {project.description}
              </p>
            </div>
          )}
          
          {/* Main content */}
          <div className="px-8 md:px-12 py-8 md:py-12">
            {project.full_description ? (
              <div className="prose prose-invert prose-xl max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={MarkdownComponents}
                >
                  {project.full_description}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-white/60 mb-4">No detailed description available for this project.</div>
                {project.repo_url && (
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all duration-300 border border-white/10 hover:border-white/20"
                  >
                    <Code className="w-4 h-4" />
                    View Source Code
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
          
          {/* Project footer */}
          <div className="px-8 md:px-12 py-6 bg-white/5 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">
                Created on {new Date(project.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-4">
                {project.repo_url && (
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                  >
                    <Code className="w-4 h-4" />
                    Source Code
                  </a>
                )}
                <Link 
                  to="/projects" 
                  className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  More projects
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ProjectDetail;
