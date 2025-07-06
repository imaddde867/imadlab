
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Post {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  excerpt: string | null;
  tags: string[] | null;
  published_date: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

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
          <Link to="/blog">
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
    <div className="min-h-screen bg-black text-white py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/blog" className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        <article>
          <header className="mb-12">
            <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
              <Calendar className="w-4 h-4" />
              {new Date(post.published_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              {post.title}
            </h1>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
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
          </header>

          {post.body && (
            <div className="prose prose-invert prose-lg max-w-none">
              <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
                {post.body}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

export default BlogPost;
