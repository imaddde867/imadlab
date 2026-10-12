-- Newsletter sending is now manual, from the admin Newsletter page.
-- Remove the triggers that auto-queued an email for every new post/project,
-- and clear queue rows that were never sent. 'sent' rows stay as history.

drop trigger if exists trigger_queue_blog_post_email on public.posts;
drop trigger if exists trigger_queue_project_email on public.projects;
drop function if exists public.queue_newsletter_email();

delete from public.email_queue where status in ('pending', 'failed');
