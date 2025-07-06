import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
				{/* Animated background glow (stronger) */}
				<div 
					className="absolute inset-0 opacity-70 animate-subtle-flicker"
					style={{
						background: 'radial-gradient(800px circle at 50% 30%, rgba(255,255,255,0.18), transparent 50%)'
					}}
				/>
				{/* Background dots (larger, more opaque) */}
				{[...Array(50)].map((_, i) => (
					<div
						key={i}
						className="absolute bg-white/40 rounded-full animate-dot-move"
						style={
							{
								width: `${Math.random() * 8 + 4}px`,
								height: `${Math.random() * 8 + 4}px`,
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
								opacity: `${Math.random() * 0.7 + 0.3}`,
								animationDelay: `${Math.random() * 10}s`,
								'--tw-translate-x': `${(Math.random() - 0.5) * 200}px`,
								'--tw-translate-y': `${(Math.random() - 0.5) * 200}px`,
							} as React.CSSProperties & { '--tw-translate-x'?: string; '--tw-translate-y'?: string; }
						}
					/>
				))}
				{/* Asymmetrical grid lines (thicker, more visible) */}
				<div className="absolute inset-0 opacity-40">
					<div className="absolute top-1/3 left-0 w-full h-1 bg-white"></div>
					<div className="absolute top-2/3 left-0 w-2/3 h-1 bg-white"></div>
					<div className="absolute left-1/4 top-0 w-1 h-full bg-white"></div>
					<div className="absolute right-1/3 top-0 w-1 h-2/3 bg-white"></div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto">
				<div className="mb-20 ml-8 lg:ml-16 flex items-center justify-between">
					<div>
						<h2 className="text-5xl md:text-7xl font-black mb-4">
							Latest
							<br />
							<span className="ml-8 text-white/60">Projects</span>
						</h2>
						<div className="w-24 h-1 bg-white/40 ml-8"></div>
					</div>
					<a
						href="/projects"
						className="text-white/70 hover:text-white text-base font-medium transition-colors duration-200 mr-4 mt-4 md:mt-0 md:mr-8 ml-12 md:ml-0"
					>
						View all projects
					</a>
				</div>

				{/* 4-column grid layout for projects, matching /projects page */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
					{projects.map((project, index) => (
						<div key={project.id} className="relative bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/30 transition-all duration-300 group">
							<div className="p-4">
								<div className="flex items-start justify-between text-white">
									<span className="text-xl font-bold">{project.title}</span>
									<Link to={`/projects/${project.id}`}>
										<Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-transparent">
											View Project
										</Button>
									</Link>
								</div>
							</div>
							<div className="pb-12">
								{project.description && (
									<p className="text-white/80 mb-4 leading-relaxed">
										{project.description}
									</p>
								)}
								{project.tech_tags && project.tech_tags.length > 0 && (
									<div className="flex flex-wrap gap-2">
										{project.tech_tags.map((tag, i) => (
											<span key={i} className="px-2 py-1 text-xs bg-white/10 rounded-full text-white/80">{tag}</span>
										))}
									</div>
								)}
							</div>
							{project.link && (
								<div className="absolute bottom-4 right-4">
									<a
										href={project.link}
										target="_blank"
										rel="noopener noreferrer"
										className="text-white/60 hover:text-white transition-colors"
									>
										{/* <Github className="w-6 h-6" /> */}
									</a>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Projects;
