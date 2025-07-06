import { useState, useEffect } from 'react';
import { Github } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
						className="text-white/70 hover:text-white text-base font-medium transition-colors duration-200 mr-4 mt-4 md:mt-0 md:mr-8"
					>
						View all projects
					</a>
				</div>

				{/* 4-column grid layout for projects, matching /projects page */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
					{projects.map((project, index) => (
						<Card key={project.id} className="relative bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/30 transition-all duration-300 group">
							<CardHeader>
								<CardTitle className="flex items-start justify-between text-white">
									<span className="text-xl font-bold">{project.title}</span>
									{project.link && (
										<a href={project.link} target="_blank" rel="noopener noreferrer">
											<Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-transparent">
												View Project
											</Button>
										</a>
									)}
								</CardTitle>
							</CardHeader>
							<CardContent className="pb-12">
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
							</CardContent>
							{project.link && (
								<div className="absolute bottom-4 right-4">
									<a
										href={project.link}
										target="_blank"
										rel="noopener noreferrer"
										className="text-white/60 hover:text-white transition-colors"
									>
										<Github className="w-6 h-6" />
									</a>
								</div>
							)}
						</Card>
					))}
				</div>
			</div>
		</section>
	);
};

export default Projects;
