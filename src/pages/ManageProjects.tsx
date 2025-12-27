import { useState, useEffect, useMemo, useRef } from 'react';
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
} from 'lucide-react';
import { PROJECT_ADMIN_SELECT, PROJECT_DETAIL_SELECT } from '@/lib/content-selects';
import type { ProjectDetail as ProjectAdmin } from '@/types/content';

type ProjectFormState = {
  title: string;
  description: string;
  full_description: string;
  image_url: string;
  tech_tags: string;
  repo_url: string;
  demo_url: string;
};

const createEmptyProjectForm = (): ProjectFormState => ({
  title: '',
  description: '',
  full_description: '',
  image_url: '',
  tech_tags: '',
  repo_url: '',
  demo_url: '',
});

const ManageProjects = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectAdmin | null>(null);
  const [formData, setFormData] = useState<ProjectFormState>(createEmptyProjectForm);
  const [authChecked, setAuthChecked] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const editRequestId = useRef(0);

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
        label: 'Total projects',
        value: totalProjects,
      },
      {
        label: 'Repos linked',
        value: projectsWithRepo,
      },
      {
        label: 'Tech tags',
        value: uniqueTechTags,
      },
      {
        label: 'This month',
        value: projectsThisMonth,
      },
    ],
    [projectsThisMonth, projectsWithRepo, totalProjects, uniqueTechTags]
  );

  const resetForm = () => setFormData(createEmptyProjectForm());

  const closeForm = () => {
    editRequestId.current += 1;
    setShowForm(false);
    setEditingProject(null);
    setIsEditLoading(false);
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
  const isFormBusy = isMutating || isEditLoading;

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

  const handleEditClick = async (project: ProjectAdmin) => {
    setEditingProject(project);
    setShowForm(true);
    setIsEditLoading(true);
    const requestId = (editRequestId.current += 1);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(PROJECT_DETAIL_SELECT)
        .eq('id', project.id)
        .maybeSingle();
      if (error) throw error;
      const record = data ?? project;
      if (requestId !== editRequestId.current) return;
      setFormData({
        title: record.title,
        description: record.description || '',
        full_description: record.full_description || '',
        image_url: record.image_url || '',
        tech_tags: record.tech_tags?.join(', ') || '',
        repo_url: record.repo_url || '',
        demo_url: record.demo_url || '',
      });
    } catch (error) {
      console.warn('Failed to load full project content', error);
      if (requestId !== editRequestId.current) return;
      setFormData({
        title: project.title,
        description: project.description || '',
        full_description: project.full_description || '',
        image_url: project.image_url || '',
        tech_tags: project.tech_tags?.join(', ') || '',
        repo_url: project.repo_url || '',
        demo_url: project.demo_url || '',
      });
    } finally {
      if (requestId === editRequestId.current) {
        setIsEditLoading(false);
      }
    }
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProjectMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditLoading) {
      toast({
        title: 'Still loading',
        description: 'Please wait for the full content to load before saving.',
        variant: 'destructive',
      });
      return;
    }
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
    };

    if (editingProject) {
      updateProjectMutation.mutate({ ...editingProject, ...projectData });
    } else {
      addProjectMutation.mutate(projectData);
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
          eyebrow="Admin"
          title="Projects"
          description="Create and manage portfolio projects."
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Projects', href: '/admin/projects' },
          ]}
          meta={headerMeta}
          actions={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant={showForm ? 'outline' : 'inverted'}
                size="lg"
                onClick={handleToggleForm}
                disabled={isMutating}
              >
                <Plus className="mr-2 h-4 w-4" />
                {showForm ? 'Cancel' : 'New Project'}
              </Button>
            </div>
          }
        />

        {showForm && (
          <Card className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-none">
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Live Demo URL</label>
                  <Input
                    placeholder="https://your-demo.com"
                    value={formData.demo_url}
                    onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  />
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

                {isEditLoading && (
                  <div className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/60">
                    Loading full content…
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" variant="inverted" disabled={isFormBusy}>
                    {editingProject
                      ? updateProjectMutation.isPending
                        ? 'Updating...'
                        : 'Update Project'
                      : addProjectMutation.isPending
                        ? 'Creating...'
                        : 'Create Project'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={closeForm} disabled={isFormBusy}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Projects List */}
        <Card className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-none">
          <CardHeader>
            <CardTitle className="text-white">All Projects</CardTitle>
            <CardDescription className="text-white/70">
              Manage your portfolio projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isProjectsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
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
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <h3 className="text-lg font-semibold text-white">{project.title}</h3>
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
