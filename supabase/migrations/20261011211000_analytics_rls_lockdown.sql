-- Lock down visitor analytics tables. Apply ONLY after the RPC-based client
-- (and a geolocation function that uses the service role key) is deployed.

drop policy if exists "Allow public select on visitor_sessions" on public.visitor_sessions;
drop policy if exists "Allow public insert on visitor_sessions" on public.visitor_sessions;
drop policy if exists "Allow public update on visitor_sessions" on public.visitor_sessions;
drop policy if exists "Allow public select on page_views" on public.page_views;
drop policy if exists "Allow public insert on page_views" on public.page_views;
drop policy if exists "Allow public update on page_views" on public.page_views;
drop policy if exists "Allow public select on cursor_preferences" on public.cursor_preferences;
drop policy if exists "Allow public insert on cursor_preferences" on public.cursor_preferences;
drop policy if exists "Allow public update on cursor_preferences" on public.cursor_preferences;
drop policy if exists "Allow public delete on cursor_preferences" on public.cursor_preferences;

create policy "Admin can view visitor sessions" on public.visitor_sessions
  for select to public
  using ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid);

create policy "Admin can view page views" on public.page_views
  for select to public
  using ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid);

create policy "Admin can view cursor preferences" on public.cursor_preferences
  for select to public
  using ((select auth.uid()) = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid);
