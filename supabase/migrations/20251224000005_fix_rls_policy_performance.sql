-- Normalize auth function calls in RLS policies to avoid per-row re-evaluation.
DO $$
DECLARE
  r record;
  new_qual text;
  new_check text;
  clauses text;
BEGIN
  FOR r IN
    SELECT schemaname,
           tablename,
           policyname,
           qual,
           with_check
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename IN (
         'posts',
         'projects',
         'email_queue',
         'email_analytics'
       )
  LOOP
    new_qual := r.qual;
    new_check := r.with_check;

    IF new_qual IS NOT NULL THEN
      new_qual := replace(new_qual, 'auth.uid()', '(select auth.uid())');
      new_qual := replace(new_qual, 'auth.role()', '(select auth.role())');
    END IF;

    IF new_check IS NOT NULL THEN
      new_check := replace(new_check, 'auth.uid()', '(select auth.uid())');
      new_check := replace(new_check, 'auth.role()', '(select auth.role())');
    END IF;

    IF new_qual IS DISTINCT FROM r.qual OR new_check IS DISTINCT FROM r.with_check THEN
      clauses := trim(both ' ' from concat_ws(' ',
        CASE WHEN new_qual IS NOT NULL THEN format('USING (%s)', new_qual) END,
        CASE WHEN new_check IS NOT NULL THEN format('WITH CHECK (%s)', new_check) END
      ));

      EXECUTE format(
        'ALTER POLICY %I ON %I.%I %s',
        r.policyname,
        r.schemaname,
        r.tablename,
        clauses
      );
    END IF;
  END LOOP;
END $$;
-- Scope policies to intended roles to reduce multiple permissive policy warnings.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'email_queue'
       AND policyname = 'Authenticated users can view email queue'
  ) THEN
    EXECUTE format(
      'ALTER POLICY %I ON public.email_queue TO authenticated',
      'Authenticated users can view email queue'
    );
  END IF;

  IF EXISTS (
    SELECT 1
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'email_queue'
       AND policyname = 'Authenticated users can insert email queue'
  ) THEN
    EXECUTE format(
      'ALTER POLICY %I ON public.email_queue TO authenticated',
      'Authenticated users can insert email queue'
    );
  END IF;

  IF EXISTS (
    SELECT 1
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'email_queue'
       AND policyname = 'Authenticated users can update email queue'
  ) THEN
    EXECUTE format(
      'ALTER POLICY %I ON public.email_queue TO authenticated',
      'Authenticated users can update email queue'
    );
  END IF;

  IF EXISTS (
    SELECT 1
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'email_queue'
       AND policyname = 'Authenticated users can delete email queue'
  ) THEN
    EXECUTE format(
      'ALTER POLICY %I ON public.email_queue TO authenticated',
      'Authenticated users can delete email queue'
    );
  END IF;

  IF EXISTS (
    SELECT 1
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'email_queue'
       AND policyname = 'Service role can manage email queue'
  ) THEN
    EXECUTE format(
      'ALTER POLICY %I ON public.email_queue TO service_role',
      'Service role can manage email queue'
    );
  END IF;

  IF EXISTS (
    SELECT 1
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'email_analytics'
       AND policyname = 'Authenticated users can view email analytics'
  ) THEN
    EXECUTE format(
      'ALTER POLICY %I ON public.email_analytics TO authenticated',
      'Authenticated users can view email analytics'
    );
  END IF;

  IF EXISTS (
    SELECT 1
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'email_analytics'
       AND policyname = 'Authenticated users can insert email analytics'
  ) THEN
    EXECUTE format(
      'ALTER POLICY %I ON public.email_analytics TO authenticated',
      'Authenticated users can insert email analytics'
    );
  END IF;

  IF EXISTS (
    SELECT 1
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'email_analytics'
       AND policyname = 'Authenticated users can update email analytics'
  ) THEN
    EXECUTE format(
      'ALTER POLICY %I ON public.email_analytics TO authenticated',
      'Authenticated users can update email analytics'
    );
  END IF;

  IF EXISTS (
    SELECT 1
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'email_analytics'
       AND policyname = 'Authenticated users can delete email analytics'
  ) THEN
    EXECUTE format(
      'ALTER POLICY %I ON public.email_analytics TO authenticated',
      'Authenticated users can delete email analytics'
    );
  END IF;

  IF EXISTS (
    SELECT 1
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'email_analytics'
       AND policyname = 'Service role can manage email analytics'
  ) THEN
    EXECUTE format(
      'ALTER POLICY %I ON public.email_analytics TO service_role',
      'Service role can manage email analytics'
    );
  END IF;

  IF EXISTS (
    SELECT 1
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'newsletter_subscribers'
       AND policyname = 'Allow insert for all'
  ) THEN
    EXECUTE format(
      'ALTER POLICY %I ON public.newsletter_subscribers TO authenticated',
      'Allow insert for all'
    );
  END IF;

  IF EXISTS (
    SELECT 1
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'newsletter_subscribers'
       AND policyname = 'Allow public insert for newsletter signup'
  ) THEN
    EXECUTE format(
      'ALTER POLICY %I ON public.newsletter_subscribers TO anon',
      'Allow public insert for newsletter signup'
    );
  END IF;
END $$;
