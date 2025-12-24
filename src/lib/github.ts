export type GithubRepoRef = {
  owner: string;
  repo: string;
};

export type GithubRepoInfo = {
  full_name: string;
  html_url: string;
  homepage?: string | null;
  description?: string | null;
  language?: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at?: string | null;
  updated_at?: string | null;
};

const normalizeRepoName = (value: string) => value.replace(/\.git$/i, '').trim();

export const parseGithubRepo = (repoUrl?: string | null): GithubRepoRef | null => {
  if (!repoUrl) return null;
  const trimmed = repoUrl.trim();
  if (!trimmed) return null;

  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/i);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: normalizeRepoName(sshMatch[2]) };
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname !== 'github.com') return null;
    const [, owner, repo] = url.pathname.split('/');
    if (!owner || !repo) return null;
    return { owner, repo: normalizeRepoName(repo) };
  } catch {
    return null;
  }
};

