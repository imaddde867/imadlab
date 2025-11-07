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
  Clock,
  Tag as TagIcon,
  ExternalLink,
} from 'lucide-react';

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

type PostFormState = {
  title: string;
  slug: string;
  body: string;
  excerpt: string;
  tags: string;
  image_url: string;
};

const createEmptyPostForm = (): PostFormState => ({
  title: '',
  slug: '',
  body: '',
  excerpt: '',
  tags: '',
  image_url: '',
});

const ManagePosts = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<PostFormState>(createEmptyPostForm);
  const [authChecked, setAuthChecked] = useState(false);

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
    },
  });

  const postsList = useMemo(() => posts ?? [], [posts]);
  const totalPosts = postsList.length;

  const postsThisMonth = useMemo(() => {
    if (!postsList.length) return 0;
    const now = new Date();
    return postsList.filter((post) => {
      const postDate = new Date(post.created_at);
      return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
    }).length;
  }, [postsList]);

  const averageReadTime = useMemo(() => {
    if (!postsList.length) return 0;
    const total = postsList.reduce((accumulator, post) => accumulator + (post.read_time || 0), 0);
    return Math.round(total / postsList.length);
  }, [postsList]);

  const totalTags = useMemo(() => {
    if (!postsList.length) return 0;
    return new Set(postsList.flatMap((post) => post.tags || [])).size;
  }, [postsList]);

  const headerMeta = useMemo(
    () => [
      {
        label: `${totalPosts} total posts`,
        icon: <Eye className="h-3.5 w-3.5" aria-hidden="true" />,
        variant: 'neutral' as const,
      },
      {
        label: `${postsThisMonth} this month`,
        icon: <Calendar className="h-3.5 w-3.5" aria-hidden="true" />,
        variant: 'subtle' as const,
      },
      {
        label: `${totalTags} unique tags`,
        icon: <TagIcon className="h-3.5 w-3.5" aria-hidden="true" />,
        variant: 'outline' as const,
      },
      {
        label: `${averageReadTime || 0} min avg read`,
        icon: <Clock className="h-3.5 w-3.5" aria-hidden="true" />,
        variant: 'subtle' as const,
      },
    ],
    [averageReadTime, postsThisMonth, totalPosts, totalTags]
  );

  const overviewStats = useMemo(
    () => [
      {
        label: 'Total posts',
        value: totalPosts,
        icon: <Eye className="h-4 w-4 text-white/80" aria-hidden="true" />,
      },
      {
        label: 'Published this month',
        value: postsThisMonth,
        icon: <Calendar className="h-4 w-4 text-emerald-300" aria-hidden="true" />,
      },
      {
        label: 'Average read time',
        value: `${averageReadTime || 0}m`,
        icon: <Clock className="h-4 w-4 text-sky-300" aria-hidden="true" />,
      },
      {
        label: 'Unique tags',
        value: totalTags,
        icon: <TagIcon className="h-4 w-4 text-amber-300" aria-hidden="true" />,
      },
    ],
    [averageReadTime, postsThisMonth, totalPosts, totalTags]
  );

  const isPostsLoading = isLoading;

  const addPostMutation = useMutation({
    mutationFn: async (newPost: Omit<Post, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            ...newPost,
            tags: newPost.tags?.length ? newPost.tags : null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      closeForm();
      toast({ title: 'Post added successfully!' });
    },
    onError: (error) => {
      toast({
        title: 'Error adding post',
        description: error.message,
        variant: 'destructive',
      });
    },
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
          image_url: updatedPost.image_url,
        })
        .eq('id', updatedPost.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      closeForm();
      toast({ title: 'Post updated successfully!' });
    },
    onError: (error) => {
      toast({
        title: 'Error updating post',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const isMutating = addPostMutation.isPending || updatePostMutation.isPending;

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('posts').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({ title: 'Post deleted successfully!' });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting post',
        description: error.message,
        variant: 'destructive',
      });
    },
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
    const words = text.split(/\s+/).filter((word) => word.length > 0).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const resetForm = () => setFormData(createEmptyPostForm());

  const closeForm = () => {
    setShowForm(false);
    setEditingPost(null);
    resetForm();
  };

  const openCreateForm = () => {
    setShowForm(true);
    setEditingPost(null);
    resetForm();
  };

  const handleToggleForm = () => {
    if (showForm) {
      closeForm();
    } else {
      openCreateForm();
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
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
      image_url: post.image_url || '',
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
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const postData = {
      title: formData.title,
      slug: formData.slug,
      body: formData.body || null,
      excerpt: formData.excerpt || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
      published_date: editingPost?.published_date || new Date().toISOString(),
      read_time: calculateReadTime(formData.body),
      image_url: formData.image_url || null,
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

  const hasPosts = postsList.length > 0;

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container-site space-y-10 pb-24">
        <PageHeader
          eyebrow="Admin Suite"
          title="Blog Posts"
          description="Craft, edit, and publish articles across imadlab while keeping tabs on performance."
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Posts', href: '/admin/posts' },
          ]}
          meta={headerMeta}
          actions={
            <Button
              variant={showForm ? 'outline' : 'inverted'}
              size="lg"
              onClick={handleToggleForm}
              disabled={isMutating}
            >
              <Plus className="h-4 w-4 mr-2" />
              {showForm ? 'Cancel' : 'New Post'}
            </Button>
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

        {showForm && (
          <Card className="rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(15,23,42,0.45)] backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </CardTitle>
              <CardDescription className="text-white/70">
                {editingPost
                  ? 'Update your blog post details'
                  : 'Add a new blog post to your collection'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Title</label>
                    <Input
                      placeholder="Enter post title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Slug</label>
                    <Input
                      placeholder="url-friendly-slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Excerpt</label>
                  <Textarea
                    placeholder="Brief summary of your post"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Content</label>
                  <Textarea
                    placeholder="Write your post content here..."
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    rows={12}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Featured Image URL</label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Tags</label>
                    <Input
                      placeholder="react, typescript, web development"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" variant="inverted" disabled={isMutating}>
                    {editingPost
                      ? updatePostMutation.isPending
                        ? 'Updating...'
                        : 'Update Post'
                      : addPostMutation.isPending
                        ? 'Creating...'
                        : 'Create Post'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={closeForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        <Card className="rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(15,23,42,0.45)] backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">All Posts</CardTitle>
            <CardDescription className="text-white/70">
              Manage your blog posts and track their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPostsLoading ? (
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
            ) : !hasPosts ? (
              <div className="py-12 text-center">
                <Eye className="mx-auto mb-4 h-12 w-12 text-white/20" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-white">No posts yet</h3>
                <p className="mt-3 text-sm text-white/70">
                  Create your first blog post to get started.
                </p>
                <Button className="mt-6" variant="inverted" onClick={openCreateForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Post
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {postsList.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-white/10 bg-black/60 p-6 shadow-[0_16px_48px_rgba(15,23,42,0.45)] backdrop-blur-sm transition hover:border-white/20"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <h3 className="text-xl font-semibold text-white">{post.title}</h3>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {post.tags.slice(0, 3).map((tag, index) => (
                                <TagChip
                                  key={`${post.id}-tag-${index}`}
                                  size="xs"
                                  variant="outline"
                                  className="text-white/80"
                                >
                                  {tag}
                                </TagChip>
                              ))}
                              {post.tags.length > 3 && (
                                <TagChip size="xs" variant="subtle" className="text-white/80">
                                  +{post.tags.length - 3}
                                </TagChip>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-white/70 line-clamp-2">
                          {post.excerpt || 'No excerpt available'}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-white/60">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-white/50" aria-hidden="true" />
                            {new Date(post.published_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-white/50" aria-hidden="true" />
                            {post.read_time || 0} min read
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ExternalLink
                              className="h-3.5 w-3.5 text-white/50"
                              aria-hidden="true"
                            />
                            /{post.slug}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="soft" size="sm">
                          <Link
                            to={`/blogs/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </Link>
                        </Button>
                        <Button variant="soft" size="sm" onClick={() => handleEditClick(post)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(post.id)}
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

export default ManagePosts;
