# imadlab

Source code for [imadlab.com](https://imadlab.com), the personal site of Imad Eddine El Mouss, Research Engineer at the Cognitive Technologies Research Group (CoRe), Turku University of Applied Sciences. The site lists my research and projects and hosts my technical writing.

## How it works

- **Front end:** React 18, TypeScript and Vite, styled with Tailwind. Every public page uses one layout component (`src/components/layout/Page.tsx`).
- **Content:** projects and posts live in Supabase Postgres. Row-level security exposes only published projects to visitors, and an admin area at `/admin` edits content.
- **Markdown:** project and post bodies are Markdown with GFM tables, KaTeX math and Mermaid diagrams, rendered by `src/components/markdown/`.
- **Prerendering:** at build time `scripts/prerender.js` fetches the content and writes a static HTML page for each route, with its title and link-preview tags. The sitemap and RSS feed are generated in the same step.
- **Deployment:** every push to `master` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`). New database content shows up in the app at once, but link previews only update on the next build.
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
