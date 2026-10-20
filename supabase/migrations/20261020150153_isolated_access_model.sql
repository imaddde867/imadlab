-- Candidate only: apply in isolation before owner-controlled production rollout.
begin;

-- Matches the existing edge-function authorization, retaining the owner allowlist.
create or replace function public.is_admin() returns boolean
language sql stable security invoker set search_path = ''
as $$
 select coalesce(auth.uid() = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid
   or (auth.jwt()->'app_metadata'->>'role') = 'admin', false);
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- Replace the observed policies together: permissive policies combine with OR.
do $$
declare t text; p record;
begin
 foreach t in array array['posts','projects','newsletter_subscribers','email_queue','email_analytics','visitor_sessions','page_views','cursor_preferences'] loop
  execute format('alter table public.%I enable row level security', t);
  for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
   execute format('drop policy %I on public.%I', p.policyname, t);
  end loop;
  execute format('revoke all on public.%I from public, anon, authenticated',t);
  execute format('grant all on public.%I to service_role',t);
  if t in ('posts','projects','email_queue','email_analytics','newsletter_subscribers') then
   execute format('grant select, update, delete on public.%I to authenticated',t);
   execute format('create policy admin_update on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',t);
   execute format('create policy admin_delete on public.%I for delete to authenticated using ((select public.is_admin()))',t);
   if t <> 'newsletter_subscribers' then
    execute format('grant insert on public.%I to authenticated',t);
    execute format('create policy admin_insert on public.%I for insert to authenticated with check ((select public.is_admin()))',t);
   end if;
  else
   execute format('grant select on public.%I to authenticated',t);
  end if;
  execute format('create policy admin_read on public.%I for select to authenticated using ((select public.is_admin()))',t);
 end loop;
end $$;

grant select on public.posts, public.projects to anon, authenticated;
create policy public_read on public.posts for select to anon, authenticated using (true);
create policy public_read on public.projects for select to anon, authenticated using (published);

-- Signup accepts only an email; tokens, status and timestamps stay server-generated.
grant insert(email) on public.newsletter_subscribers to anon, authenticated;
create policy public_signup on public.newsletter_subscribers for insert to anon, authenticated
 with check (status = 'active' and length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$');

alter view public.analytics_summary set (security_invoker = true);
revoke all on public.analytics_summary from public, anon;
grant select on public.analytics_summary to authenticated, service_role;

create or replace function public.track_session(
  p_session_id text, p_user_agent text, p_device_type text, p_browser text,
  p_os text, p_screen_resolution text, p_language text, p_timezone text
) returns void
language sql security definer set search_path = ''
as $$
  insert into public.visitor_sessions
    (session_id, last_activity, user_agent, device_type, browser, os, screen_resolution, language, timezone)
  select left(p_session_id, 128), now(), left(p_user_agent, 512), left(p_device_type, 64),
    left(p_browser, 128), left(p_os, 128), left(p_screen_resolution, 64), left(p_language, 64), left(p_timezone, 128)
  where length(coalesce(p_session_id, '')) > 0
  on conflict (session_id) do nothing;
$$;

create or replace function public.track_page_view(
  p_session_id text, p_path text, p_referrer text, p_traffic_source text,
  p_utm_source text, p_utm_medium text, p_utm_campaign text, p_utm_term text,
  p_utm_content text, p_device_type text, p_browser text, p_os text
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare result uuid;
begin
  if p_session_id is null or length(p_session_id) not between 1 and 128
     or p_path is null or length(p_path) not between 1 and 512 or left(p_path,1) <> '/' then
    raise exception 'Invalid telemetry session or path' using errcode = '22023';
  end if;
  insert into public.page_views
    (session_id, path, referrer, traffic_source, utm_source, utm_medium, utm_campaign,
     utm_term, utm_content, device_type, browser, os)
  values (left(p_session_id, 128), left(p_path, 512), left(p_referrer, 1024), left(p_traffic_source, 128),
    left(p_utm_source, 256), left(p_utm_medium, 256), left(p_utm_campaign, 256),
    left(p_utm_term, 256), left(p_utm_content, 256), left(p_device_type, 64),
    left(p_browser, 128), left(p_os, 128))
  returning id into result;
  return result;
end;
$$;

revoke all on function public.track_page_view(text,text,text,text,text,text,text,text,text,text,text,text) from public;
grant execute on function public.track_page_view(text,text,text,text,text,text,text,text,text,text,text,text) to anon, authenticated, service_role;

-- Duration updates identify rows only by caller-provided ID; remove that public path.
revoke all on function public.set_page_view_duration(uuid,integer) from public, anon, authenticated;
revoke all on function public.track_session(text,text,text,text,text,text,text,text) from public;
grant execute on function public.track_session(text,text,text,text,text,text,text,text) to anon, authenticated, service_role;
commit;
