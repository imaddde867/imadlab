-- Resend's export shows the Mellum2.1 post newsletter reached only 1 of 11 subscribers
-- (the onboarding@resend.dev test sender only delivers to the account owner).
-- Mark it failed so the admin page offers "Try again" once a verified sender is set.
update public.email_queue q
set status = 'failed',
    retry_count = 0,
    error_message = 'Delivered to 1 of 11. Resend test sender only reaches the account owner; verify imadlab.com in Resend first.'
from public.posts p
where p.id = q.content_id
  and p.slug = 'quantization-format-and-reasoning-length-in-mellum2-1'
  and q.status = 'sent';
