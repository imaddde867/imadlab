-- Restore the history row for the Mellum2.1 blog newsletter (sent 2026-10-12 08:52:07 UTC),
-- removed during the queue cleanup, so the admin page does not offer to send it again.
insert into public.email_queue (content_type, content_id, status, scheduled_at, sent_at, created_at)
select 'blog_post', p.id, 'sent', '2026-10-11 16:41:56+00', '2026-10-12 08:52:07+00', '2026-10-11 16:41:56+00'
from public.posts p
where p.slug = 'quantization-format-and-reasoning-length-in-mellum2-1'
  and not exists (
    select 1 from public.email_queue q where q.content_id = p.id and q.status = 'sent'
  );
