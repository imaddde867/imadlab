import { useState, useEffect, useMemo, type CSSProperties } from 'react';
import { supabase } from '@/integrations/supabase/client';
import CardItem from '@/components/ui/CardItem';
import SectionHeader from '@/components/SectionHeader';
import { useIsCoarsePointer } from '@/hooks/useIsCoarsePointer';

interface Project {
	id: string;
	title: string;
	tech_tags: string[] | null;
	description: string | null;
	short_description?: string | null;
	repo_url: string | null;
	image_url: string | null;
}

const Projects = () => {
	const [projects, setProjects] = useState<Project[]>([]);
	const isCoarsePointer = useIsCoarsePointer();
	const dots = useMemo(() => {
		const count = isCoarsePointer ? 15 : 50;
		return Array.from({ length: count }, () => {
			const size = Math.random() * 8 + 4;
			const opacity = Math.random() * 0.7 + 0.3;
			const translateX = (Math.random() - 0.5) * 200;
			const translateY = (Math.random() - 0.5) * 200;

			return {
				width: `${size}px`,
				height: `${size}px`,
				left: `${Math.random() * 100}%`,
				top: `${Math.random() * 100}%`,
				opacity: `${opacity}`,
				animationDelay: `${Math.random() * 10}s`,
				"--tw-translate-x": `${translateX}px`,
				"--tw-translate-y": `${translateY}px`,
			} satisfies CSSProperties & {
				"--tw-translate-x"?: string;
				"--tw-translate-y"?: string;
			};
		});
	}, [isCoarsePointer]);

	useEffect(() => {
		const fetchProjects = async () => {
			const includeShort = import.meta.env.VITE_INCLUDE_PROJECT_SHORT_DESC === 'true';
			const columns = includeShort
				? 'id,title,tech_tags,description,short_description,repo_url,image_url'
				: 'id,title,tech_tags,description,repo_url,image_url';

			const { data, error } = await supabase
				.from('projects')
				.select(columns)
				.order('created_at', { ascending: false })
				.limit(3);

			if (!error && data) {
				setProjects(
					(data as Project[]).map((project) =>
						includeShort ? project : { ...project, short_description: null }
					)
				);
			} else if (error) {
				console.error('Failed to load featured projects', error);
			}
		};
		fetchProjects();
	}, []);

	return (
		<section id="projects" className="section relative overflow-hidden scroll-mt-20">
			{/* Modern background inspired by Hero */}
			<div className="absolute inset-0 -z-10 pointer-events-none">
				{/* Animated background glow (stronger) */}
				<div 
					className="absolute inset-0 opacity-35 animate-subtle-flicker"
					style={{
						background: 'radial-gradient(800px circle at 50% 30%, rgba(255,255,255,0.12), transparent 55%)'
					}}
				/>
				{/* Background dots (larger, more opaque) */}
				{dots.map((style, i) => (
					<div
						key={i}
						className="absolute bg-white/40 rounded-full animate-dot-move"
						style={style}
					/>
				))}
				{/* Asymmetrical grid lines (thicker, more visible) */}
				<div className="absolute inset-0 opacity-20">
					<div className="absolute top-1/3 left-0 w-full h-px bg-white"></div>
					<div className="absolute top-2/3 left-0 w-2/3 h-px bg-white"></div>
					<div className="absolute left-1/4 top-0 w-px h-full bg-white"></div>
					<div className="absolute right-1/3 top-0 w-px h-2/3 bg-white"></div>
				</div>
			</div>

			<div className="container-site">
				<div className="mb-20 ml-8 lg:ml-16 flex items-center justify-between">
					<div className="w-full max-w-xl">
						<SectionHeader title={<span className="ml-0">Latest</span>} subtitle={<span className="ml-8">Projects</span>} />
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
							description={project.short_description || project.description || ''}
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
