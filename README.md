# imadlab

Source code for [imadlab.com](https://imadlab.com), the personal site of Imad Eddine El Mouss, Research Engineer at the Cognitive Technologies Research Group (CoRe), Turku University of Applied Sciences. The site lists my research and projects and hosts my technical writing.

## How it works

- **Front end:** React 18, TypeScript and Vite, styled with Tailwind. Every public page uses one layout component (`src/components/layout/Page.tsx`).
- **Content:** projects and posts live in Supabase Postgres. Row-level security exposes only published projects to visitors, and an admin area at `/admin` edits content.
- **Markdown:** project and post bodies are Markdown with GFM tables, KaTeX math and Mermaid diagrams, rendered by `src/components/markdown/`.
- **Prerendering:** at build time `scripts/prerender.js` fetches the content and writes a static HTML page for each route, with its title and link-preview tags. The sitemap and RSS feed are generated in the same step.
- **Deployment:** pushes to `master` or `main` build and publish the site to GitHub Pages. Editors can also request a rebuild from the site's admin pages. See [Publishing content](#publishing-content).
- **Edge functions:** Supabase Edge Functions in `supabase/functions/` send newsletter email, handle unsubscribes, add geolocation to consent-gated analytics, and proxy the Strava API.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

`npm run lint` and `npm run typecheck` check the code. `npm run build` builds and prerenders the site; it deploys edge functions only when `SUPABASE_DEPLOY=1` is set.

## Repository layout

```
src/pages/                 routes: home, projects, writing, tags, search, admin
src/components/layout/     shared page layout
src/components/markdown/   Markdown renderer and its block components
src/lib/                   data selects, tags, SEO and analytics helpers
supabase/migrations/       schema, row-level security and content migrations
supabase/functions/        edge functions
scripts/                   prerender, sitemap and feed generation
```

## License

MIT, see [LICENSE](LICENSE).

## Publishing content

1. Save your changes in the editor. Every saved post is public in Supabase. New projects start private and the **Public project** switch controls public visibility. Finish all edits before rebuilding.
2. Use **Open website rebuild in GitHub** from either editor, select **Run workflow** on `master`, and open the resulting run. Dispatch requires repository write access. One rebuild reads the latest public inventory for the whole site. If you save again after a build starts, dispatch again after the last save. GitHub runs one publication at a time and replaces a waiting run when another is queued, so follow the surviving run.
3. Wait for **Verify this build is public**. This step checks the run-specific marker on the custom domain. Open the affected detail URL and check the canonical and sitemap. For a post, check both feeds. For an unpublished project or deleted post, check that the old URL returns the site's noindex 404 and has disappeared from the relevant discovery files.

A save updates Supabase first. The previously deployed HTML, feeds, and metadata can remain public until the next confirmed deploy, including a previously published project's static page after unpublishing. The detail views use the inventory fetch time for their five-minute query freshness window. IndexNow runs after verification on a best-effort basis and search engines recrawl on their own timelines.

If the build fails, the deploy job never starts. If deployment or verification fails, check both the run and the Pages deployment history. A verification timeout leaves live status uncertain, since propagation can finish after the workflow times out. Compare `https://imadlab.com/publication-build.txt` to the attempted run ID and attempt. Fix the build or content and start a fresh workflow dispatch to fetch current data. For a content rollback, restore the intended visibility or content in Supabase and rebuild. For a code rollback, revert the faulty change on the publishing branch and let the push rebuild from current visibility. Rebuilding from current data avoids republishing an old artifact that may include since-unpublished content.

The existing SEO CI runs a synthetic save-to-preview smoke test. To run it locally after `npm ci`, use `node tests/build.mjs`. It tests the old and new releases over HTTP, including removal responses, feeds, and the deployment marker. Its reported time is local build and verification time, not GitHub Pages save-to-live latency.

To measure hosted save-to-live time, get owner approval and exercise the workflow in a separate repository with a disposable Pages site and synthetic Supabase database. Set both the build (`SUPABASE_URL` and `SUPABASE_ANON_KEY`) and Vite (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) environment variables to staging, use its own host for the site URL and marker probe, omit the production CNAME, and skip IndexNow. Verify a post create/edit/delete and project publish/unpublish, one failed build, and one additional edit made during a running build. Record the final save, workflow start, verified marker, and live URL check times. Use the observed save-to-live interval to set expectations. Keep GitHub Actions failure notifications enabled and check for the Pages workflow result when marker verification fails.
