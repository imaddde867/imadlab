import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  excerpt: string | null;
  tags: string[] | null;
  published_date: string;
  created_at: string;
  read_time: number | null;
  image_url: string | null;
}

const ManagePosts = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    body: '',
    excerpt: '',
    tags: '',
    image_url: ''
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

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('published_date', { ascending: false });
      
      if (error) throw error;
      // Ensure all required fields exist for Post type
      return (data as { read_time?: number; image_url?: string | null }[]).map((item) => ({
        ...item,
        read_time: item.read_time ?? 0,
        image_url: item.image_url ?? null,
      })) as Post[];
    }
  });

  const addPostMutation = useMutation({
    mutationFn: async (newPost: Omit<Post, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          ...newPost,
          tags: newPost.tags?.length ? newPost.tags : null
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setShowForm(false);
      setEditingPost(null);
      setFormData({ title: '', slug: '', body: '', excerpt: '', tags: '', image_url: '' });
      toast({ title: 'Post added successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error adding post', description: error.message, variant: 'destructive' });
    }
  });

  const updatePostMutation = useMutation({
    mutationFn: async (updatedPost: Post) => {
      const { data, error } = await supabase
        .from('posts')
        .update({
          title: updatedPost.title,
          slug: updatedPost.slug,
          body: updatedPost.body,
          excerpt: updatedPost.excerpt,
          tags: updatedPost.tags,
          published_date: updatedPost.published_date,
          read_time: updatedPost.read_time,
          image_url: updatedPost.image_url
        })
        .eq('id', updatedPost.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setShowForm(false);
      setEditingPost(null);
      setFormData({ title: '', slug: '', body: '', excerpt: '', tags: '', image_url: '' });
      toast({ title: 'Post updated successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error updating post', description: error.message, variant: 'destructive' });
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({ title: 'Post deleted successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting post', description: error.message, variant: 'destructive' });
    }
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const calculateReadTime = (text: string | null) => {
    if (!text) return 0;
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    });
  };

  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      body: post.body || '',
      excerpt: post.excerpt || '',
      tags: post.tags?.join(', ') || '',
      image_url: post.image_url || ''
    });
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim()) return;

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const postData = {
      title: formData.title,
      slug: formData.slug,
      body: formData.body || null,
      excerpt: formData.excerpt || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
      published_date: editingPost?.published_date || new Date().toISOString(),
      read_time: calculateReadTime(formData.body),
      image_url: formData.image_url || null
    };

    if (editingPost) {
      updatePostMutation.mutate({ ...editingPost, ...postData });
    } else {
      addPostMutation.mutate(postData);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/60 text-xl">Checking authentication...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/60">Loading posts...</div>
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
            <h1 className="text-5xl md:text-6xl font-black mb-4">Manage Blog Posts</h1>
            <div className="w-24 h-1 bg-white/40"></div>
          </div>
          <Button
            onClick={() => { setShowForm(!showForm); setEditingPost(null); setFormData({ title: '', slug: '', body: '', excerpt: '', tags: '', image_url: '' }); }}
            className="bg-white/10 hover:bg-white/20 border border-white/20"
          >
            {showForm ? 'Cancel' : 'Add New Post'}
          </Button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 bg-white/[0.02] border border-white/10 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{editingPost ? 'Edit Post' : 'Add New Post'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Post Title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                required
              />
              <Input
                placeholder="Slug (URL-friendly)"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                required
              />
              <Textarea
                placeholder="Excerpt (brief summary)"
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                rows={2}
              />
              <Textarea
                placeholder="Post Content"
                value={formData.body}
                onChange={(e) => setFormData({...formData, body: e.target.value})}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                rows={8}
              />
              <Input
                placeholder="Image URL"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
              />
              <Input
                placeholder="Tags (comma separated)"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
              />
              <Button 
                type="submit" 
                disabled={addPostMutation.isPending || updatePostMutation.isPending}
                className="bg-white text-black hover:bg-white/90"
              >
                {editingPost ? (updatePostMutation.isPending ? 'Updating...' : 'Update Post') : (addPostMutation.isPending ? 'Adding...' : 'Add Post')}
              </Button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts?.map((post) => (
            <div key={post.id} className="bg-white/[0.02] border border-white/10 rounded-lg p-4 flex flex-col">
              <h3 className="text-xl font-bold mb-2">{post.title}</h3>
              <p className="text-white/70 text-sm mb-2">Slug: {post.slug}</p>
              <p className="text-white/70 text-sm mb-4">Published: {new Date(post.published_date).toLocaleDateString()}</p>
              <div className="flex gap-2 mt-auto">
                <Button asChild className="bg-green-600 hover:bg-green-700 text-white flex-1">
                  <Link to={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                    Open
                  </Link>
                </Button>
                <Button onClick={() => handleEditClick(post)} className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button onClick={() => handleDeleteClick(post.id)} className="bg-red-600 hover:bg-red-700 text-white flex-1">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {posts && posts.length === 0 && !showForm && (
          <div className="text-center py-12">
            <div className="text-white/60 mb-4">No posts yet. Add your first post!</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePosts;
