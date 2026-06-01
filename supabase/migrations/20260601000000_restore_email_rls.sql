-- Restore admin-only RLS on email tables
-- Reverts the downgraded policies from 20250723000003_update_rls_policies.sql

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view email queue" ON email_queue;
DROP POLICY IF EXISTS "Authenticated users can insert email queue" ON email_queue;
DROP POLICY IF EXISTS "Authenticated users can update email queue" ON email_queue;
DROP POLICY IF EXISTS "Authenticated users can delete email queue" ON email_queue;
DROP POLICY IF EXISTS "Authenticated users can view email analytics" ON email_analytics;
DROP POLICY IF EXISTS "Authenticated users can insert email analytics" ON email_analytics;
DROP POLICY IF EXISTS "Authenticated users can update email analytics" ON email_analytics;
DROP POLICY IF EXISTS "Authenticated users can delete email analytics" ON email_analytics;

-- Recreate admin-only policies for email_queue
CREATE POLICY "Admin users can view email queue" ON email_queue
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin users can insert email queue" ON email_queue
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin users can update email queue" ON email_queue
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin users can delete email queue" ON email_queue
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Recreate admin-only policies for email_analytics
CREATE POLICY "Admin users can view email analytics" ON email_analytics
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin users can insert email analytics" ON email_analytics
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin users can update email analytics" ON email_analytics
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin users can delete email analytics" ON email_analytics
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Keep service role policies for Edge Functions
CREATE POLICY "Service role can manage email queue" ON email_queue
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage email analytics" ON email_analytics
  FOR ALL USING (auth.role() = 'service_role');
