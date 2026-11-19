# Security Rollout — Migration Audit Findings

**Date:** 2026-11-19
**Migration:** `supabase/migrations/20261020150153_isolated_access_model.sql`
**Status:** Audit complete. Migration is sound; no structural corrections required.

---

## 1. Scope

This document records the audit of the candidate migration against:
- The legacy schema fixture (`tests/access-schema.sql`)
- The access contract (`docs/homepage-and-access.md`)
- Client-side code (`src/hooks/useAnalytics.ts`, `src/lib/consent.ts`)
- Edge functions (`supabase/functions/shared/admin-auth.ts`, `supabase/functions/geolocation/index.ts`)
- Generated TypeScript types (`src/integrations/supabase/types.ts`)

## 2. Migration Summary

The migration performs eight groups of changes in a single transaction:

1. **`is_admin()` function** — replaces hardcoded UID checks with a centralized helper.
2. **Policy replacement** — drops all existing RLS policies and recreates them using `is_admin()`.
3. **Grant tightening** — revokes `ALL` from `public/anon/authenticated`, grants minimal permissions per role.
4. **Public read policies** — posts are fully public; projects require `published = true`.
5. **Newsletter column-level grant** — `INSERT(email)` only; status and timestamps are server-generated.
6. **`analytics_summary` view** — switched to `security_invoker`, revoked from `anon`.
7. **Telemetry functions** — `track_session` is append-only (`ON CONFLICT DO NOTHING`); `track_page_view` adds input validation.
8. **Duration function revocation** — `set_page_view_duration` revoked from `public/anon/authenticated`.

## 3. Findings

### 3.1 UID Consistency — ✅ Verified

| Location | UID |
|----------|-----|
| Migration `is_admin()` | `cd614e51-7734-4685-b021-d27a24b1655e` |
| Edge function `admin-auth.ts` | `cd614e51-7734-4685-b021-d27a24b1655e` |
| Legacy policies (placeholder) | `00000000-0000-0000-0000-000000000010` |
| Test admin JWT (`access-matrix.sql`) | `00000000-0000-0000-0000-000000000010` with `app_metadata.role = 'admin'` |

**Verdict:** The migration UID and edge function UID match. The test uses `app_metadata.role = 'admin'` which bypasses the UID check, so the placeholder UID in tests is harmless. **Action required:** Verify `cd614e51-7734-4685-b021-d27a24b1655e` against the actual production owner account before applying.

### 3.2 `is_admin()` Function — ✅ Sound

- `SECURITY INVOKER` — cannot be exploited to escalate privileges.
- Checks `auth.uid()` (owner UID) OR `auth.jwt()->'app_metadata'->>'role' = 'admin'`.
- `app_metadata` is set only by the Auth Admin API (server-side). Users cannot forge it via `user_metadata`.
- `set search_path = ''` — prevents schema injection.
- Grant: `anon, authenticated, service_role` — correct, since RLS policies call this function.

**Risk:** If the owner UID is incorrect, no admin can perform CRUD. Mitigation: pre-flight UID verification.

### 3.3 Policy Replacement — ✅ Sound

The migration drops all existing policies per table and recreates them:

| Table | Admin Read | Admin CRUD | Public Read | Anon/Ordinary Write |
|-------|-----------|------------|-------------|-------------------|
| posts | ✅ | ✅ | ✅ (all) | ❌ |
| projects | ✅ | ✅ | ✅ (published only) | ❌ |
| newsletter_subscribers | ✅ | ✅ (full) | ❌ | ✅ (email-only insert) |
| email_queue | ✅ | ✅ | ❌ | ❌ |
| email_analytics | ✅ | ✅ | ❌ | ❌ |
| visitor_sessions | ✅ (read) | ❌ | ❌ | ❌ (RPC only) |
| page_views | ✅ (read) | ❌ | ❌ | ❌ (RPC only) |
| cursor_preferences | ✅ (read) | ❌ | ❌ | ❌ |

**Key observation:** The migration grants `SELECT, UPDATE, DELETE` to `authenticated` on `posts`, `projects`, `email_queue`, `email_analytics`, `newsletter_subscribers`, but the corresponding RLS policies (`admin_read`, `admin_update`, `admin_delete`) all require `is_admin()`. This means an ordinary authenticated user has the grant but is blocked by the policy — correct defense-in-depth.

