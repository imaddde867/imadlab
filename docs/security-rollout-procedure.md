# Security Rollout — Production Procedure

**Date:** 2026-11-19
**Migration:** `supabase/migrations/20261020150153_isolated_access_model.sql`
**Status:** Ready for review. Do not apply until pre-flight checklist is complete.

---

## 1. Pre-Flight Checklist

Complete every item before applying the migration to production.

- [ ] **Verify owner UID.** Confirm `cd614e51-7734-4685-b021-d27a24b1655e` matches the production Supabase owner account. Run in the Supabase SQL editor:
  ```sql
  select id, email from auth.users where id = 'cd614e51-7734-4685-b021-d27a24b1655e';
  ```
  If the UID is incorrect, update the migration before applying.

- [ ] **Backup strategy.** Ensure a recent production database backup exists. Supabase provides automated daily backups; verify the most recent backup timestamp in the dashboard.

- [ ] **Staging validation.** The migration has been validated in isolated PostgreSQL 15 containers with both `upgrade=true` and `upgrade=false` modes. All assertions passed. (See test results below.)

- [ ] **No pending migrations.** Verify no other unapplied migrations exist that could conflict.

- [ ] **Branch and PR.** This migration is on a review branch with a PR open. Do not merge `main`/`master` until the PR is approved and the migration is applied.

- [ ] **Geolocation function.** Confirm the geolocation edge function remains admin-gated. It is already protected by `requireAdminOrJobSecret()`.

- [ ] **Service-role key.** Verify the service-role key is stored securely and not exposed in client-side code or logs.

## 2. Step-by-Step Migration Application

### 2.1 Apply the Migration

The migration is wrapped in a `BEGIN`/`COMMIT` transaction. Apply it through the Supabase dashboard SQL editor or the Supabase CLI:

**Option A: Supabase Dashboard (recommended)**
1. Open the Supabase dashboard SQL editor.
2. Copy the contents of `supabase/migrations/20261020150153_isolated_access_model.sql`.
3. Execute the entire file as a single transaction.
4. Verify no errors are reported.

**Option B: Supabase CLI**
```sh
npx supabase db push
```

### 2.2 Expected Behavior

The migration performs these operations atomically:
1. Creates `is_admin()` function.
2. Drops all existing RLS policies on 8 tables.
3. Recreates policies using `is_admin()`.
4. Revokes and re-grants table permissions.
5. Creates public read policies for posts and published projects.
6. Creates newsletter signup policy with column-level grant.
7. Switches `analytics_summary` to `security_invoker`.
8. Replaces telemetry functions with append-only, input-validated versions.
9. Revokes `set_page_view_duration` from public roles.

If any step fails, the entire transaction rolls back automatically.

## 3. Rollback Procedure

### 3.1 Failed Migration (Automatic Rollback)

If the migration fails during execution, PostgreSQL rolls back the entire transaction automatically. No manual intervention is needed. Verify the pre-migration state:

```sql
-- Check that old policies still exist
select policyname from pg_policies where schemaname = 'public';
-- Check that is_admin() does not exist
select proname from pg_proc where proname = 'is_admin';
```

### 3.2 Successfully Committed Migration (Forward Recovery Only)

**A transactional `ROLLBACK` cannot undo a successfully committed migration.** The following forward-recovery options are available:

**Option A: Reverse Migration (recommended)**
Apply a reverse migration that restores the previous state:

```sql
begin;

-- Drop the is_admin function
drop function if exists public.is_admin();

-- Drop all current policies
do $$
declare t text; p record;
begin
 foreach t in array array['posts','projects','newsletter_subscribers','email_queue','email_analytics','visitor_sessions','page_views','cursor_preferences'] loop
  for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
   execute format('drop policy %I on public.%I', p.policyname, t);
  end loop;
 end loop;
end $$;

-- Restore legacy grants
grant all on all tables in schema public to anon, authenticated, service_role;

-- Restore legacy policies (replay from tests/access-schema.sql with upgrade=true)
-- [Insert legacy policy definitions here]

-- Restore legacy telemetry functions
create or replace function public.track_session(...) ... on conflict do update ...;
create or replace function public.track_page_view(...) language sql ...;
grant execute on function public.set_page_view_duration(uuid,integer) to public, anon, authenticated;

-- Restore analytics_summary
alter view public.analytics_summary set (security_invoker = false);
grant select on public.analytics_summary to anon, authenticated, service_role;

commit;
```

**Option B: Restore from Backup**
Restore the most recent pre-migration backup from the Supabase dashboard. This resets all database state to the backup timestamp.

### 3.3 Emergency RPC Revocation

If telemetry ingestion misbehaves after the migration, revoke the public RPC execute permissions immediately:

```sql
-- Emergency: stop all public telemetry ingestion
revoke execute on function public.track_session(text,text,text,text,text,text,text,text) from anon, authenticated;
revoke execute on function public.track_page_view(text,text,text,text,text,text,text,text,text,text,text,text) from anon, authenticated;
```

This accepts a telemetry gap but prevents further unauthorized writes. To restore:

```sql
grant execute on function public.track_session(text,text,text,text,text,text,text,text) to anon, authenticated, service_role;
grant execute on function public.track_page_view(text,text,text,text,text,text,text,text,text,text,text,text) to anon, authenticated, service_role;
```

## 4. Post-Migration Verification

Run these checks immediately after applying the migration:

### 4.1 Function Verification

