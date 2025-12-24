-- Allow public (anon) users to read portfolio projects.
-- Without this, /projects may appear empty even when admin sees rows (RLS blocks anon selects).

drop policy if exists "Public can read projects" on public.projects;
create policy "Public can read projects"
  on public.projects
  for select
  using (true);