**Newsletter insert:** The migration grants `INSERT` to `authenticated` with `admin_insert` policy requiring `is_admin()`, then separately creates `public_signup` policy for `anon, authenticated` with email-only constraints. The column-level grant (`INSERT(email)`) enforces the field restriction at the grant layer, independent of the policy.

### 3.4 Telemetry Functions — ✅ Sound

**`track_session`:**
- Legacy: `ON CONFLICT DO UPDATE` — allowed anonymous callers to modify existing sessions.
- Migration: `ON CONFLICT DO NOTHING` — append-only. Existing sessions are preserved.
- Input bounds: `LEFT()` on all fields, session ID length check.
- Grant: revoked from `public`, granted to `anon, authenticated, service_role`.

**`track_page_view`:**
- Legacy: `LANGUAGE sql`, no validation.
- Migration: `LANGUAGE plpgsql`, validates `p_session_id` (non-null, 1-128 chars) and `p_path` (non-null, 1-512 chars, must start with `/`).
- Raises `INVALID_PARAMETER_VALUE` (SQLSTATE `22023`) for invalid input.
- Grant: revoked from `public`, granted to `anon, authenticated, service_role`.

**`set_page_view_duration`:**
- Revoked from `public, anon, authenticated`. Only `service_role` can call it.
- Function still exists as `SECURITY DEFINER` — acceptable since service-role is server-only.

### 3.5 Client-Side Compatibility — ✅ Compatible

**`src/hooks/useAnalytics.ts`:**
- Calls `track_session` with all required parameters — signature matches.
- Calls `track_page_view` with all required parameters — signature matches.
- `p_path` is `location.pathname` which always starts with `/` — passes validation.
- `p_session_id` is a UUID or fallback string — non-null, valid length.
- **Does NOT call `set_page_view_duration`** — no client-side breakage from revocation.
- Consent-gated: only runs on production host (`imadlab.com` / `www.imadlab.com`) with user consent.

**`src/lib/consent.ts`:**
- No database interactions. Pure client-side cookie/localStorage management.
- Unaffected by migration.

### 3.6 Edge Functions — ✅ Compatible

**`supabase/functions/shared/admin-auth.ts`:**
- Uses the same UID (`cd614e51-...`) and `app_metadata.role = 'admin'` check as `is_admin()`.
- No changes needed.

**`supabase/functions/geolocation/index.ts`:**
- Already admin-gated via `requireAdminOrJobSecret()`.
- Uses service-role key for DB writes — unaffected by RLS policy changes.
- Updates `visitor_sessions` and `page_views` via service-role — still permitted.

### 3.7 TypeScript Types — ⚠️ Needs Regeneration

**`src/integrations/supabase/types.ts`:**
- `newsletter_subscribers` Insert type currently includes all columns (`created_at`, `email`, `id`, `status`, `unsubscribe_token`, `updated_at`).
- After migration, the column-level grant restricts inserts to `email` only at the database level.
- `set_page_view_duration` function is still listed in the types — it remains in the schema, just revoked from `anon/authenticated`.
- **Important:** Generated TypeScript types describe the database schema structure, not column-level permissions or RLS guarantees. They reflect table/column definitions but do not encode grant restrictions or policy logic. Regenerating types will NOT change the `newsletter_subscribers` Insert type because the column-level grant is a runtime permission, not a schema change.
- **Action:** Document this limitation. The types file does not need regeneration for correctness — the database enforces the restrictions regardless of TypeScript types.

### 3.8 `analytics_summary` View — ✅ Sound

- Switched to `security_invoker = true`.
- Revoked from `public, anon`.
- Granted to `authenticated, service_role`.
- No client-side code queries this view from the browser. Admin pages use authenticated context.

## 4. Access Matrix Verification (Static Analysis)

