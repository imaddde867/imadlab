import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

const blogPosts = [
	{
		title: 'Building Scalable Data Pipelines with Apache Kafka',
		date: '2024-12-15',
		category: 'Data Engineering',
		excerpt: 'Deep dive into creating fault-tolerant, high-throughput data streaming architectures...',
		readTime: '8 min read'
	},
	{
		title: 'The Future of AI in Maritime Intelligence',
		date: '2024-11-28',
		category: 'AI/ML',
		excerpt: 'How computer vision and predictive analytics are revolutionizing shipping logistics...',
		readTime: '6 min read'
	},
	{
		title: 'Zero-Downtime Database Migrations at Scale',
		date: '2024-11-10',
		category: 'Infrastructure',
		excerpt: 'Strategies for migrating petabyte-scale databases without service interruption...',
		readTime: '10 min read'
	},
	{
		title: 'Optimizing ML Model Inference for Real-Time Applications',
		date: '2024-10-22',
		category: 'AI/ML',
		excerpt: 'Techniques for reducing latency and improving throughput in production ML systems...',
		readTime: '7 min read'
	}
];

const BlogFeed = () => {
	const [hoveredPost, setHoveredPost] = useState<number | null>(null);

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
					<a
						href="/blog"
						className="text-white/70 hover:text-white text-base font-medium transition-colors duration-200 mr-4 mt-4 md:mt-0 md:mr-8 ml-12 md:ml-0"
					>
						View all posts
					</a>
				</div>

				{/* 4-column grid layout for blogs, matching Latest Projects */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
					{blogPosts.map((post, index) => (
						<Card key={index} className="relative bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/30 transition-all duration-300 group">
							<CardHeader>
								<CardTitle className="flex items-start justify-between text-white">
									<span className="text-xl font-bold">{post.title}</span>
									<Link to={`/blog/${post.title.toLowerCase().replace(/ /g, '-')}`}
										className="text-white/60 hover:text-white hover:bg-transparent text-sm font-medium px-2 py-1 rounded"
									>
										Read More
									</Link>
								</CardTitle>
							</CardHeader>
							<CardContent className="pb-12">
								<div className="flex flex-wrap gap-2 mb-4">
									<span className="px-2 py-1 text-xs bg-white/10 rounded-full text-white font-medium">
										{post.category}
									</span>
									<span className="text-white/50 text-xs ml-auto">{post.date}</span>
								</div>
								<p className="text-white/80 mb-4 leading-relaxed">
									{post.excerpt}
								</p>
								<div className="flex items-center justify-between mt-auto">
									<span className="text-white/50 text-sm">{post.readTime}</span>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
};

export default BlogFeed;