```sql
-- is_admin() exists and is SECURITY INVOKER
select proname, prosecdef from pg_proc where proname = 'is_admin';
-- Expected: prosecdef = false (security_invoker)

-- track_session is append-only
select proname, prosrc from pg_proc where proname = 'track_session';
-- Expected: prosrc contains 'do nothing'

-- track_page_view validates input
select proname, lanname from pg_proc where proname = 'track_page_view';
-- Expected: lanname = 'plpgsql'

-- set_page_view_duration is revoked
select has_function_privilege('anon', 'public.set_page_view_duration(uuid,integer)', 'execute');
-- Expected: false
```

### 4.2 Policy Verification

```sql
-- Count policies per table
select tablename, count(*) from pg_policies where schemaname = 'public' group by tablename;
-- Expected: posts=3, projects=3, newsletter_subscribers=3, email_queue=3, email_analytics=3, visitor_sessions=1, page_views=1, cursor_preferences=1
```

### 4.3 Client-Side Verification

1. Visit the production site as an anonymous user.
2. Confirm posts and published projects load correctly.
3. Confirm the newsletter signup form accepts email-only submissions.
4. Confirm the consent banner appears and functions correctly.
5. Check the browser console for no RPC errors.

### 4.4 Admin Verification

1. Log in as the admin account.
2. Confirm access to draft projects, all posts, analytics, and subscriber management.
3. Create, edit, and delete a test project.
4. Verify the analytics summary view loads.

## 5. Test Results

### 5.1 PostgreSQL Tests (Verified)

| Test | Mode | Result |
|------|------|--------|
| `access.test.sql` | upgrade=true | ✅ All assertions passed |
| `access-matrix.sql` | upgrade=true | ✅ All assertions passed |
| `access.test.sql` | upgrade=false | ✅ All assertions passed |
| `access-matrix.sql` | upgrade=false | ✅ All assertions passed |

**Environment:** PostgreSQL 15.20 (Alpine), Docker containers, synthetic data only.

**What was verified:**
- Anonymous telemetry validation (empty session/path rejected)
- Session immutability (append-only, no updates)
- Duration function revocation (anon cannot execute)
- Admin CRUD operations (insert, update, delete)
- Full access matrix: anonymous, ordinary user, forged user_metadata, admin, service-role
- Newsletter column-level grant enforcement
- analytics_summary view access control

### 5.2 Client-Side Tests (Verified)

| Test | Result |
|------|--------|
| `node --test tests/*.test.mjs` (5 files) | ✅ 5/5 passed |
| `node tests/build.mjs` | ✅ Passed |
| `npm run typecheck` | ✅ Passed |
| `node tests/consent.mjs` | ⚠️ Skipped — requires running dev server (pre-existing requirement) |

### 5.3 Untested Assumptions

The following could not be verified in this environment and require manual confirmation after production deployment:

- **Supabase Auth JWT handling:** PostgreSQL tests simulate JWT claims via `set_config('request.jwt.claims', ...)`. Actual Supabase Auth JWT parsing and role assignment must be verified through the Supabase client.
- **PostgREST query behavior:** Column-level grants (`INSERT(email)`) are enforced by PostgreSQL, but PostgREST error messages and behavior under the Supabase client should be verified.
- **`analytics_summary` via PostgREST:** The `security_invoker` view behavior through PostgREST (Supabase's REST API layer) should be verified with an authenticated query.
- **Supabase TypeScript types:** The `types.ts` file was not regenerated because the Supabase CLI is not available in this environment. The types reflect the pre-migration schema. Regenerate with `npx supabase gen types typescript --local` after the migration. Note: generated types describe schema structure, not RLS/grant restrictions.

## 6. Residual Security Risks

### 6.1 By Design

- **Public telemetry endpoints remain callable.** `track_session` and `track_page_view` are granted to `anon` and `authenticated`. This is intentional: visitors need to submit telemetry after consent. Input validation bounds the inputs but does not prevent automated spam.
- **Input validation does not prove consent.** The RPC functions accept telemetry from any caller. Browser-side consent gating (`src/lib/consent.ts`) prevents the client from calling these functions without consent, but a determined attacker can call the RPC directly. Rate limiting and stronger ingestion identity would require a separate service.
- **Newsletter signup reveals duplicate email status.** The `UNIQUE(email)` constraint rejects duplicates, but the error message may reveal whether an email is already subscribed. This matches current behavior.

### 6.2 Operational

- **Service-role key exposure.** The service-role key grants full database access. It is used by edge functions (geolocation, newsletter) and must be protected via environment variable management. This is a Supabase operational concern.
- **`set_page_view_duration` still exists.** The function remains in the schema as `SECURITY DEFINER`, callable by `service_role`. If the service-role key is compromised, duration updates are possible. This is acceptable since service-role is a server-only credential.

## 7. Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/20261020150153_isolated_access_model.sql` | Already exists — candidate migration |
| `docs/security-rollout-review.md` | New — audit findings document |
| `docs/security-rollout-procedure.md` | New — this document |

No client code, edge functions, or workflow files were modified.

## 8. Delivery Summary

- **Migration:** Sound, no structural corrections required.
- **PostgreSQL tests:** All passed (upgrade=true and upgrade=false).
- **Client tests:** All passed (modular tests, build, typecheck).
- **Supabase instance tests:** Not run (Supabase CLI not available). Documented as untested assumptions.
- **Client code:** No changes needed.
- **Edge functions:** No changes needed.
- **Types:** `types.ts` does not need regeneration for correctness — the database enforces restrictions regardless of TypeScript types.
