begin;
-- Synthetic session IDs only; the test is rolled back.
set local role anon;
do $$ begin
 begin
  perform public.track_page_view('', '', null, null, null, null, null, null, null, null, null, null);
  raise exception 'invalid telemetry was accepted';
 exception when invalid_parameter_value then null;
 end;
end $$;
reset role;
set local role anon;
select public.track_session('synthetic-session','original','desktop','test','test','1x1','en','UTC');
select public.track_session('synthetic-session','changed','desktop','test','test','1x1','en','UTC');
reset role;
do $$ begin
  if (select user_agent <> 'original' from visitor_sessions where session_id='synthetic-session') then
    raise exception 'anonymous telemetry changed an existing session';
  end if;
end $$;
set local role anon;
do $$ begin
  if has_function_privilege(current_user, 'public.set_page_view_duration(uuid,integer)', 'execute') then
    raise exception 'anonymous clients can update arbitrary page durations';
  end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000010","role":"authenticated","app_metadata":{"role":"admin"}}',true);
insert into projects(title) values ('Synthetic admin project');
update projects set description='Edited' where title='Synthetic admin project';
do $$ begin
 if (select count(*) from projects where title='Synthetic admin project' and description='Edited') <> 1 then
  raise exception 'server-provisioned admin CRUD failed';
 end if;
end $$;
delete from projects where title='Synthetic admin project';
reset role;
rollback;
