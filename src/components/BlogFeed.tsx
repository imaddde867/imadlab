import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

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
				<div className="mb-20 ml-8 lg:ml-16">
					<h2 className="text-5xl md:text-7xl font-black mb-4">
						Latest
						<br />
						<span className="ml-8 text-white/60">Insights</span>
					</h2>
					<div className="w-24 h-1 bg-white/40 ml-8"></div>
				</div>

				{/* 4-column grid layout for blogs, matching Latest Projects */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
					{blogPosts.map((post, index) => (
						<Link
							key={index}
							to={`/blog/${post.title.toLowerCase().replace(/ /g, '-')}`}
							className="group"
							onMouseEnter={() => setHoveredPost(index)}
							onMouseLeave={() => setHoveredPost(null)}
						>
							<article
								className={`
                  relative p-8 bg-white/[0.02] border border-white/10 rounded-2xl
                  transition-all duration-500 cursor-pointer flex flex-col h-full
                  ${hoveredPost === index
										? 'bg-white/[0.05] border-white/30 -translate-y-2'
										: 'hover:bg-white/[0.03] hover:border-white/20'
									}
                `}
							>
								{/* Glow effect */}
								<div
									className={`
                    absolute inset-0 rounded-2xl transition-opacity duration-500
                    ${hoveredPost === index
										? 'bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.04] opacity-100'
										: 'opacity-0'
									}
                  `}
								/>
								<div className="relative z-10 flex flex-col h-full">
									{/* Category and date */}
									<div className="flex items-center justify-between mb-4 text-sm">
										<span className="px-3 py-1 bg-white/10 rounded-full border border-white/20 font-medium">
											{post.category}
										</span>
										<span className="text-white/50">{post.date}</span>
									</div>
									{/* Title */}
									<h3 className="text-xl lg:text-2xl font-bold mb-4 leading-tight">
										{post.title}
									</h3>
									{/* Excerpt */}
									<p className="text-white/70 text-base leading-relaxed mb-6 flex-1">
										{post.excerpt}
									</p>
									{/* Footer */}
									<div className="flex items-center justify-between mt-auto">
										<span className="text-white/50 text-sm">{post.readTime}</span>
										<Link
											to={`/blog/${post.title.toLowerCase().replace(/ /g, '-')}`}
											className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white transition-colors group"
										>
											<span>Read More</span>
											<ArrowUp className="w-4 h-4 rotate-45 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
										</Link>
									</div>
								</div>
							</article>
						</Link>
					))}
				</div>
				{/* View all link aligned right like projects */}
				<div className="flex justify-end mt-16 mr-4 md:mr-8">
					<Link
						to="/blog"
						className="inline-flex items-center gap-3 px-6 py-3 border border-white/20 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-white/5 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
						tabIndex={0}
					>
						<span>View All Posts</span>
						<ArrowUp className="w-4 h-4 rotate-45" />
					</Link>
				</div>
			</div>
		</section>
	);
};

export default BlogFeed;
