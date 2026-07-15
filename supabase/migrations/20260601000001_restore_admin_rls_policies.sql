-- Restore admin-only RLS on email_queue and email_analytics.
-- The 20250723000003 migration weakened these to any authenticated user;
-- this migration drops those policies and recreates admin-only enforcement.

-- email_queue
DROP POLICY IF EXISTS "Authenticated users can view email queue" ON email_queue;
DROP POLICY IF EXISTS "Authenticated users can insert email queue" ON email_queue;
DROP POLICY IF EXISTS "Authenticated users can update email queue" ON email_queue;
DROP POLICY IF EXISTS "Authenticated users can delete email queue" ON email_queue;

CREATE POLICY "Admin users can view email queue" ON email_queue
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admin users can insert email queue" ON email_queue
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admin users can update email queue" ON email_queue
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admin users can delete email queue" ON email_queue
  FOR DELETE USING (
    auth.role() = 'authenticated' AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

-- email_analytics
DROP POLICY IF EXISTS "Authenticated users can view email analytics" ON email_analytics;
DROP POLICY IF EXISTS "Authenticated users can insert email analytics" ON email_analytics;
DROP POLICY IF EXISTS "Authenticated users can update email analytics" ON email_analytics;
DROP POLICY IF EXISTS "Authenticated users can delete email analytics" ON email_analytics;

CREATE POLICY "Admin users can view email analytics" ON email_analytics
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admin users can insert email analytics" ON email_analytics
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admin users can update email analytics" ON email_analytics
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admin users can delete email analytics" ON email_analytics
  FOR DELETE USING (
    auth.role() = 'authenticated' AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );
-- Service role policies from 20250723000001 are preserved (no changes needed).
