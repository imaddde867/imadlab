-- Restore admin-only RLS on email tables
-- Reverts the downgraded policies from 20250723000003_update_rls_policies.sql
-- Creates tables if they don't exist (idempotent)

-- Create email_queue table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  post_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create email_analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  event text NOT NULL CHECK (event IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained')),
  post_id uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies (from the downgraded migration)
DROP POLICY IF EXISTS "Authenticated users can view email queue" ON public.email_queue;
DROP POLICY IF EXISTS "Authenticated users can insert email queue" ON public.email_queue;
DROP POLICY IF EXISTS "Authenticated users can update email queue" ON public.email_queue;
DROP POLICY IF EXISTS "Authenticated users can delete email queue" ON public.email_queue;
DROP POLICY IF EXISTS "Authenticated users can view email analytics" ON public.email_analytics;
DROP POLICY IF EXISTS "Authenticated users can insert email analytics" ON public.email_analytics;
DROP POLICY IF EXISTS "Authenticated users can update email analytics" ON public.email_analytics;
DROP POLICY IF EXISTS "Authenticated users can delete email analytics" ON public.email_analytics;

-- Recreate admin-only policies for email_queue
CREATE POLICY "Admin users can view email queue" ON public.email_queue
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin users can insert email queue" ON public.email_queue
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin users can update email queue" ON public.email_queue
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin users can delete email queue" ON public.email_queue
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Recreate admin-only policies for email_analytics
CREATE POLICY "Admin users can view email analytics" ON public.email_analytics
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin users can insert email analytics" ON public.email_analytics
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin users can update email analytics" ON public.email_analytics
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin users can delete email analytics" ON public.email_analytics
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Service role policies for Edge Functions
CREATE POLICY "Service role can manage email queue" ON public.email_queue
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage email analytics" ON public.email_analytics
  FOR ALL USING (auth.role() = 'service_role');
