import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import CardItem from '@/components/ui/CardItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, ArrowLeft } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  excerpt: string | null;
  tags: string[] | null;
  published_date: string;
  created_at: string;
}

const Blogs = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    body: '',
    excerpt: '',
    tags: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('published_date', { ascending: false });
      
      if (error) throw error;
      return data as Post[];
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
      setFormData({ title: '', slug: '', body: '', excerpt: '', tags: '' });
      toast({ title: 'Post added successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error adding post', description: error.message, variant: 'destructive' });
    }
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim()) return;

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    addPostMutation.mutate({
      title: formData.title,
      slug: formData.slug,
      body: formData.body || null,
      excerpt: formData.excerpt || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
      published_date: new Date().toISOString()
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
            <h1 className="text-5xl md:text-6xl font-black mb-4">Blog</h1>
            <div className="w-24 h-1 bg-white/40"></div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-white/10 hover:bg-white/20 border border-white/20"
          >
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? 'Cancel' : 'Add Post'}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 bg-white/[0.02] border-white/10">
            <CardHeader>
              <CardTitle>Add New Post</CardTitle>
            </CardHeader>
            <CardContent>
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
                  placeholder="Tags (comma separated)"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
                <Button 
                  type="submit" 
                  disabled={addPostMutation.isPending}
                  className="bg-white text-black hover:bg-white/90"
                >
                  {addPostMutation.isPending ? 'Publishing...' : 'Publish Post'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-white/60">Loading posts...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts?.map((post) => (
              <CardItem
                key={post.id}
                title={post.title}
                tags={post.tags || []}
                date={new Date(post.published_date).toLocaleDateString()}
                excerpt={post.excerpt || ''}
                linkTo={`/blogs/${post.slug}`}
                linkLabel="Read More"
                isBlog={true}
              />
            ))}
          </div>
        )}

        {posts && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/60 mb-4">No posts yet</div>
            <Button onClick={() => setShowForm(true)} className="bg-white/10 hover:bg-white/20">
              Write Your First Post
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
