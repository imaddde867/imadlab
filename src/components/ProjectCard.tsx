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

  return (
    <CardItem
      title={project.title}
      tags={project.tech_tags || []}
      description={project.description || ''}
      linkTo={linkTo}
      linkLabel={linkLabel}
      githubUrl={project.repo_url || undefined}
      demoUrl={project.demo_url || undefined}
      image_url={project.image_url || undefined}
      repoStars={repoInfo?.stargazers_count ?? null}
      repoLanguage={repoInfo?.language ?? null}
      repoUpdatedAt={repoInfo?.pushed_at ?? repoInfo?.updated_at ?? null}
    />
  );
};

export default ProjectCard;

