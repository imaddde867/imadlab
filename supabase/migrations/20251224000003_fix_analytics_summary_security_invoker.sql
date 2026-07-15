-- Ensure analytics_summary honors RLS policies of the querying user.
ALTER VIEW IF EXISTS public.analytics_summary
  SET (security_invoker = true);
