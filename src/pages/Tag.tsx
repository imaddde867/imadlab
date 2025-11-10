import { useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Seo from '@/components/Seo';
import SectionHeader from '@/components/SectionHeader';
import CardItem from '@/components/ui/CardItem';
import { ArrowLeft } from 'lucide-react';
import { readPrerenderData } from '@/lib/prerender-data';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  tags: string[] | null;
  published_date: string;
  read_time: number | null;
  image_url: string | null;
}

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

const Tag = () => {
  const { tag } = useParams<{ tag: string }>();
  const decodedTag = useMemo(() => decodeURIComponent(tag ?? ''), [tag]);
  const initialPosts = useMemo(() => readPrerenderData<Post[]>(`tag:${decodedTag}`), [decodedTag]);
  const initialUpdatedAt = useRef<number | undefined>(initialPosts ? Date.now() : undefined);

  const { data: posts = [], isLoading, isFetching } = useQuery({
    queryKey: ['tag-posts', decodedTag],
    enabled: Boolean(decodedTag),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id,title,slug,excerpt,tags,published_date,read_time,image_url')
        .contains('tags', [decodedTag])
        .order('published_date', { ascending: false });
      if (error) throw error;
      return data as Post[];
    },
    initialData: initialPosts,
    initialDataUpdatedAt: initialUpdatedAt.current,
    staleTime: 60_000,
  });

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['tag-projects', decodedTag],
    enabled: Boolean(decodedTag),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id,title,description,full_description,image_url,tech_tags,repo_url,created_at')
        .contains('tech_tags', [decodedTag])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
    staleTime: 60_000,
  });

  const isSkeletonVisible = isLoading && !posts.length && !isFetching;

  return (
    <div className="min-h-screen bg-black text-white section pt-14">
      <Seo
        title={`Tag: ${decodedTag}`}
        description={`Articles tagged with ${decodedTag}.`}
        type="website"
        schemaType="CollectionPage"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blogs' },
          { name: `Tag: ${decodedTag}`, url: `https://imadlab.me/tags/${encodeURIComponent(decodedTag)}` },
        ]}
      />

      <div className="container-site">
        <div className="mb-8">
          <Link
            to="/blogs"
            className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>

        <SectionHeader title={<span className="text-brand-gradient">#{decodedTag}</span>} />

        {isSkeletonVisible ? (
          <div className="text-center py-12">
            <div className="text-white/60">Loading posts...</div>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-default">
            {posts.map((post) => (
              <CardItem
                key={post.id}
                title={post.title}
                tags={post.tags || []}
                date={new Date(post.published_date).toLocaleDateString()}
                excerpt={post.excerpt || ''}
                linkTo={`/blogs/${post.slug}`}
                linkLabel={`Read ${post.title}`}
                readTime={post.read_time || undefined}
                isBlog={true}
                image_url={post.image_url || undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-white/60">No posts for this tag yet.</div>
          </div>
        )}

        {/* Projects with this tag */}
        <div className="mt-12">
          <SectionHeader title={<span className="text-brand-gradient">Projects</span>} />
          {loadingProjects ? (
            <div className="text-center py-8 text-white/60">Loading projects...</div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-default">
              {projects.map((project) => (
                <CardItem
                  key={project.id}
                  title={project.title}
                  tags={project.tech_tags || []}
                  description={project.description || ''}
                  linkTo={`/projects/${project.id}`}
                  linkLabel="View Project"
                  githubUrl={project.repo_url || undefined}
                  image_url={project.image_url || undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">No projects for this tag yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tag;
