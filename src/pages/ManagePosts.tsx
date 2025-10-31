import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Tag,
  ExternalLink,
} from "lucide-react";

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
    title: "",
    slug: "",
    body: "",
    excerpt: "",
    tags: "",
    image_url: "",
  });
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
        navigate("/admin/login");
        toast({
          title: "Unauthorized",
          description: "Please log in to access this page.",
          variant: "destructive",
        });
      }
      setAuthChecked(true);
    };
    checkUser();
  }, [navigate, toast]);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("published_date", { ascending: false });

      if (error) throw error;
      // Ensure all required fields exist for Post type
      return (data as { read_time?: number; image_url?: string | null }[]).map(
        (item) => ({
          ...item,
          read_time: item.read_time ?? 0,
          image_url: item.image_url ?? null,
        })
      ) as Post[];
    },
  });

  const addPostMutation = useMutation({
    mutationFn: async (newPost: Omit<Post, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("posts")
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
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setShowForm(false);
      setEditingPost(null);
      setFormData({
        title: "",
        slug: "",
        body: "",
        excerpt: "",
        tags: "",
        image_url: "",
      });
      toast({ title: "Post added successfully!" });
    },
    onError: (error) => {
      toast({
        title: "Error adding post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async (updatedPost: Post) => {
      const { data, error } = await supabase
        .from("posts")
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
        .eq("id", updatedPost.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setShowForm(false);
      setEditingPost(null);
      setFormData({
        title: "",
        slug: "",
        body: "",
        excerpt: "",
        tags: "",
        image_url: "",
      });
      toast({ title: "Post updated successfully!" });
    },
    onError: (error) => {
      toast({
        title: "Error updating post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({ title: "Post deleted successfully!" });
    },
    onError: (error) => {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const calculateReadTime = (text: string | null) => {
    if (!text) return 0;
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).filter((word) => word.length > 0).length;
    return Math.ceil(words / wordsPerMinute);
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
      body: post.body || "",
      excerpt: post.excerpt || "",
      tags: post.tags?.join(", ") || "",
      image_url: post.image_url || "",
    });
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim()) return;

    const tagsArray = formData.tags
      .split(",")
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

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container-site">
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Blog Posts Management</h1>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingPost(null);
              setFormData({
                title: "",
                slug: "",
                body: "",
                excerpt: "",
                tags: "",
                image_url: "",
              });
            }}
            disabled={addPostMutation.isPending || updatePostMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? "Cancel" : "New Post"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Eye className="w-4 h-4 text-white mr-2" />
                <div>
                  <p className="text-sm text-white/60">Total Posts</p>
                  <p className="text-2xl font-bold text-white">{posts?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-green-400 mr-2" />
                <div>
                  <p className="text-sm text-white/60">This Month</p>
                  <p className="text-2xl font-bold text-white">
                    {posts?.filter((post) => {
                      const postDate = new Date(post.created_at);
                      const now = new Date();
                      return (
                        postDate.getMonth() === now.getMonth() &&
                        postDate.getFullYear() === now.getFullYear()
                      );
                    }).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-purple-400 mr-2" />
                <div>
                  <p className="text-sm text-white/60">Avg Read Time</p>
                  <p className="text-2xl font-bold text-white">
                    {posts && posts.length > 0
                      ? Math.round(
                          posts.reduce(
                            (acc, post) => acc + (post.read_time || 0),
                            0
                          ) / posts.length
                        )
                      : 0}
                    m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Tag className="w-4 h-4 text-orange-400 mr-2" />
                <div>
                  <p className="text-sm text-white/60">Total Tags</p>
                  <p className="text-2xl font-bold text-white">
                    {posts
                      ? new Set(posts.flatMap((post) => post.tags || [])).size
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-white">
                {editingPost ? "Edit Post" : "Create New Post"}
              </CardTitle>
              <CardDescription className="text-white/60">
                {editingPost
                  ? "Update your blog post details"
                  : "Add a new blog post to your collection"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">
                      Title
                    </label>
                    <Input
                      placeholder="Enter post title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">
                      Slug
                    </label>
                    <Input
                      placeholder="url-friendly-slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Excerpt
                  </label>
                  <Textarea
                    placeholder="Brief summary of your post"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Content
                  </label>
                  <Textarea
                    placeholder="Write your post content here..."
                    value={formData.body}
                    onChange={(e) =>
                      setFormData({ ...formData, body: e.target.value })
                    }
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    rows={12}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">
                      Featured Image URL
                    </label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">
                      Tags
                    </label>
                    <Input
                      placeholder="react, typescript, web development"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={
                      addPostMutation.isPending || updatePostMutation.isPending
                    }
                    className="bg-white text-black hover:bg-white/90"
                  >
                    {editingPost
                      ? updatePostMutation.isPending
                        ? "Updating..."
                        : "Update Post"
                      : addPostMutation.isPending
                      ? "Creating..."
                      : "Create Post"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-white hover:bg-white/10 hover:text-white"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPost(null);
                      setFormData({
                        title: "",
                        slug: "",
                        body: "",
                        excerpt: "",
                        tags: "",
                        image_url: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">All Posts</CardTitle>
            <CardDescription className="text-white/60">
              Manage your blog posts and track their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {posts && posts.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-white/60 mb-4">
                  Create your first blog post to get started
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Post
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts?.map((post) => (
                  <div
                    key={post.id}
                    className="p-6 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">
                            {post.title}
                          </h3>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex gap-1">
                              {post.tags.slice(0, 3).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {post.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{post.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <p className="text-white/60 text-sm mb-3 line-clamp-2">
                          {post.excerpt || "No excerpt available"}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-white/40">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.published_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.read_time || 0} min read
                          </div>
                          <div className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />/{post.slug}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          asChild
                          size="sm"
                          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                        >
                          <Link
                            to={`/blogs/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEditClick(post)}
                          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeleteClick(post.id)}
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

export default ManagePosts;
