import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import CardItem from '@/components/ui/CardItem';
import { ArrowLeft } from 'lucide-react';
import Seo from '@/components/Seo';
import NewsletterSignup from '@/components/NewsletterSignup';

interface Post {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  excerpt: string | null;
  tags: string[] | null;
  published_date: string;
  created_at: string;
  read_time: number | null;
  image_url: string | null;
}

const Blogs = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('published_date', { ascending: false });
      
      if (error) throw error;
      return data as Post[];
    }
  });

  return (
    <div className="min-h-screen bg-black text-white py-24 px-4">
      <Seo
        title="Blog"
        description="Read articles and tutorials on data engineering, AI, machine learning, and more. Stay up-to-date with the latest trends and technologies."
        keywords="data engineering blog, machine learning tutorials, ai articles, python tutorials, tech blog, data science articles, programming tutorials"
        type="website"
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
            <h1 className="text-5xl md:text-6xl font-black mb-4">Blog</h1>
            <div className="w-24 h-1 bg-white/40"></div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-white/60">Loading posts...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts?.map((post) => (
              <CardItem
                key={post.id}
                title={post.title}
                tags={post.tags || []}
                date={new Date(post.published_date).toLocaleDateString()}
                excerpt={post.excerpt || ''}
                linkTo={`/blogs/${post.slug}`}
                linkLabel="Read More"
                isBlog={true}
                readTime={post.read_time || undefined}
                image_url={post.image_url || undefined}
              />
            ))}
          </div>
        )}

        {posts && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/60 mb-4">No posts yet</div>
          </div>
        )}
      </div>
      
      {/* Newsletter signup component */}
      <NewsletterSignup className="mt-16" />
    </div>
  );
};

export default Blogs;
