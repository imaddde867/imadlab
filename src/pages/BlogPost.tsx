import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, Clock, BookOpen } from 'lucide-react';
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
      <Seo 
        title={post.title} 
        description={post.excerpt || ''} 
        keywords={post.tags ? post.tags.join(', ') : 'data engineering, machine learning, ai, programming'}
        type="article"
        publishedTime={post.published_date}
        image={post.image_url || undefined}
      />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

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
        <div className="absolute inset-0 flex items-end pb-16 px-4 md:px-8 max-w-4xl mx-auto">
          <div className="w-full">
            <Link to="/blogs" className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors group">
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Blog
            </Link>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
              {post.title}
            </h1>
            
            {/* Enhanced metadata section */}
            <div className="flex flex-wrap items-center gap-4 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-white/15 rounded-full text-white/90 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="px-3 py-1 text-sm bg-white/10 rounded-full text-white/70">
                      +{post.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm text-white/70">
                {post.published_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.published_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.read_time || estimatedReadTime} min read
                </div>
                
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Article
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section with enhanced typography */}
      <div className="max-w-4xl mx-auto py-16 px-4 md:px-8">
        <article className="bg-white/5 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Article excerpt if available */}
          {post.excerpt && (
            <div className="px-8 md:px-12 pt-8 md:pt-12 pb-6 border-b border-white/10">
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed italic font-light">
                {post.excerpt}
              </p>
            </div>
          )}
          
          {/* Main content */}
          <div className="px-8 md:px-12 py-8 md:py-12">
            {post.body && (
              <div className="prose prose-invert prose-xl max-w-none">
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
          
          {/* Article footer */}
          <div className="px-8 md:px-12 py-6 bg-white/5 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">
                Published on {new Date(post.published_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <Link 
                to="/blogs" 
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                More articles
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPost;
