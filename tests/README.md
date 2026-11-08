Run from the repository root. All fixtures are synthetic. No deployment, production writes, email delivery, or production record reads are needed.

Node checks (Node 22.18+ for native TypeScript loading):

```sh
node --test tests/*.test.mjs
npm run lint
npm run typecheck
npx tsc --noEmit -p tsconfig.app.json
node tests/build.mjs
```

`tests/build.mjs` validates the generated no-JavaScript HTML for long synthetic articles and projects: beginning/middle/end text, GFM tables/lists/code/headings, safe link handling, XSS removal, stable titles/canonicals and missing content. It also checks that generated HTML contains the actual rendered text inside the visible root, not merely serialized data. Synthetic inline and display equations on both routes must have KaTeX markup and CSS layout/MathML-hiding rules in the statically linked Vite entry stylesheet, without requiring JavaScript. The test runs the actual `npm run build` lifecycle against a loopback content server, explicitly disables Supabase deployment, checks prerender/runtime selection agreement and a 35-project archive, and restores generated public feeds. Keep port 55440 free. The direct app typecheck exposes existing errors that the root project-reference `typecheck` command does not check; compare with the unchanged baseline before attributing them to this candidate.

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


SEO #17 static rendering contract:

- Published project records are fetched with `published=true`; blog posts use the existing public posts query (there is no post draft flag). No content schema or editorial publication policy changes are introduced here.
- `scripts/prerender.js` turns the complete `post.body` and `project.full_description` into readable, semantic HTML during the postbuild step. Project descriptions are a fallback only when full_description is missing.
- The Node renderer uses ReactMarkdown, GFM, math and raw HTML sanitization shared with the browser Markdown component. Fenced code receives highlighting for supported languages. Mermaid diagrams remain readable fenced source until client-side JavaScript renders their SVG. KaTeX math is rendered server-side.
- The initial HTML lives in `#root`. The existing browser `createRoot` replaces it; no `hydrateRoot` is used or implied. No second hidden article is inserted.
- A missing output root, content-query error, or output write error now fails the prerender job. Sitemap/feed inventory and the existing 30-post fetch limit are handled separately by SEO issue #18; do not infer they have been fixed by this change.
- The PR-only `seo-prerender-check.yml` workflow runs synthetic build regression tests without deploying or contacting production Supabase. The deployment workflow still runs only on pushes to `master`/`main`, now on the same Node 22.18.0 version as the PR check.

Verification after `npm ci` (with no production credentials):

```sh
node --check scripts/prerender.js
node --check scripts/render-markdown.js
node --check src/lib/markdown-shared.js
node --test tests/*.test.mjs
node tests/build.mjs
```

Inspect `dist/blogs/synthetic-article/index.html`, `dist/projects/00000000-0000-0000-0000-000000000001/index.html`, and the fallback-only project `dist/projects/00000000-0000-0000-0000-000000000002/index.html` after the synthetic build. The build assertions verify semantic content and actual no-JS styles in the linked CSS. Browser/React parity includes signed video URLs (including query strings and fragments), valid fenced-code math normalization, and computed syntax-highlighting colors in no-JS Chromium. Browser/React parity is checked with:

```sh
npx playwright install chromium
node tests/prerender-browser.mjs
```

The browser test serves the synthetic `dist` locally, verifies content and mobile list/link styles without JavaScript, and checks that React replaces the static root while retaining article text with JavaScript. It makes no production Supabase requests. Deployment to production requires explicit owner approval.


SEO #18 public-content inventory and sitemap parity:

- `npm run build` now creates a **single** ignored `.cache/public-content.json` snapshot before generating the sitemap and RSS/JSON feeds; prerendering consumes exactly the same snapshot. It is built from public anonymous Supabase queries; published projects are explicitly filtered. Blog posts have no draft/published column.
- Queries use stable `published_date,id` and `featured,created_at,id` ordering with `range()` pagination (250 rows per request, below the PostgREST row cap). Invalid records, duplicate routes and any query/serialization/write error fail the build instead of leaving a quietly stale output. The old 30-post prerender limit is removed. Static-list/tag sitemap entries intentionally omit artificial build-day `lastmod`; dated items use validated record timestamps.
- The `postbuild` verifier checks sitemap URLs **1:1** against the generated HTML `index.html` files, unique page titles and canonical links, no-JavaScript visible HTML, and JSON/RSS feed URL parity. `resume/index.html` is an explicitly excluded non-indexed wrapper; `404.html` is not indexed.
- `node --test tests/public-content.test.mjs` covers >1,000 posts, exact page boundaries, Supabase query/response failures, duplicate/unsafe routes, invalid dates, explicit project publication checks and tag normalization. `node tests/build.mjs` runs a synthetic 35-post, 35-project build using `PUBLIC_CONTENT_PAGE_SIZE=16` only inside that synthetic child process to force multiple pages. The tests must not contact production Supabase.
- The GitHub Pages production deployment remains **push-only** on `master`/`main`. Opening the PR cannot trigger that deployment. The site's `_redirects` and `_headers` files are Cloudflare Pages syntax and are **not applied by GitHub Pages**. HTTP response codes, slash/legacy-domain redirects, Search Console submission, and whether the live host serves the intended status codes require a separately approved host-level audit; local static-file parity cannot prove these behaviors. No redirect/DNS/CDN changes are included here.
- Release verification: `npm ci && node --test tests/*.test.mjs && node tests/build.mjs && node tests/prerender-browser.mjs` (Playwright Chromium required). CI executes those synthetic checks on PRs. Do not merge or deploy without owner approval.
