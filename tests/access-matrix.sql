begin;
create function pg_temp.check_true(ok boolean, message text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception '%', message; end if; end $$;
create function pg_temp.denied(statement text) returns boolean language plpgsql as $$
begin execute statement; return false; exception when insufficient_privilege then return true; end $$;
insert into projects(id,title,published) values
 ('00000000-0000-0000-0000-000000000001','Synthetic public',true),
 ('00000000-0000-0000-0000-000000000002','Synthetic draft',false);
insert into posts(title,slug) values ('Synthetic post','synthetic-post');
insert into newsletter_subscribers(email) values ('private@example.test');
insert into visitor_sessions(session_id) values ('synthetic-private');
insert into page_views(session_id,path) values ('synthetic-private','/private');

-- Public, ordinary, and forged user_metadata contexts all have public-only access.
do $$
declare claims jsonb; client_role text; n bigint;
begin
 for claims in select value from jsonb_array_elements('[
  {"role":"anon"},
  {"role":"authenticated","sub":"00000000-0000-0000-0000-000000000020"},
  {"role":"authenticated","sub":"00000000-0000-0000-0000-000000000021","user_metadata":{"role":"admin"}}
 ]'::jsonb) loop
  client_role := claims->>'role';
  perform set_config('request.jwt.claims',claims::text,true);
  execute format('set local role %I',client_role);
  perform pg_temp.check_true(not public.is_admin(),'untrusted user was authorized');
  select count(*) into n from projects;
  perform pg_temp.check_true(n=1,'public project visibility');
  select count(*) into n from posts;
  perform pg_temp.check_true(n=1,'public post visibility');
  perform pg_temp.check_true(pg_temp.denied($q$insert into projects(title) values ('forbidden')$q$),'untrusted content insert');
  if client_role='anon' then
   perform pg_temp.check_true(pg_temp.denied('select * from newsletter_subscribers'),'anonymous private subscriber read');
   perform pg_temp.check_true(pg_temp.denied('select * from visitor_sessions'),'anonymous session read');
   perform pg_temp.check_true(pg_temp.denied('select * from page_views'),'anonymous page-view read');
   perform pg_temp.check_true(pg_temp.denied($q$update projects set title='forbidden'$q$),'anonymous content update');
   perform pg_temp.check_true(pg_temp.denied('delete from projects'),'anonymous content delete');
  else
   select count(*) into n from newsletter_subscribers;
   perform pg_temp.check_true(n=0,'ordinary private subscriber read');
   select count(*) into n from visitor_sessions;
   perform pg_temp.check_true(n=0,'ordinary session read');
   select count(*) into n from page_views;
   perform pg_temp.check_true(n=0,'ordinary page-view read');
   with changed as (update projects set title='forbidden' returning id) select count(*) into n from changed;
   perform pg_temp.check_true(n=0,'ordinary content update');
   with changed as (delete from projects returning id) select count(*) into n from changed;
   perform pg_temp.check_true(n=0,'ordinary content delete');
  end if;
  perform pg_temp.check_true(pg_temp.denied($q$insert into visitor_sessions(session_id) values ('forbidden')$q$),'direct telemetry insert');
  perform pg_temp.check_true(pg_temp.denied($q$update page_views set duration=42$q$),'direct telemetry update');
  perform pg_temp.check_true(pg_temp.denied($q$insert into newsletter_subscribers(email,status) values ('override@example.test','inactive')$q$),'subscriber server fields override');
  execute format('insert into newsletter_subscribers(email) values (%L)',client_role || coalesce(claims->>'sub','visitor') || '@example.test');
  perform public.track_session('synthetic-'||coalesce(claims->>'sub','anon'),'agent','desktop','browser','os','1x1','en','UTC');
  perform public.track_page_view('synthetic-'||coalesce(claims->>'sub','anon'),'/fixture',null,'direct',null,null,null,null,null,'desktop','browser','os');
  execute 'reset role';
 end loop;
end $$;
-- Legitimate admin sees drafts, manages content and private records.
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000010","app_metadata":{"role":"admin"},"role":"authenticated"}',true);
select pg_temp.check_true(public.is_admin(),'server-provisioned admin');
select pg_temp.check_true((select count(*)=2 from projects),'admin sees draft');
insert into projects(title) values ('Synthetic CRUD');
update projects set description='saved' where title='Synthetic CRUD';
select pg_temp.check_true((select count(*)=1 from projects where description='saved'),'admin update');
delete from projects where title='Synthetic CRUD';
select pg_temp.check_true((select count(*)=0 from projects where title='Synthetic CRUD'),'admin delete');
insert into posts(title,slug) values ('Synthetic CRUD','synthetic-crud');
update posts set title='Synthetic updated' where slug='synthetic-crud';
select pg_temp.check_true((select count(*)=1 from posts where title='Synthetic updated'),'admin post update');
delete from posts where slug='synthetic-crud';
select pg_temp.check_true((select count(*)>0 from newsletter_subscribers),'admin subscribers');
select pg_temp.check_true((select count(*)>0 from visitor_sessions),'admin analytics');
select * from analytics_summary;
reset role;
-- Service remains privileged and is never supplied to clients.
set local role service_role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
select pg_temp.check_true((select count(*)=2 from projects),'service sees drafts');
insert into newsletter_subscribers(email,status) values ('service@example.test','inactive');
update visitor_sessions set country='Synthetic' where session_id='synthetic-private';
select pg_temp.check_true((select count(*)=1 from visitor_sessions where country='Synthetic'),'service enrichment');
reset role;
rollback;
