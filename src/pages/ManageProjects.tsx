import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Tag as TagChip } from '@/components/ui/tag';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Code,
  ExternalLink,
  FolderOpen,
  Tag as TagIcon,
  Github,
  RefreshCw,
} from 'lucide-react';
import { PROJECT_ADMIN_SELECT } from '@/lib/content-selects';
import type { ProjectDetail as ProjectAdmin } from '@/types/content';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { parseGithubRepo } from '@/lib/github';

type GithubRepoListItem = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  pushed_at: string | null;
  updated_at: string | null;
  fork: boolean;
  archived: boolean;
  private: boolean;
};

const normalizeGithubRepoUrl = (repoUrl?: string | null) => {
  const repo = parseGithubRepo(repoUrl);
  if (repo) return `https://github.com/${repo.owner}/${repo.repo}`;
  return (repoUrl ?? '').trim().replace(/\/+$/, '');
};

const normalizeUrl = (value?: string | null) => {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
};

const buildProjectTitleFromRepo = (name: string) => {
  const cleaned = name.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return name;
  return cleaned
    .split(' ')
    .map((word) => {
      if (!word) return word;
      const isAllCaps = word === word.toUpperCase();
      if (isAllCaps) return word;
      return word[0].toUpperCase() + word.slice(1);
    })
    .join(' ');
};

type ProjectFormState = {
  title: string;
  description: string;
  full_description: string;
  image_url: string;
  tech_tags: string;
  repo_url: string;
  demo_url: string;
  featured: boolean;
};

const createEmptyProjectForm = (): ProjectFormState => ({
  title: '',
  description: '',
  full_description: '',
  image_url: '',
  tech_tags: '',
  repo_url: '',
  demo_url: '',
  featured: false,
});

