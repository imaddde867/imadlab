Run from the repository root. All fixtures are synthetic. No deployment, production writes, email delivery, or production record reads are needed.

Node checks (Node 22.18+ for native TypeScript loading):

```sh
node --test tests/*.test.mjs
npm run lint
npm run typecheck
npx tsc --noEmit -p tsconfig.app.json
node tests/build.mjs
```

`tests/build.mjs` runs the actual `npm run build` lifecycle against a loopback content server, explicitly disables Supabase deployment, checks prerender/runtime selection agreement and a 35-project archive, and restores generated public feeds. Keep port 55440 free. The direct app typecheck exposes existing errors that the root project-reference `typecheck` command does not check; compare with the unchanged baseline before attributing them to this candidate.

Browser journey: start `npm run dev -- --host 127.0.0.1` (port 8080), then `node tests/ui.mjs` and `node tests/consent.mjs` with Playwright available and Google Chrome installed. If Playwright is outside this project, set `PLAYWRIGHT_MODULE` to its absolute `index.mjs` path. The test intercepts Supabase requests; credentials and records are synthetic. It covers create/edit, featured retention, unchanged timestamps, cached homepage refresh, mobile/desktop width, denied saves, and every admin route with forged user metadata. The consent test intercepts every request and serves the production hostname from localhost; it checks opt-out, consented ingestion, and revocation without contacting production.

Database checks: use **empty disposable local databases**, never a linked production database. This schema fixture includes only structure and representative policies, not historical content migrations. Requires PostgreSQL 15+ and uuid-ossp. `upgrade=true` exercises replacement of representative existing policies; `upgrade=false` exercises setup without legacy policies. Run each mode in a separate empty database, using a local connection string supplied by the owner:

```sh
psql "$LOCAL_TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -v upgrade=true \
  -f tests/access-schema.sql \
  -f supabase/migrations/20261020150153_isolated_access_model.sql \
  -f tests/access.test.sql -f tests/access-matrix.sql
```

Repeat with `upgrade=false` in the second database. `access-schema.sql` creates synthetic roles if absent. Tests use actual PostgreSQL RLS and function grants with synthetic JWT claims, and roll back their rows. They do not emulate Supabase JWT signature verification or a hosted API gateway. Existing edge authorization tests exercise verified-user lookups separately:

```sh
deno test --allow-env --allow-net supabase/functions/shared/admin-auth.test.ts
deno test --no-lock --allow-env --allow-net --import-map tests/geolocation-import-map.json tests/geolocation.test.ts
```

Detailed schema inventory and test receipts belong in owner-controlled private storage. Do not commit them or paste them into issues.
