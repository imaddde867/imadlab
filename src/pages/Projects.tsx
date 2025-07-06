import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Plus, X, Github, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

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

const Projects = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    full_description: '',
    image_url: '',
    tech_tags: '',
    repo_url: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
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
      setFormData({ title: '', description: '', full_description: '', image_url: '', tech_tags: '', repo_url: '' });
      toast({ title: 'Project added successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error adding project', description: error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const techTagsArray = formData.tech_tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    addProjectMutation.mutate({
      title: formData.title,
      description: formData.description || null,
      full_description: formData.full_description || null,
      image_url: formData.image_url || null,
      tech_tags: techTagsArray.length > 0 ? techTagsArray : null,
      repo_url: formData.repo_url || null
    });
  };

  return (
    <div className="min-h-screen bg-black text-white py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-black mb-4">Projects</h1>
            <div className="w-24 h-1 bg-white/40"></div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-white/10 hover:bg-white/20 border border-white/20"
          >
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? 'Cancel' : 'Add Project'}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 bg-white/[0.02] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Add New Project</CardTitle>
            </CardHeader>
            <CardContent>
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
                  disabled={addProjectMutation.isPending}
                  className="bg-white text-black hover:bg-white/90"
                >
                  {addProjectMutation.isPending ? 'Adding...' : 'Add Project'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-white/60">Loading projects...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <Card key={project.id} className="relative bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/30 transition-all duration-300 group">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between text-white">
                    <span className="text-xl font-bold">{project.title}</span>
                    <Link to={`/projects/${project.id}`}>
                      <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-transparent">
                        View Project
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-white/80 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                  {project.tech_tags && project.tech_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.tech_tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-white/10 rounded-full text-white/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
                {project.repo_url && (
                  <div className="absolute bottom-6 right-6">
                    <a
                      href={project.repo_url}
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
        )}

        {projects && projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/60 mb-4">No projects yet</div>
            <Button onClick={() => setShowForm(true)} className="bg-white/10 hover:bg-white/20">
              Add Your First Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
