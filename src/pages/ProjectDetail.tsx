import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, Code, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showAllTags, setShowAllTags] = useState(false);

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

      {/* Navigation Bar */}
      <div className="sticky top-0 z-30 w-full backdrop-blur-md bg-black/70 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/projects" className="inline-flex items-center text-white/80 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Projects
          </Link>
          
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md text-white/90 hover:text-white transition-all duration-200 text-sm"
            >
              <Code className="w-4 h-4" />
              <span>View Code</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Hero Section - Simplified */}
      <header className="relative pt-16 pb-12 md:pt-24 md:pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Project Title */}
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {project.title}
          </h1>
          
          {/* Project Metadata */}
          <div className="flex flex-wrap items-center gap-y-4 gap-x-6 mb-8">
            <div className="flex items-center text-sm text-white/70">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(project.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            
            {project.tech_tags && project.tech_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-white/70">Technologies:</span>
                {(showAllTags ? project.tech_tags : project.tech_tags.slice(0, 3)).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-white/10 rounded-md text-white/90"
                  >
                    {tag}
                  </span>
                ))}
                
                {project.tech_tags.length > 3 && (
                  <button
                    onClick={() => setShowAllTags(!showAllTags)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                    aria-label={showAllTags ? "Show fewer tags" : "Show all tags"}
                  >
                    {showAllTags ? (
                      <>
                        <ChevronUp className="w-3 h-3 mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3 mr-1" />
                        +{project.tech_tags.length - 3} more
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
      {project.image_url && (
        <div className="w-full max-w-5xl mx-auto px-4 mb-12">
          <div className="aspect-video w-full overflow-hidden rounded-lg shadow-xl">
            <img
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-16">
        {project.full_description ? (
          <div className="prose prose-invert prose-lg max-w-none">
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-200"
              >
                <Code className="w-4 h-4" />
                View Source Code
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/30 py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-white/60">
            Project created on {new Date(project.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div className="flex items-center gap-6">
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
      </footer>
    </div>
  );
};

export default ProjectDetail;