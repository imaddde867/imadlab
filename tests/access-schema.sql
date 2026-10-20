-- Synthetic schema fixture; no production rows. Do not run historical content migrations.
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;
create schema auth;
create schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;
grant usage on schema public, auth, extensions to anon, authenticated, service_role;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
create function auth.uid() returns uuid language sql stable as $$ select (auth.jwt()->>'sub')::uuid $$;
create function auth.role() returns text language sql stable as $$ select auth.jwt()->>'role' $$;
create table public."cursor_preferences" ("created_at" timestamptz default now(),
"session_id" text not null,
"id" uuid not null default gen_random_uuid() primary key,
"user_agent" text,
"cursor_name" text,
"updated_at" timestamptz default now());
alter table public."cursor_preferences" enable row level security;
create table public."email_analytics" ("sent_at" timestamptz,
"id" uuid not null default extensions.uuid_generate_v4() primary key,
"subscriber_email" text not null,
"unsubscribed_at" timestamptz,
"clicked_at" timestamptz,
"bounced_at" timestamptz,
"opened_at" timestamptz,
"delivered_at" timestamptz,
"created_at" timestamptz default now(),
"email_queue_id" uuid);
alter table public."email_analytics" enable row level security;
create table public."email_queue" ("status" text not null default 'pending'::text,
"id" uuid not null default extensions.uuid_generate_v4() primary key,
"content_id" uuid not null,
"error_message" text,
"created_at" timestamptz default now(),
"retry_count" int4 default 0,
"sent_at" timestamptz,
"scheduled_at" timestamptz default now(),
"content_type" text not null,
"recipient_emails" text[]);
alter table public."email_queue" enable row level security;
create table public."newsletter_subscribers" ("status" text default 'active'::text,
"id" uuid not null default extensions.uuid_generate_v4() primary key,
"created_at" timestamptz not null default now(),
"updated_at" timestamptz default now(),
"unsubscribe_token" uuid default extensions.uuid_generate_v4(),
"email" text not null);
alter table public."newsletter_subscribers" enable row level security;
create table public."page_views" ("duration" int4,
"utm_source" text,
"traffic_source" text,
"utm_medium" text,
"browser" text,
"path" text not null,
"id" uuid not null default gen_random_uuid() primary key,
"referrer" text,
"country" text,
"session_id" text,
"city" text,
"utm_content" text,
"utm_campaign" text,
"region" text,
"utm_term" text,
"viewed_at" timestamptz default now(),
"device_type" text,
"os" text);
alter table public."page_views" enable row level security;
create table public."posts" ("image_url" text,
"read_time" int4,
"title" text not null,
"excerpt" text,
"created_at" timestamptz not null default now(),
"tags" text[],
"body" text,
"id" uuid not null default gen_random_uuid() primary key,
"slug" text not null,
"updated_at" timestamptz not null default now(),
"published_date" timestamptz not null default now());
alter table public."posts" enable row level security;
create table public."projects" ("published" bool not null default true,
"repo_url" text,
"image_url" text,
"demo_url" text,
"title" text not null,
"featured" bool not null default false,
"id" uuid not null default gen_random_uuid() primary key,
"tech_tags" text[],
"full_description" text,
"updated_at" timestamptz not null default now(),
"description" text,
"created_at" timestamptz not null default now());
alter table public."projects" enable row level security;
create table public."visitor_sessions" ("country" text,
"city" text,
"region" text,
"device_type" text,
"timezone" text,
"created_at" timestamptz default now(),
"id" uuid not null default gen_random_uuid() primary key,
"last_activity" timestamptz default now(),
"session_id" text not null,
"screen_resolution" text,
"browser" text,
"os" text,
"user_agent" text,
"language" text);
alter table public."visitor_sessions" enable row level security;
alter table visitor_sessions add unique (session_id);
alter table newsletter_subscribers add unique (email);
grant all on all tables in schema public to anon, authenticated, service_role;
\if :upgrade
create policy "legacy_policy_1" on public."posts" for SELECT to "public" using (true);
create policy "legacy_policy_2" on public."posts" for SELECT to "public" using (true);
create policy "legacy_policy_3" on public."newsletter_subscribers" for ALL to "service_role" using (true);
create policy "legacy_policy_4" on public."email_queue" for ALL to "service_role" using ((( SELECT auth.role() AS role) = 'service_role'::text));
create policy "legacy_policy_5" on public."posts" for DELETE to "public" using ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_6" on public."posts" for UPDATE to "public" using ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_7" on public."projects" for DELETE to "public" using ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_8" on public."projects" for UPDATE to "public" using ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_9" on public."email_analytics" for ALL to "service_role" using ((( SELECT auth.role() AS role) = 'service_role'::text));
create policy "legacy_policy_10" on public."newsletter_subscribers" for INSERT to "anon" with check (true);
create policy "legacy_policy_11" on public."projects" for SELECT to "public" using ((published OR (( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid)));
create policy "legacy_policy_12" on public."email_analytics" for DELETE to "public" using ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_13" on public."email_analytics" for INSERT to "public" with check ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_14" on public."email_analytics" for UPDATE to "public" using ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid)) with check ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_15" on public."email_analytics" for SELECT to "public" using ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_16" on public."email_queue" for DELETE to "public" using ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_17" on public."email_queue" for INSERT to "public" with check ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_18" on public."email_queue" for UPDATE to "public" using ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid)) with check ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_19" on public."email_queue" for SELECT to "public" using ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_20" on public."newsletter_subscribers" for DELETE to "public" using ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_21" on public."newsletter_subscribers" for SELECT to "public" using ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_22" on public."newsletter_subscribers" for UPDATE to "public" using ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid)) with check ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_23" on public."posts" for INSERT to "public" with check ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_24" on public."projects" for INSERT to "public" with check ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_25" on public."visitor_sessions" for SELECT to "public" using ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_26" on public."page_views" for SELECT to "public" using ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
create policy "legacy_policy_27" on public."cursor_preferences" for SELECT to "public" using ((( SELECT auth.uid() AS uid) = '00000000-0000-0000-0000-000000000010'::uuid));
\endif
CREATE OR REPLACE FUNCTION public.track_session(p_session_id text, p_user_agent text, p_device_type text, p_browser text, p_os text, p_screen_resolution text, p_language text, p_timezone text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.track_page_view(p_session_id text, p_path text, p_referrer text, p_traffic_source text, p_utm_source text, p_utm_medium text, p_utm_campaign text, p_utm_term text, p_utm_content text, p_device_type text, p_browser text, p_os text)
 RETURNS uuid
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  insert into public.page_views
    (session_id, path, referrer, traffic_source, utm_source, utm_medium, utm_campaign,
     utm_term, utm_content, device_type, browser, os)
  values (left(p_session_id, 128), left(p_path, 512), left(p_referrer, 1024), left(p_traffic_source, 128),
    left(p_utm_source, 256), left(p_utm_medium, 256), left(p_utm_campaign, 256),
    left(p_utm_term, 256), left(p_utm_content, 256), left(p_device_type, 64),
    left(p_browser, 128), left(p_os, 128))
  returning id;
$function$
;
CREATE OR REPLACE FUNCTION public.set_page_view_duration(p_id uuid, p_duration integer)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  update public.page_views set duration = p_duration
  where id = p_id and p_duration > 0 and p_duration <= 86400;
$function$
;
create view public."analytics_summary" with (security_invoker=true) as  SELECT date_trunc('day'::text, viewed_at) AS date,
    count(*) AS total_views,
    count(DISTINCT session_id) AS unique_visitors,
    count(DISTINCT
        CASE
            WHEN ((referrer IS NULL) OR (referrer = ''::text)) THEN session_id
            ELSE NULL::text
        END) AS direct_visitors,
    count(DISTINCT
        CASE
            WHEN (traffic_source = 'search'::text) THEN session_id
            ELSE NULL::text
        END) AS search_visitors,
    count(DISTINCT
        CASE
            WHEN (traffic_source = 'social'::text) THEN session_id
            ELSE NULL::text
        END) AS social_visitors,
    count(DISTINCT
        CASE
            WHEN (traffic_source = 'referral'::text) THEN session_id
            ELSE NULL::text
        END) AS referral_visitors,
    avg(duration) AS avg_duration,
    count(DISTINCT path) AS unique_pages
   FROM page_views
  GROUP BY (date_trunc('day'::text, viewed_at))
  ORDER BY (date_trunc('day'::text, viewed_at)) DESC;
grant select on public.analytics_summary to anon, authenticated, service_role;
