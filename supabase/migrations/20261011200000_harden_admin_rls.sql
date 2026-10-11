-- Harden admin RLS: replace JWT role claims (user_metadata is user-editable,
-- app_metadata is redundant) with a check on the single admin uid.
-- Idempotent: drop if exists + create.

drop policy if exists "Admin users can delete email analytics" on public.email_analytics;
create policy "Admin users can delete email analytics" on public.email_analytics
  for delete to public
  using ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid);

drop policy if exists "Admin users can insert email analytics" on public.email_analytics;
create policy "Admin users can insert email analytics" on public.email_analytics
  for insert to public
  with check ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid);

drop policy if exists "Admin users can update email analytics" on public.email_analytics;
create policy "Admin users can update email analytics" on public.email_analytics
  for update to public
  using ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid)
  with check ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid);

drop policy if exists "Admin users can view email analytics" on public.email_analytics;
create policy "Admin users can view email analytics" on public.email_analytics
  for select to public
  using ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid);

drop policy if exists "Admin users can delete email queue" on public.email_queue;
create policy "Admin users can delete email queue" on public.email_queue
  for delete to public
  using ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid);

drop policy if exists "Admin users can insert email queue" on public.email_queue;
create policy "Admin users can insert email queue" on public.email_queue
  for insert to public
  with check ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid);

drop policy if exists "Admin users can update email queue" on public.email_queue;
create policy "Admin users can update email queue" on public.email_queue
  for update to public
  using ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid)
  with check ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid);

drop policy if exists "Admin users can view email queue" on public.email_queue;
create policy "Admin users can view email queue" on public.email_queue
  for select to public
  using ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid);

drop policy if exists "Admin users can delete subscribers" on public.newsletter_subscribers;
create policy "Admin users can delete subscribers" on public.newsletter_subscribers
  for delete to public
  using ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid);

drop policy if exists "Admin users can read subscribers" on public.newsletter_subscribers;
create policy "Admin users can read subscribers" on public.newsletter_subscribers
  for select to public
  using ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid);

drop policy if exists "Admin users can update subscribers" on public.newsletter_subscribers;
create policy "Admin users can update subscribers" on public.newsletter_subscribers
  for update to public
  using ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid)
  with check ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid);

drop policy if exists "posts_insert_admin" on public.posts;
create policy "posts_insert_admin" on public.posts
  for insert to public
  with check ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid);

drop policy if exists "projects_insert_admin" on public.projects;
create policy "projects_insert_admin" on public.projects
  for insert to public
  with check ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid);
