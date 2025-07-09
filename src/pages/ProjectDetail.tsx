import React, { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowUpRight, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Seo from '@/components/Seo';

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

  // Custom markdown renderers
  const MarkdownComponents = {
    img: ({ node, ...props }: any) => (
      <img
        {...props}
        style={{
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
          maxWidth: '100%',
          height: 'auto',
        }}
        className="my-8 rounded-xl shadow-lg"
        alt={props.alt || ''}
      />
    ),
    code: ({ node, inline = false, className, children, ...props }: { node: any; inline?: boolean; className?: string; children: React.ReactNode }) => {
      const codeRef = useRef<HTMLPreElement>(null);
      const [copied, setCopied] = React.useState(false);
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      const handleCopy = () => {
        if (codeRef.current) {
          navigator.clipboard.writeText(codeString);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }
      };
      if (inline) {
        return (
          <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm" {...props}>
            {children}
          </code>
        );
      }
      return (
        <div className="relative my-6 max-w-none group">
          <pre
            ref={codeRef}
            className={
              `overflow-x-auto p-4 text-sm font-mono bg-transparent border-0 text-white/90 max-w-none` +
              (className ? ` ${className}` : '')
            }
            style={{
              background: 'black',
              border: 'none',
              boxShadow: 'none',
            }}
          >
            <code {...props}>{children}</code>
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-xs px-2 py-1 rounded transition-colors border border-white/10 text-white shadow focus:outline-none focus:ring-2 focus:ring-white/30 flex items-center justify-center"
            title={copied ? 'Copied!' : 'Copy code'}
            type="button"
            aria-label={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" aria-hidden="true" />
            ) : (
              <Copy className="w-4 h-4 text-white/80" aria-hidden="true" />
            )}
            <span className="sr-only">{copied ? 'Copied!' : 'Copy code'}</span>
          </button>
        </div>
      );
    },
  };

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
        <div className="absolute top-6 right-8 z-20">
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-lg">
                View on GitHub <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          )}
        </div>
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
