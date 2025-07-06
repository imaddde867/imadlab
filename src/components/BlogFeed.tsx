import { Link } from 'react-router-dom';
import CardItem from '@/components/ui/CardItem';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

const BlogFeed = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, image_url')
        .order('published_date', { ascending: false });
      
      if (error) throw error;
      return data as Post[];
    }
  });

	return (
		<section className="py-24 px-4 relative">
			{/* Background elements */}
			<div className="absolute inset-0 opacity-5">
				<div className="absolute top-1/4 left-0 w-2/3 h-px bg-white"></div>
				<div className="absolute bottom-1/3 right-1/4 w-1/2 h-px bg-white"></div>
				<div className="absolute right-1/3 top-0 w-px h-full bg-white"></div>
			</div>

			<div className="max-w-7xl mx-auto">
				{/* Section header */}
				<div className="mb-20 ml-8 lg:ml-16 flex items-center justify-between">
					<div>
						<h2 className="text-5xl md:text-7xl font-black mb-4">
							Latest
							<br />
							<span className="ml-8 text-white/60">Insights</span>
						</h2>
						<div className="w-24 h-1 bg-white/40 ml-8"></div>
					</div>
					<Link
  to="/blogs"
  className="text-white/70 hover:text-white text-base font-medium transition-colors duration-200 mr-4 mt-4 md:mt-0 md:mr-8 ml-12 md:ml-0"
>
  View all posts
</Link>
				</div>

				{/* 4-column grid layout for blogs, matching Latest Projects */}
				{isLoading ? (
					<div className="text-center py-12">
						<div className="text-white/60">Loading posts...</div>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{posts?.slice(0, 3).map((post) => (
							<CardItem
								key={post.id}
								title={post.title}
								tags={post.tags || []}
								date={new Date(post.published_date).toLocaleDateString()}
								excerpt={post.excerpt || ''}
								linkTo={`/blogs/${post.slug}`}
								linkLabel="Read More"
								readTime={post.read_time || undefined}
								isBlog={true}
								image_url={post.image_url || undefined}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
};

export default BlogFeed;
