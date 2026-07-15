-- Fix critical open-write RLS policies on posts, projects, and newsletter_subscribers.
-- "Anyone can manage X" policies allow unauthenticated INSERT/UPDATE/DELETE via anon key.
-- These are dropped and replaced with admin-only enforcement matching the UID-based policies
-- already present, unified to use JWT role metadata for consistency.

-- ============================================================
-- posts
-- ============================================================
DROP POLICY IF EXISTS "Anyone can manage posts" ON posts;

-- INSERT: admin by UID (keep existing posts_insert_admin if present, add role-based fallback)
DROP POLICY IF EXISTS "posts_insert_admin" ON posts;
CREATE POLICY "posts_insert_admin" ON posts
  FOR INSERT
  WITH CHECK (
    auth.uid() = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid
    OR (auth.role() = 'authenticated' AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    ))
  );

-- UPDATE: already UID-scoped via posts_update_admin; no change needed — permissive
-- "Anyone can manage posts" was the gap, now dropped.

-- ============================================================
-- projects
-- ============================================================
DROP POLICY IF EXISTS "Anyone can manage projects" ON projects;

DROP POLICY IF EXISTS "projects_insert_admin" ON projects;
CREATE POLICY "projects_insert_admin" ON projects
  FOR INSERT
  WITH CHECK (
    auth.uid() = 'cd614e51-7734-4685-b021-d27a24b1655e'::uuid
    OR (auth.role() = 'authenticated' AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    ))
  );

-- ============================================================
-- newsletter_subscribers
-- Drop any-authenticated policies; replace with admin-only + service_role.
-- Public insert (signup form) and service_role full access are preserved.
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to delete subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated users to read all subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated users to update subscriber status" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow insert for all" ON newsletter_subscribers;

CREATE POLICY "Admin users can read subscribers" ON newsletter_subscribers
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admin users can update subscribers" ON newsletter_subscribers
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admin users can delete subscribers" ON newsletter_subscribers
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );
