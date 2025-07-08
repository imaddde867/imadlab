import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, Clock, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import React, { useRef } from 'react';

interface Post {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  excerpt: string | null;
  tags: string[] | null;
  published_date: string;
  read_time: number | null;
  image_url: string | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      const { data, error } = await supabase
        .from('posts')
        .select('*, image_url')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data as Post | null;
    },
    enabled: !!slug
  });

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
        className="my-8 rounded-xl shadow-lg border border-white/10"
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
              `rounded-xl overflow-x-auto p-4 text-sm font-mono bg-[#18181b] border border-white/10 text-white/90 max-w-none transition-shadow group-hover:shadow-2xl` +
              (className ? ` ${className}` : '')
            }
            style={{
              background: '#18181b',
              border: '1px solid rgba(255,255,255,0.08)',
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/60">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-white/60 mb-8">The post you're looking for doesn't exist.</p>
          <Link to="/blogs">
            <Button className="bg-white/10 hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative w-full h-96 md:h-[500px] overflow-hidden">
        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute top-6 right-8 z-20">
          {/* You can add a button here if needed for blogs, currently left empty */}
        </div>
        <div className="absolute inset-0 flex items-end pb-16 px-4 md:px-8 max-w-4xl mx-auto">
          <div className="w-full">
            <Link to="/blogs" className="inline-flex items-center text-white/60 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
            {/* Schema.org JSON-LD for BlogPosting */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": post.title,
                "description": post.excerpt || (post.body ? post.body.substring(0, 160) + '...' : ''),
                "image": post.image_url,
                "datePublished": post.published_date,
                "author": {
                  "@type": "Person",
                  "name": "Imad Eddine"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "ImadLab",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://imad.dev/android-chrome-192x192.png"
                  }
                },
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": `https://imad.dev/blogs/${post.slug}`
                },
                "articleBody": post.body
              })
            }} />
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              {post.title}
            </h1>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-0"> {/* Remove extra space below tags */}
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-white/10 rounded-full text-white/80"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.published_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              {post.read_time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.read_time} min read
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto py-12 px-4 md:px-8">
        <div className="bg-white/5 rounded-2xl shadow-xl border border-white/10 p-8 md:p-12">
          {post.body && (
            <div className="prose prose-invert prose-lg max-w-none mb-8 mt-0"> {/* Remove space above description */}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={MarkdownComponents}
              >
                {post.body}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