| Action | Anonymous | Ordinary user | Forged user_metadata admin | Legitimate admin | Service-role |
|--------|-----------|---------------|--------------------------|------------------|-------------|
| Read posts | ✅ | ✅ | ✅ | ✅ | ✅ |
| Read published projects | ✅ | ✅ | ✅ | ✅ | ✅ |
| Read draft projects | ❌ | ❌ | ❌ | ✅ | ✅ |
| CRUD posts/projects | ❌ | ❌ | ❌ | ✅ | ✅ |
| Subscribe (email only) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Override subscriber fields | ❌ | ❌ | ❌ | ✅ | ✅ |
| Read analytics | ❌ | ❌ | ❌ | ✅ | ✅ |
| Write telemetry (append) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update telemetry | ❌ | ❌ | ❌ | ❌ | ✅ |
| Direct table telemetry insert | ❌ | ❌ | ❌ | ❌ | ✅ |

**Verification method:** Static analysis of migration SQL, grants, and RLS policies. These results must be confirmed by running the synthetic tests in Step 2.

## 5. Risks

### 5.1 High Priority

**Owner UID mismatch:** If `cd614e51-7734-4685-b021-d27a24b1655e` does not match the production owner account, no admin can perform CRUD operations. The `app_metadata.role = 'admin'` path still works for accounts provisioned with that role.
- **Mitigation:** Verify the UID against the production owner account before applying.

### 5.2 Medium Priority

**`track_page_view` path validation:** Rejects paths not starting with `/`. The client always provides `location.pathname` which starts with `/`. Edge-case: hash-only routes or empty paths could fail, but the client does not produce these.
- **Mitigation:** Confirmed safe via client code review.

**Newsletter email regex:** `^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$` — basic validation. May reject valid emails with unusual TLDs or internationalized domains.
- **Acceptable:** Matches current behavior; not a regression.

**`set_page_view_duration` still exists:** The function remains in the schema as `SECURITY DEFINER`, callable by `service_role`. If the service-role key is compromised, duration updates are possible.
- **Acceptable:** Service-role is a server-only credential. This is an operational concern, not a migration issue.

### 5.3 Residual Security Risks (by design)

- **Public telemetry endpoints remain callable by design.** The `track_session` and `track_page_view` RPCs are granted to `anon` and `authenticated`. Input validation does not prevent automated spam or independently prove that a visitor consented to analytics. Rate limiting and stronger ingestion identity would require a separate service.
- **Service-role key exposure** would grant full database access. This is a Supabase operational concern, not a migration issue. The service-role key is used by edge functions and must be protected via environment variable management.
- **Newsletter signup reveals duplicate email status.** The `UNIQUE(email)` constraint will reject duplicate subscriptions, but the error message may reveal whether an email is already subscribed. This matches current behavior.

## 6. Test Coverage

The following tests validate the migration:

| Test File | Scope | Environment |
|-----------|-------|-------------|
| `tests/access.test.sql` | Telemetry validation, session immutability, duration revocation, admin CRUD | PostgreSQL |
| `tests/access-matrix.sql` | Full access matrix: anonymous, ordinary, forged metadata, admin, service-role | PostgreSQL |
| `tests/*.test.mjs` (6 files) | Client-side hooks, consent state, events, home projects, admin auth | Node.js |
| `tests/build.mjs` | Build lifecycle, prerender, archive | Node.js |
| `tests/consent.mjs` | Browser consent flow, opt-out, revocation | Playwright |
| `supabase/functions/shared/admin-auth.test.ts` | Edge function auth verification | Deno |
| `tests/geolocation.test.ts` | Geolocation edge function | Deno |

**Note:** PostgreSQL tests validate grants, functions, and RLS policies but cannot fully verify Supabase Auth, JWT handling, and PostgREST behavior. Step 2 includes isolated Supabase instance testing to cover the full stack.

## 7. Conclusion

The migration is **sound** and ready for validation testing (Step 2). No structural corrections are required. The key pre-flight action is verifying the owner UID against the production account.

### Verified Results (static analysis)
- UID consistency between migration and edge function ✅
- Client hook parameter compatibility ✅
- Consent flow unaffected ✅
- Edge function compatibility ✅
- Access matrix matches contract ✅
- Telemetry append-only behavior ✅
- Newsletter column-level grant ✅
- Duration function revocation ✅

### Untested Assumptions (require Step 2 validation)
- RLS policy enforcement under actual role switching
- JWT claim parsing in `is_admin()` with real Supabase Auth
- PostgREST query behavior with column-level grants
- `analytics_summary` view with `security_invoker` via PostgREST
- Migration execution on both `upgrade=true` and `upgrade=false` schemas
