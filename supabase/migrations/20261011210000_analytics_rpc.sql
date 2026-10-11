-- Analytics write path via security definer RPCs, so anon no longer needs
-- table write access. Purely additive; safe while the old client is live.

create or replace function public.track_session(
  p_session_id text, p_user_agent text, p_device_type text, p_browser text,
  p_os text, p_screen_resolution text, p_language text, p_timezone text
) returns void
language sql security definer set search_path = public
as $$
  insert into public.visitor_sessions
    (session_id, last_activity, user_agent, device_type, browser, os, screen_resolution, language, timezone)
  select left(p_session_id, 128), now(), left(p_user_agent, 512), left(p_device_type, 64),
    left(p_browser, 128), left(p_os, 128), left(p_screen_resolution, 64), left(p_language, 64), left(p_timezone, 128)
  where length(coalesce(p_session_id, '')) > 0
  on conflict (session_id) do update set
    last_activity = now(),
    user_agent = excluded.user_agent,
    device_type = excluded.device_type,
    browser = excluded.browser,
    os = excluded.os,
    screen_resolution = excluded.screen_resolution,
    language = excluded.language,
    timezone = excluded.timezone;
$$;

create or replace function public.track_page_view(
  p_session_id text, p_path text, p_referrer text, p_traffic_source text,
  p_utm_source text, p_utm_medium text, p_utm_campaign text, p_utm_term text,
  p_utm_content text, p_device_type text, p_browser text, p_os text
) returns uuid
language sql security definer set search_path = public
as $$
  insert into public.page_views
    (session_id, path, referrer, traffic_source, utm_source, utm_medium, utm_campaign,
     utm_term, utm_content, device_type, browser, os)
  values (left(p_session_id, 128), left(p_path, 512), left(p_referrer, 1024), left(p_traffic_source, 128),
    left(p_utm_source, 256), left(p_utm_medium, 256), left(p_utm_campaign, 256),
    left(p_utm_term, 256), left(p_utm_content, 256), left(p_device_type, 64),
    left(p_browser, 128), left(p_os, 128))
  returning id;
$$;

create or replace function public.set_page_view_duration(p_id uuid, p_duration int)
returns void
language sql security definer set search_path = public
as $$
  update public.page_views set duration = p_duration
  where id = p_id and p_duration > 0 and p_duration <= 86400;
$$;

revoke all on function public.track_session(text,text,text,text,text,text,text,text) from public;
revoke all on function public.track_page_view(text,text,text,text,text,text,text,text,text,text,text,text) from public;
revoke all on function public.set_page_view_duration(uuid,int) from public;
grant execute on function public.track_session(text,text,text,text,text,text,text,text) to anon, authenticated;
grant execute on function public.track_page_view(text,text,text,text,text,text,text,text,text,text,text,text) to anon, authenticated;
grant execute on function public.set_page_view_duration(uuid,int) to anon, authenticated;
