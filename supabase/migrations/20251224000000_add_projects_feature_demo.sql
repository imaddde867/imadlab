-- Add metadata fields to better showcase portfolio projects
-- - featured: pins projects to the top of listings
-- - demo_url: link to a live demo / deployed site

alter table if exists public.projects
  add column if not exists featured boolean not null default false,
  add column if not exists demo_url text;

create index if not exists projects_featured_created_at_idx
  on public.projects (featured, created_at desc);

