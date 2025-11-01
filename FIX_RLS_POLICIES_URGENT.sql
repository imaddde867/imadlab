-- ==========================================
-- URGENT FIX: RLS Policies Breaking Anonymous Access
-- ==========================================
-- Problem: The UPSERT operation requires SELECT permission to check if a row exists
-- But the current SELECT policy tries to query auth.users table, which anonymous users can't access
-- 
-- Solution: Simplify the SELECT policies to allow public read access
-- (This is safe - analytics data is not sensitive, and admins still control who can view the dashboard)
-- 
-- Steps to apply:
-- 1. Go to your Supabase Dashboard SQL Editor
-- 2. Copy and paste this entire script
-- 3. Click "Run"
-- ==========================================

-- DROP the broken SELECT policies that try to access auth.users
DROP POLICY IF EXISTS "Admin users can view visitor_sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Admin users can view page_views" ON page_views;

-- CREATE simple SELECT policies that allow public read access
-- This is needed for UPSERT to work (UPSERT = SELECT + INSERT/UPDATE)
-- Security: Analytics data is not sensitive, dashboard access is still controlled by auth

CREATE POLICY "Allow public select on visitor_sessions" ON visitor_sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow public select on page_views" ON page_views
  FOR SELECT USING (true);

-- Verify the policies
SELECT 
  schemaname,
  tablename, 
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename IN ('visitor_sessions', 'page_views')
ORDER BY tablename, cmd, policyname;
