import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Calendar, Code, ExternalLink, FolderOpen } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string | null;
  full_description: string | null;
  image_url: string | null;
  tech_tags: string[] | null;
  repo_url: string | null;
  created_at: string;
}

const ManageProjects = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    full_description: '',
    image_url: '',
    tech_tags: '',
    repo_url: ''
  });
  const [authChecked, setAuthChecked] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
        toast({ title: 'Unauthorized', description: 'Please log in to access this page.', variant: 'destructive' });
      }
      setAuthChecked(true);
    };
    checkUser();
  }, [navigate, toast]);

  const { data: projects, isLoading, isFetching } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Project[];
    }
  });

  const addProjectMutation = useMutation({
    mutationFn: async (newProject: Omit<Project, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...newProject,
          tech_tags: newProject.tech_tags?.length ? newProject.tech_tags : null
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowForm(false);
      setEditingProject(null);
      setFormData({ title: '', description: '', full_description: '', image_url: '', tech_tags: '', repo_url: '' });
      toast({ title: 'Project added successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error adding project', description: error.message, variant: 'destructive' });
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (updatedProject: Project) => {
      const { data, error } = await supabase
        .from('projects')
        .update({
          title: updatedProject.title,
          description: updatedProject.description,
          full_description: updatedProject.full_description,
          image_url: updatedProject.image_url,
          tech_tags: updatedProject.tech_tags,
          repo_url: updatedProject.repo_url
        })
        .eq('id', updatedProject.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowForm(false);
      setEditingProject(null);
      setFormData({ title: '', description: '', full_description: '', image_url: '', tech_tags: '', repo_url: '' });
      toast({ title: 'Project updated successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error updating project', description: error.message, variant: 'destructive' });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project deleted successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting project', description: error.message, variant: 'destructive' });
    }
  });

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      full_description: project.full_description || '',
      image_url: project.image_url || '',
      tech_tags: project.tech_tags?.join(', ') || '',
      repo_url: project.repo_url || ''
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
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const projectData = {
      title: formData.title,
      description: formData.description || null,
      full_description: formData.full_description || null,
      image_url: formData.image_url || null,
      tech_tags: techTagsArray.length > 0 ? techTagsArray : null,
      repo_url: formData.repo_url || null
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
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Projects Management</h1>
          <Button
            onClick={() => { 
              setShowForm(!showForm); 
              setEditingProject(null); 
              setFormData({ title: '', description: '', full_description: '', image_url: '', tech_tags: '', repo_url: '' }); 
            }}
            disabled={addProjectMutation.isPending || updateProjectMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'New Project'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center">
                <FolderOpen className="w-4 h-4 text-green-400 mr-2" />
                <div>
                  <p className="text-sm text-white/60">Total Projects</p>
                  <p className="text-2xl font-bold text-white">{projects?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-white mr-2" />
                <div>
                  <p className="text-sm text-white/60">This Month</p>
                  <p className="text-2xl font-bold text-white">
                    {projects?.filter(project => {
                      const projectDate = new Date(project.created_at);
                      const now = new Date();
                      return projectDate.getMonth() === now.getMonth() && projectDate.getFullYear() === now.getFullYear();
                    }).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Code className="w-4 h-4 text-purple-400 mr-2" />
                <div>
                  <p className="text-sm text-white/60">With Repo</p>
                  <p className="text-2xl font-bold text-white">
                    {projects?.filter(project => project.repo_url).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center">
                <ExternalLink className="w-4 h-4 text-orange-400 mr-2" />
                <div>
                  <p className="text-sm text-white/60">Tech Tags</p>
                  <p className="text-2xl font-bold text-white">
                    {projects ? new Set(projects.flatMap(project => project.tech_tags || [])).size : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-white">{editingProject ? 'Edit Project' : 'Create New Project'}</CardTitle>
              <CardDescription className="text-white/60">
                {editingProject ? 'Update your project details' : 'Add a new project to your portfolio'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Project Title</label>
                  <Input
                    placeholder="Enter project title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Short Description</label>
                  <Textarea
                    placeholder="Brief description that appears on project cards"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Full Description</label>
                  <Textarea
                    placeholder="Detailed description for the project detail page"
                    value={formData.full_description}
                    onChange={(e) => setFormData({...formData, full_description: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Repository URL</label>
                    <Input
                      placeholder="https://github.com/username/project"
                      value={formData.repo_url}
                      onChange={(e) => setFormData({...formData, repo_url: e.target.value})}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Technologies Used</label>
                  <Input
                    placeholder="React, TypeScript, Node.js, PostgreSQL"
                    value={formData.tech_tags}
                    onChange={(e) => setFormData({...formData, tech_tags: e.target.value})}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={addProjectMutation.isPending || updateProjectMutation.isPending}
                    className="bg-white/10 text-white hover:bg-white/20"
                  >
                    {editingProject 
                      ? (updateProjectMutation.isPending ? 'Updating...' : 'Update Project')
                      : (addProjectMutation.isPending ? 'Creating...' : 'Create Project')
                    }
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost"
                    className="text-white hover:bg-white/10 hover:text-white"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProject(null);
                      setFormData({ title: '', description: '', full_description: '', image_url: '', tech_tags: '', repo_url: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Projects List */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">All Projects</CardTitle>
            <CardDescription className="text-white/60">
              Manage your portfolio projects and showcase your work
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(isLoading || isFetching) ? (
              <div className="text-center py-12">
                <div className="text-white/60">Loading projects...</div>
              </div>
            ) : projects && projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-white/60 mb-4">Create your first project to showcase your work</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Project
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects?.map((project) => (
                  <div key={project.id} className="p-6 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                          {project.tech_tags && project.tech_tags.length > 0 && (
                            <div className="flex gap-1">
                              {project.tech_tags.slice(0, 3).map((tech, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {project.tech_tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{project.tech_tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-white/60 text-sm mb-3 line-clamp-2">
                          {project.description || 'No description available'}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-white/40">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(project.created_at).toLocaleDateString()}
                          </div>
                          {project.repo_url && (
                            <div className="flex items-center gap-1">
                              <Code className="w-3 h-3" />
                              Repository available
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            /projects/{project.id}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          asChild 
                          size="sm" 
                          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                        >
                          <Link to={`/projects/${project.id}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleEditClick(project)}
                          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleDeleteClick(project.id)}
                          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                        >
                          <Trash2 className="w-4 h-4" />
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
