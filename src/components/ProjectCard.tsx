import CardItem from '@/components/ui/CardItem';
import type { ProjectSummary } from '@/types/content';
import { useGithubRepoInfo } from '@/hooks/useGithubRepoInfo';

type ProjectCardProps = {
  project: ProjectSummary;
  linkTo: string;
  linkLabel?: string;
};

const ProjectCard = ({ project, linkTo, linkLabel = 'View Project' }: ProjectCardProps) => {
  const { data: repoInfo } = useGithubRepoInfo(project.repo_url);
  const fallbackDescription =
    project.description?.trim() ||
    repoInfo?.description?.trim() ||
    (project.tech_tags?.length ? `Built with ${project.tech_tags.slice(0, 3).join(', ')}.` : '');

  return (
    <CardItem
      title={project.title}
      tags={project.tech_tags || []}
      description={fallbackDescription}
      linkTo={linkTo}
      linkLabel={linkLabel}
      githubUrl={project.repo_url || undefined}
      demoUrl={project.demo_url || undefined}
      image_url={project.image_url || undefined}
      repoStars={repoInfo?.stargazers_count ?? null}
      repoUpdatedAt={repoInfo?.pushed_at ?? repoInfo?.updated_at ?? null}
    />
  );
};

export default ProjectCard;
