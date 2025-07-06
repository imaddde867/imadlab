import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Project {
	id: string;
	title: string;
	tech_tags: string[] | null;
	description: string | null;
	link: string | null;
	featured?: boolean;
}

const Projects = () => {
	const [projects, setProjects] = useState<Project[]>([]);
	const [hoveredProject, setHoveredProject] = useState<number | null>(null);

	useEffect(() => {
		const fetchProjects = async () => {
			const { data, error } = await supabase
				.from('projects')
				.select('*')
				.order('created_at', { ascending: false })
				.limit(4);
			if (!error && data) {
				setProjects(
					data.map((p) => ({
						id: p.id,
						title: p.title,
						tech_tags: p.tech_tags,
						description: p.description,
						link: p.repo_url,
					}))
				);
			}
		};
		fetchProjects();
	}, []);

	return (
		<section id="projects" className="py-24 px-4 relative overflow-hidden">
			{/* Modern background inspired by Hero */}
			<div className="absolute inset-0 -z-10 pointer-events-none">
				{/* Animated background glow */}
				<div className="absolute inset-0 opacity-20 animate-subtle-flicker" style={{background: 'radial-gradient(600px circle at 50% 30%, rgba(255,255,255,0.06), transparent 40%)'}} />
				{/* Background dots */}
				{[...Array(50)].map((_, i) => (
					<div
						key={i}
						className="absolute bg-white/10 rounded-full animate-dot-move"
						style={{
							width: `${Math.random() * 3 + 1}px`,
							height: `${Math.random() * 3 + 1}px`,
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
							opacity: `${Math.random() * 0.3 + 0.1}`,
							animationDelay: `${Math.random() * 10}s`,
						}}
					/>
				))}
				{/* Asymmetrical grid lines */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-1/3 left-0 w-full h-px bg-white"></div>
					<div className="absolute top-2/3 left-0 w-2/3 h-px bg-white"></div>
					<div className="absolute left-1/4 top-0 w-px h-full bg-white"></div>
					<div className="absolute right-1/3 top-0 w-px h-2/3 bg-white"></div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto">
				<div className="mb-20 ml-8 lg:ml-16">
					<h2 className="text-5xl md:text-7xl font-black mb-4">
						Latest
						<br />
						<span className="ml-8 text-white/60">Projects</span>
					</h2>
					<div className="w-24 h-1 bg-white/40 ml-8"></div>
				</div>

				{/* 4-column grid layout for projects */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
					{projects.map((project, index) => (
						<div
							key={project.id}
							className={`relative group bg-white/[0.02] border border-white/10 rounded-2xl p-8 lg:p-10 transition-all duration-500 cursor-pointer hover:bg-white/[0.05] hover:border-white/30 ${hoveredProject === index ? 'scale-[1.03] shadow-2xl' : ''}`}
							onMouseEnter={() => setHoveredProject(index)}
							onMouseLeave={() => setHoveredProject(null)}
						>
							{/* Glow effect on hover */}
							<div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 ${hoveredProject === index ? 'bg-gradient-to-br from-white/[0.10] via-transparent to-white/[0.06] opacity-100' : 'opacity-0'}`}/>
							<div className="relative z-10">
								<h3 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight">
									{project.title}
								</h3>
								{project.tech_tags && (
									<p className="text-white/60 text-sm font-medium mb-4 tracking-wide">
										{project.tech_tags.join(' • ')}
									</p>
								)}
								<p className="text-white/80 text-base leading-relaxed mb-8">
									{project.description}
								</p>
								<div className="flex items-center justify-between">
									{project.link && (
										<a href={project.link} className="text-white/70 hover:text-white font-semibold flex items-center gap-2 transition-colors">
											View <ArrowUp className="w-4 h-4 rotate-45" />
										</a>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Projects;