const ManageProjects = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectAdmin | null>(null);
  const [formData, setFormData] = useState<ProjectFormState>(createEmptyProjectForm);
  const [authChecked, setAuthChecked] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importQuery, setImportQuery] = useState('');
  const [importRepos, setImportRepos] = useState<GithubRepoListItem[]>([]);
  const [importSelected, setImportSelected] = useState<Record<string, boolean>>({});
  const [importLoading, setImportLoading] = useState(false);
  const [importAutoFeatured, setImportAutoFeatured] = useState(true);
  const [syncAllRunning, setSyncAllRunning] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
        toast({
          title: 'Unauthorized',
          description: 'Please log in to access this page.',
          variant: 'destructive',
        });
      }
      setAuthChecked(true);
    };
    checkUser();
  }, [navigate, toast]);

  const {
    data: projects,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(PROJECT_ADMIN_SELECT)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectAdmin[];
    },
  });

  const projectsList = useMemo(() => projects ?? [], [projects]);
  const totalProjects = projectsList.length;
  const hasProjects = totalProjects > 0;

  const projectsThisMonth = useMemo(() => {
    if (!projectsList.length) return 0;
    const now = new Date();
    return projectsList.filter((project) => {
      const created = new Date(project.created_at);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
  }, [projectsList]);

  const projectsWithRepo = useMemo(() => {
    if (!projectsList.length) return 0;
    return projectsList.filter((project) => Boolean(project.repo_url)).length;
  }, [projectsList]);

  const uniqueTechTags = useMemo(() => {
    if (!projectsList.length) return 0;
    return new Set(projectsList.flatMap((project) => project.tech_tags || [])).size;
  }, [projectsList]);

  const headerMeta = useMemo(
    () => [
      {
        label: `${totalProjects} active projects`,
        icon: <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />,
        variant: 'neutral' as const,
      },
      {
        label: `${projectsWithRepo} with repo access`,
        icon: <Code className="h-3.5 w-3.5" aria-hidden="true" />,
        variant: 'outline' as const,
      },
      {
        label: `${uniqueTechTags} tech tags`,
        icon: <TagIcon className="h-3.5 w-3.5" aria-hidden="true" />,
        variant: 'subtle' as const,
      },
      {
        label: `${projectsThisMonth} this month`,
        icon: <Calendar className="h-3.5 w-3.5" aria-hidden="true" />,
        variant: 'subtle' as const,
      },
    ],
    [projectsThisMonth, projectsWithRepo, totalProjects, uniqueTechTags]
  );

  const overviewStats = useMemo(
    () => [
      {
        label: 'Total projects',
        value: totalProjects,
        icon: <FolderOpen className="h-4 w-4 text-white/80" aria-hidden="true" />,
      },
      {
        label: 'Published this month',
        value: projectsThisMonth,
        icon: <Calendar className="h-4 w-4 text-emerald-300" aria-hidden="true" />,
      },
      {
        label: 'Repositories linked',
        value: projectsWithRepo,
        icon: <Code className="h-4 w-4 text-sky-300" aria-hidden="true" />,
      },
      {
        label: 'Unique tech tags',
        value: uniqueTechTags,
        icon: <TagIcon className="h-4 w-4 text-amber-300" aria-hidden="true" />,
      },
    ],
    [projectsThisMonth, projectsWithRepo, totalProjects, uniqueTechTags]
  );

  const resetForm = () => setFormData(createEmptyProjectForm());

  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
    resetForm();
  };

  const openCreateForm = () => {
    setShowForm(true);
    setEditingProject(null);
    resetForm();
  };

  const handleToggleForm = () => {
    if (showForm) {
      closeForm();
    } else {
      openCreateForm();
    }
  };

  const isProjectsLoading = isLoading || isFetching;

  const existingRepoUrls = useMemo(() => {
    return new Set(projectsList.map((p) => normalizeGithubRepoUrl(p.repo_url)));
  }, [projectsList]);

  const loadGithubRepos = async () => {
    setImportLoading(true);
    try {
      const res = await fetch(
        'https://api.github.com/users/imaddde867/repos?per_page=100&sort=updated&direction=desc',
        {
          headers: {
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }
      );
      if (!res.ok) throw new Error(`GitHub API error (${res.status})`);
      const data = (await res.json()) as GithubRepoListItem[];
      const filtered = (data ?? [])
        .filter((r) => !r.fork && !r.archived && !r.private)
        .sort((a, b) => {
          const stars = (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0);
          if (stars !== 0) return stars;
          return (
            new Date(b.pushed_at ?? b.updated_at ?? 0).getTime() -
            new Date(a.pushed_at ?? a.updated_at ?? 0).getTime()
          );
        });
      setImportRepos(filtered);
    } catch (error) {
      toast({
        title: 'Failed to load GitHub repos',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setImportLoading(false);
    }
  };

  const openImportDialog = async () => {
    setImportDialogOpen(true);
    if (!importRepos.length) {
      await loadGithubRepos();
    }
  };

  const filteredImportRepos = useMemo(() => {
    const q = importQuery.trim().toLowerCase();
    const matchesQuery = (repo: GithubRepoListItem) => {
      if (!q) return true;
      const haystack = `${repo.name} ${repo.full_name} ${repo.description ?? ''} ${(repo.topics ?? []).join(' ')}`.toLowerCase();
      return haystack.includes(q);
    };
    return importRepos.filter((repo) => matchesQuery(repo));
  }, [importQuery, importRepos]);

  const selectedImportRepos = useMemo(() => {
    const selectedUrls = new Set(
      Object.entries(importSelected)
        .filter(([, v]) => v)
        .map(([k]) => k)
    );
    return importRepos.filter((repo) => selectedUrls.has(repo.html_url));
  }, [importRepos, importSelected]);

  const importReposMutation = useMutation({
    mutationFn: async (repos: GithubRepoListItem[]) => {
      const rows = repos.map((repo) => {
        const language = repo.language?.trim() ? [repo.language.trim()] : [];
        const topics = Array.isArray(repo.topics) ? repo.topics.filter(Boolean) : [];
        const techTags = Array.from(new Set([...language, ...topics]));

        const description = repo.description?.trim().length ? repo.description.trim() : null;
        const demoUrl = normalizeUrl(repo.homepage);
        const title = buildProjectTitleFromRepo(repo.name);
        const featured = importAutoFeatured ? repo.stargazers_count >= 3 : false;

        const fullDescription = `## Overview\n${description ?? ''}\n\n## Links\n- Repo: ${repo.html_url}${
          demoUrl ? `\n- Demo: ${demoUrl}` : ''
        }\n\n## Highlights\n- \n\n## Tech\n${techTags.length ? techTags.map((t) => `- ${t}`).join('\n') : '- '}\n`;

        return {
          title,
          description,
          full_description: fullDescription,
          image_url: null,
          tech_tags: techTags.length ? techTags : null,
          repo_url: repo.html_url,
          demo_url: demoUrl,
          featured,
        };
      });

      const { data, error } = await supabase.from('projects').insert(rows).select();
      if (error) throw error;
      return data ?? [];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setImportDialogOpen(false);
      setImportSelected({});
      setImportQuery('');
      toast({
        title: 'Imported projects',
        description: `${data.length} project${data.length === 1 ? '' : 's'} added.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const syncFromGithubMutation = useMutation({
    mutationFn: async (project: ProjectAdmin) => {
      const repoUrl = normalizeGithubRepoUrl(project.repo_url);
      if (!repoUrl) return { updated: false };
      const repoRef = parseGithubRepo(repoUrl);
      if (!repoRef) return { updated: false };
      const fullName = `${repoRef.owner}/${repoRef.repo}`;

      const res = await fetch(`https://api.github.com/repos/${fullName}`, {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      if (!res.ok) {
        throw new Error(`GitHub API error (${res.status}) for ${fullName}`);
      }
      const repo = (await res.json()) as GithubRepoListItem;

      const updates: Partial<ProjectAdmin> = {};
      if (!project.description?.trim() && repo.description?.trim()) {
        updates.description = repo.description.trim();
      }
      if (!project.demo_url && normalizeUrl(repo.homepage)) {
        updates.demo_url = normalizeUrl(repo.homepage);
      }
      if (!project.tech_tags?.length) {
        const language = repo.language?.trim() ? [repo.language.trim()] : [];
        const topics = Array.isArray(repo.topics) ? repo.topics.filter(Boolean) : [];
        const techTags = Array.from(new Set([...language, ...topics]));
        updates.tech_tags = techTags.length ? techTags : null;
      }

      if (Object.keys(updates).length === 0) {
        return { updated: false };
      }

      const { error } = await supabase.from('projects').update(updates).eq('id', project.id);
      if (error) throw error;
      return { updated: true };
    },
  });

  const addProjectMutation = useMutation({
    mutationFn: async (newProject: Omit<ProjectAdmin, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            ...newProject,
            tech_tags: newProject.tech_tags?.length ? newProject.tech_tags : null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      closeForm();
      toast({ title: 'Project added successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error adding project', description: error.message, variant: 'destructive' });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (updatedProject: ProjectAdmin) => {
      const { data, error } = await supabase
        .from('projects')
        .update({
          title: updatedProject.title,
          description: updatedProject.description,
          full_description: updatedProject.full_description,
          image_url: updatedProject.image_url,
          tech_tags: updatedProject.tech_tags,
          repo_url: updatedProject.repo_url,
          demo_url: updatedProject.demo_url,
          featured: updatedProject.featured,
        })
        .eq('id', updatedProject.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      closeForm();
      toast({ title: 'Project updated successfully!' });
    },
    onError: (error) => {
      toast({
        title: 'Error updating project',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const isMutating = addProjectMutation.isPending || updateProjectMutation.isPending;
  const isGithubMutating = importReposMutation.isPending || syncFromGithubMutation.isPending;

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project deleted successfully!' });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting project',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleEditClick = (project: ProjectAdmin) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      full_description: project.full_description || '',
      image_url: project.image_url || '',
      tech_tags: project.tech_tags?.join(', ') || '',
      repo_url: project.repo_url || '',
      demo_url: project.demo_url || '',
      featured: Boolean(project.featured),
    });
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProjectMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const techTagsArray = formData.tech_tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const projectData = {
      title: formData.title,
      description: formData.description || null,
      full_description: formData.full_description || null,
      image_url: formData.image_url || null,
      tech_tags: techTagsArray.length > 0 ? techTagsArray : null,
      repo_url: formData.repo_url || null,
      demo_url: formData.demo_url || null,
      featured: formData.featured,
    };

    if (editingProject) {
      updateProjectMutation.mutate({ ...editingProject, ...projectData });
    } else {
      addProjectMutation.mutate(projectData);
    }
  };

  const handleImportSelected = () => {
    const candidates = selectedImportRepos.filter(
      (repo) => !existingRepoUrls.has(normalizeGithubRepoUrl(repo.html_url))
    );
    if (candidates.length === 0) {
      toast({
        title: 'Nothing to import',
        description: 'All selected repos already exist in Projects.',
      });
      return;
    }
    importReposMutation.mutate(candidates);
  };

  const handleSyncProject = async (project: ProjectAdmin) => {
    try {
      const result = await syncFromGithubMutation.mutateAsync(project);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast(
        result.updated
          ? { title: 'Synced from GitHub' }
          : { title: 'Already up to date', description: 'No missing fields to fill.' }
      );
    } catch (error) {
      toast({
        title: 'GitHub sync failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleSyncAllMissing = async () => {
    const candidates = projectsList.filter((p) => Boolean(p.repo_url));
    if (!candidates.length) {
      toast({
        title: 'No GitHub repos found',
        description: 'Add a `repo_url` to at least one project first.',
      });
      return;
    }

    setSyncAllRunning(true);
    try {
      let updatedCount = 0;
      let skippedCount = 0;
      let failedCount = 0;

      for (const project of candidates) {
        try {
          const result = await syncFromGithubMutation.mutateAsync(project);
          if (result.updated) updatedCount += 1;
          else skippedCount += 1;
        } catch {
          failedCount += 1;
        }
      }

      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'GitHub sync complete',
        description: `Updated ${updatedCount}, skipped ${skippedCount}, failed ${failedCount}.`,
      });
    } finally {
      setSyncAllRunning(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/60 text-xl">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container-site space-y-10 pb-24">
        <PageHeader
          eyebrow="Admin Suite"
          title="Projects"
          description="Maintain and showcase the portfolio work powering imadlab."
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Projects', href: '/admin/projects' },
          ]}
          meta={headerMeta}
          actions={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={openImportDialog}
                disabled={isMutating || isGithubMutating}
              >
                <Github className="mr-2 h-4 w-4" />
                Import from GitHub
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleSyncAllMissing}
                disabled={isMutating || isGithubMutating || syncAllRunning}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {syncAllRunning ? 'Syncing...' : 'Sync GitHub'}
              </Button>
              <Button
                variant={showForm ? 'outline' : 'inverted'}
                size="lg"
                onClick={handleToggleForm}
                disabled={isMutating || isGithubMutating || syncAllRunning}
              >
                <Plus className="mr-2 h-4 w-4" />
                {showForm ? 'Cancel' : 'New Project'}
              </Button>
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overviewStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_16px_48px_rgba(15,23,42,0.45)] backdrop-blur-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            ))}
	          </div>
	        </PageHeader>

        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 text-white border border-white/10">
            <DialogHeader>
              <DialogTitle>Import projects from GitHub</DialogTitle>
              <DialogDescription className="text-white/60">
                Import selected public repos into Supabase Projects. Only safe fields are auto-filled (you can refine descriptions, images, and highlights after).
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Input
                  value={importQuery}
                  onChange={(e) => setImportQuery(e.target.value)}
                  placeholder="Search repos (name, description, topics)..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/60">Auto-feature ★3+</span>
                    <Switch checked={importAutoFeatured} onCheckedChange={setImportAutoFeatured} />
                  </div>
                  <Button variant="soft" onClick={loadGithubRepos} disabled={importLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${importLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {importLoading ? (
                <div className="py-8 text-center text-white/60">Loading GitHub repos...</div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/40">
                  <div className="max-h-[420px] overflow-auto divide-y divide-white/10">
                    {filteredImportRepos.map((repo) => {
                      const alreadyAdded = existingRepoUrls.has(normalizeGithubRepoUrl(repo.html_url));
                      const checked = Boolean(importSelected[repo.html_url]);
                      const canSelect = !alreadyAdded;
                      return (
                        <button
                          type="button"
                          key={repo.id}
                          onClick={() => {
                            if (!canSelect) return;
                            setImportSelected((prev) => ({
                              ...prev,
                              [repo.html_url]: !prev[repo.html_url],
                            }));
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors disabled:opacity-50"
                          disabled={!canSelect}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-white truncate">
                                  {repo.name}
                                </span>
                                {alreadyAdded && (
                                  <span className="text-[11px] rounded-full bg-white/10 px-2 py-0.5 text-white/60">
                                    Already added
                                  </span>
                                )}
                                {checked && (
                                  <span className="text-[11px] rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-200">
                                    Selected
                                  </span>
                                )}
                              </div>
                              {repo.description && (
                                <p className="mt-1 text-xs text-white/60 line-clamp-2">
                                  {repo.description}
                                </p>
                              )}
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-white/50">
                                <span>★{repo.stargazers_count}</span>
                                {repo.language && <span>{repo.language}</span>}
                                {normalizeUrl(repo.homepage) && <span>Demo</span>}
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-white/40">
                              {alreadyAdded ? '—' : checked ? '✓' : '+'}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {!filteredImportRepos.length && (
                      <div className="p-6 text-center text-white/60">No repos match your search.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setImportDialogOpen(false)}>
                Close
              </Button>
              <Button
                variant="inverted"
                onClick={handleImportSelected}
                disabled={importReposMutation.isPending || selectedImportRepos.length === 0}
              >
                Import selected ({selectedImportRepos.length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

	        {showForm && (
	          <Card className="rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(15,23,42,0.45)] backdrop-blur-md">
	            <CardHeader>
	              <CardTitle className="text-white">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </CardTitle>
              <CardDescription className="text-white/70">
                {editingProject
                  ? 'Update your project details'
                  : 'Add a new project to your portfolio'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Project Title</label>
                  <Input
                    placeholder="Enter project title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Short Description</label>
                  <Textarea
                    placeholder="Brief description that appears on project cards"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Full Description</label>
                  <Textarea
                    placeholder="Detailed description for the project detail page"
                    value={formData.full_description}
                    onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Project Image URL</label>
                    <Input
                      placeholder="https://example.com/project-image.jpg"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Repository URL</label>
                    <Input
                      placeholder="https://github.com/username/project"
                      value={formData.repo_url}
                      onChange={(e) => setFormData({ ...formData, repo_url: e.target.value })}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Live Demo URL</label>
                    <Input
                      placeholder="https://your-demo.com"
                      value={formData.demo_url}
                      onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-white/80">Featured</div>
                      <div className="text-xs text-white/60">Pin this project to the top</div>
                    </div>
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Technologies Used</label>
                  <Input
                    placeholder="React, TypeScript, Node.js, PostgreSQL"
                    value={formData.tech_tags}
                    onChange={(e) => setFormData({ ...formData, tech_tags: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" variant="inverted" disabled={isMutating}>
                    {editingProject
                      ? updateProjectMutation.isPending
                        ? 'Updating...'
                        : 'Update Project'
                      : addProjectMutation.isPending
                        ? 'Creating...'
                        : 'Create Project'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={closeForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Projects List */}
        <Card className="rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(15,23,42,0.45)] backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">All Projects</CardTitle>
            <CardDescription className="text-white/70">
              Manage your portfolio projects and showcase your work
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isProjectsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                  >
                    <Skeleton className="h-6 w-2/3" />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="mt-5 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-3/5" />
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Skeleton className="h-9 w-24 rounded-lg" />
                      <Skeleton className="h-9 w-24 rounded-lg" />
                      <Skeleton className="h-9 w-24 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !hasProjects ? (
              <div className="py-12 text-center">
                <FolderOpen className="mx-auto mb-4 h-12 w-12 text-white/20" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-white">No projects yet</h3>
                <p className="mt-3 text-sm text-white/70">
                  Create your first project to showcase your work.
                </p>
                <Button className="mt-6" variant="inverted" onClick={openCreateForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Project
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {projectsList.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-2xl border border-white/10 bg-black/60 p-6 shadow-[0_16px_48px_rgba(15,23,42,0.45)] backdrop-blur-sm transition hover:border-white/20"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                          {project.tech_tags && project.tech_tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {project.tech_tags.slice(0, 3).map((tech, index) => (
                                <TagChip
                                  key={`${project.id}-tag-${index}`}
                                  size="xs"
                                  variant="outline"
                                  className="text-white/80"
                                >
                                  {tech}
                                </TagChip>
                              ))}
                              {project.tech_tags.length > 3 && (
                                <TagChip size="xs" variant="subtle" className="text-white/80">
                                  +{project.tech_tags.length - 3}
                                </TagChip>
                              )}
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-white/70 line-clamp-2">
                          {project.description || 'No description available'}
                        </p>

                        <div className="flex flex-wrap gap-4 text-xs text-white/60">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-white/50" aria-hidden="true" />
                            {new Date(project.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ExternalLink
                              className="h-3.5 w-3.5 text-white/50"
                              aria-hidden="true"
                            />
                            /projects/{project.id}
                          </div>
                          {project.featured && (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-300" />
                              Featured
                            </div>
                          )}
                          {project.repo_url && (
                            <div className="flex items-center gap-1.5">
                              <Code className="h-3.5 w-3.5 text-white/50" aria-hidden="true" />
                              Repository available
                            </div>
                          )}
                          {project.demo_url && (
                            <div className="flex items-center gap-1.5">
                              <ExternalLink
                                className="h-3.5 w-3.5 text-white/50"
                                aria-hidden="true"
                              />
                              Demo available
                            </div>
                          )}
                        </div>
                      </div>

	                      <div className="flex flex-wrap items-center gap-2">
	                        <Button asChild variant="soft" size="sm">
	                          <Link
	                            to={`/projects/${project.id}`}
	                            target="_blank"
	                            rel="noopener noreferrer"
	                          >
	                            <Eye className="mr-2 h-4 w-4" />
	                            Preview
	                          </Link>
	                        </Button>
                        {project.repo_url && (
                          <Button
                            variant="soft"
                            size="sm"
                            onClick={() => handleSyncProject(project)}
                            disabled={syncFromGithubMutation.isPending || syncAllRunning}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync
                          </Button>
                        )}
	                        <Button variant="soft" size="sm" onClick={() => handleEditClick(project)}>
	                          <Edit className="mr-2 h-4 w-4" />
	                          Edit
	                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(project.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageProjects;
