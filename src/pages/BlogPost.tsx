import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Seo from '@/components/Seo';
import { MarkdownComponents, useReadingProgress, calculateReadingTime } from '@/components/MarkdownComponents';
import { PageLoader } from '@/components/ui/LoadingStates';

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
  const readingProgress = useReadingProgress();
  const [showAllTags, setShowAllTags] = useState(false);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data as Post | null;
    },
    enabled: !!slug
  });

  // Calculate reading time if not provided
  const estimatedReadTime = post?.body ? calculateReadingTime(post.body) : null;

  if (isLoading) {
    return <PageLoader text="Loading article..." variant="orbit" />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-white/60 mb-8">The article you're looking for doesn't exist.</p>
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
      <Seo 
        title={post.title} 
        description={post.excerpt || ''} 
        keywords={post.tags ? post.tags.join(', ') : 'data engineering, machine learning, ai, programming'}
        type="article"
        publishedTime={post.published_date}
        image={post.image_url || undefined}
      />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Navigation Bar */}
      <div className="sticky top-1 z-30 w-full backdrop-blur-md bg-black/70 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/blogs" className="inline-flex items-center text-white/80 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Blog
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-white/70 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {post.read_time || estimatedReadTime} min read
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Simplified */}
      <header className="relative pt-16 pb-12 md:pt-24 md:pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Post Title */}
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>
          
          {/* Post Metadata */}
          <div className="flex flex-wrap items-center gap-y-4 gap-x-6 mb-8">
            <div className="flex items-center text-sm text-white/70">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(post.published_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-white/70">Tags:</span>
                {(showAllTags ? post.tags : post.tags.slice(0, 3)).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-white/10 rounded-md text-white/90"
                  >
                    #{tag}
                  </span>
                ))}
                
                {post.tags.length > 3 && (
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
                        +{post.tags.length - 3} more
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Post Excerpt */}
          {post.excerpt && (
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {post.image_url && (
        <div className="w-full max-w-5xl mx-auto px-4 mb-12">
          <div className="aspect-video w-full overflow-hidden rounded-lg shadow-xl">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-16">
        {post.body ? (
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={MarkdownComponents}
            >
              {post.body}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-white/60 mb-4">No content available for this article.</div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/30 py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-white/60">
            Published on {new Date(post.published_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div className="flex items-center gap-6">
            <Link 
              to="/blogs" 
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              More articles
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPost;