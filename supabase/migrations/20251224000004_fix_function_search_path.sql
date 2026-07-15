-- Lock function search_path to prevent role-based mutation.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT n.nspname,
           p.proname,
           pg_get_function_identity_arguments(p.oid) AS args
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname IN (
         'update_updated_at_column',
         'queue_newsletter_email',
         'cleanup_old_email_analytics'
       )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SET search_path = public, extensions;',
      r.nspname,
      r.proname,
      r.args
    );
  END LOOP;
END $$;
