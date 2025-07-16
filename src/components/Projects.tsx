import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import CardItem from '@/components/ui/CardItem';

interface Project {
	id: string;
	title: string;
	tech_tags: string[] | null;
	description: string | null;
	repo_url: string | null;
	featured?: boolean;
	image_url: string | null;
}

const Projects = () => {
	const [projects, setProjects] = useState<Project[]>([]);

	useEffect(() => {
		const fetchProjects = async () => {
			const { data, error } = await supabase
				.from('projects')
				.select('*, image_url')
				.order('created_at', { ascending: false })
				.limit(3);
			if (!error && data) {
				setProjects(data as Project[]);
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
						<h2 className="text-section-title text-hierarchy-primary mb-4">
							Latest
							<br />
							<span className="ml-8 text-hierarchy-muted">Projects</span>
						</h2>
						<div className="w-24 h-1 bg-white/40 ml-8"></div>
					</div>
					<a
						href="/projects"
						className="link-enhanced focus-enhanced mr-4 mt-4 md:mt-0 md:mr-8 ml-12 md:ml-0"
					>
						View all projects
					</a>
				</div>

				{/* 4-column grid layout for projects, matching /projects page */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					{projects.map((project) => (
						<CardItem
							key={project.id}
							title={project.title}
							tags={project.tech_tags || []}
							description={project.description || ''}
							linkTo={`/projects/${project.id}`}
							linkLabel="View Project"
							githubUrl={project.repo_url || undefined}
							image_url={project.image_url || undefined}
						/>
					))}
				</div>
			</div>
		</section>
	);
};

export default Projects;
