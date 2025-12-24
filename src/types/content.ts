export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  tags: string[] | null;
  published_date: string;
  read_time: number | null;
  image_url: string | null;
};

export type PostDetail = PostSummary & {
  body: string | null;
  updated_at?: string | null;
};

export type PostAdmin = PostDetail & {
  created_at: string;
};

export type ProjectSummary = {
  id: string;
  title: string;
  description: string | null;
  full_description?: string | null;
  image_url: string | null;
  tech_tags: string[] | null;
  repo_url: string | null;
  demo_url?: string | null;
  featured?: boolean | null;
  created_at: string;
  updated_at?: string | null;
};

export type ProjectDetail = ProjectSummary & {
  full_description: string | null;
  updated_at?: string | null;
};
