ALTER TABLE public.email_queue
ADD COLUMN IF NOT EXISTS recipient_emails text[];
