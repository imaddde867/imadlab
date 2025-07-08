import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';

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
            Back to Dashboard
          </Link>
        </div>
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-black mb-4">Manage Projects</h1>
            <div className="w-24 h-1 bg-white/40"></div>
          </div>
          <Button
            onClick={() => { setShowForm(!showForm); setEditingProject(null); setFormData({ title: '', description: '', full_description: '', image_url: '', tech_tags: '', repo_url: '' }); }}
            className="bg-white/10 hover:bg-white/20 border border-white/20"
          >
            {showForm ? 'Cancel' : 'Add New Project'}
          </Button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 bg-white/[0.02] border border-white/10 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Project Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                required
              />
              <Textarea
                placeholder="Short Description (appears on project card)"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                rows={2}
              />
              <Textarea
                placeholder="Full Description (appears on project detail page)"
                value={formData.full_description}
                onChange={(e) => setFormData({...formData, full_description: e.target.value})}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                rows={5}
              />
              <Input
                placeholder="Image URL"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
              />
              <Input
                placeholder="Tech Tags (comma separated)"
                value={formData.tech_tags}
                onChange={(e) => setFormData({...formData, tech_tags: e.target.value})}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
              />
              <Input
                placeholder="Repository URL"
                value={formData.repo_url}
                onChange={(e) => setFormData({...formData, repo_url: e.target.value})}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
              />
              <Button 
                type="submit" 
                disabled={addProjectMutation.isPending || updateProjectMutation.isPending}
                className="bg-white text-black hover:bg-white/90"
              >
                {editingProject ? (updateProjectMutation.isPending ? 'Updating...' : 'Update Project') : (addProjectMutation.isPending ? 'Adding...' : 'Add Project')}
              </Button>
            </form>
          </div>
        )}

        {(isLoading || isFetching) ? (
          <div className="text-center py-12">
            <div className="text-white/60">Loading projects...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <div key={project.id} className="bg-white/[0.02] border border-white/10 rounded-lg p-4 flex flex-col">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-white/70 text-sm mb-4">Description: {project.description}</p>
                <div className="flex gap-2 mt-auto">
                  <Button asChild className="bg-green-600 hover:bg-green-700 text-white flex-1">
                    <Link to={`/projects/${project.id}`} target="_blank" rel="noopener noreferrer">
                      Open
                    </Link>
                  </Button>
                  <Button onClick={() => handleEditClick(project)} className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button onClick={() => handleDeleteClick(project.id)} className="bg-red-600 hover:bg-red-700 text-white flex-1">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {projects && projects.length === 0 && !showForm && (
          <div className="text-center py-12">
            <div className="text-white/60 mb-4">No projects yet. Add your first project!</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProjects;
