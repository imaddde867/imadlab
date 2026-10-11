-- Hide projects from the public site without deleting them.
alter table public.projects
  add column if not exists published boolean not null default true;

drop policy if exists "Anyone can view projects" on public.projects;
drop policy if exists "Public can read projects" on public.projects;
drop policy if exists "projects_select_all" on public.projects;

create policy "projects_select_published_or_admin" on public.projects
  for select
  using (
    published
    or (select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid
  );
