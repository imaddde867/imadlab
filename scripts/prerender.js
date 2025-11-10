import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const serialise = (data) => JSON.stringify(data).replace(/</g, '\\u003C');

const renderProjectsMarkup = (projects) => {
  if (!projects.length) {
    return `
<main data-prerender="true" class="prerender-shell">
  <h1 class="text-3xl font-bold mb-4">Projects</h1>
  <p class="text-base text-white/70">No projects yet. Check back soon.</p>
</main>`;
  }

  const items = projects
    .map((project) => {
      const description = project.description || project.full_description || '';
      const summary = escapeHtml(description.length > 220 ? `${description.slice(0, 217)}...` : description);
      const tags = Array.isArray(project.tech_tags)
        ? project.tech_tags.filter(Boolean).slice(0, 5)
        : [];

      return `
    <article class="prerender-card">
      <h2 class="prerender-title">${escapeHtml(project.title)}</h2>
      ${tags.length ? `<p class="prerender-tags">Tech: ${escapeHtml(tags.join(', '))}</p>` : ''}
      ${summary ? `<p class="prerender-summary">${summary}</p>` : ''}
      <a href="/projects/${project.id}" class="prerender-link">View project</a>
    </article>`;
    })
    .join('\n');

  return `
<main data-prerender="true" class="prerender-shell">
  <h1 class="text-3xl font-bold mb-4">Projects</h1>
  <section class="prerender-grid">
${items}
  </section>
</main>`;
};

const renderPostsMarkup = (posts) => {
  if (!posts.length) {
    return `
<main data-prerender="true" class="prerender-shell">
  <h1 class="text-3xl font-bold mb-4">Blog</h1>
  <p class="text-base text-white/70">No posts yet. Discover new updates soon.</p>
</main>`;
  }

  const items = posts
    .map((post) => {
      const summarySource = post.excerpt || post.body || '';
      const summary = escapeHtml(summarySource.length > 220 ? `${summarySource.slice(0, 217)}...` : summarySource);
      const published = post.published_date
        ? new Date(post.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';
      const tags = Array.isArray(post.tags) ? post.tags.filter(Boolean).slice(0, 5) : [];

      return `
    <article class="prerender-card">
      <h2 class="prerender-title">${escapeHtml(post.title)}</h2>
      ${published ? `<p class="prerender-meta">Published ${escapeHtml(published)}</p>` : ''}
      ${tags.length ? `<p class="prerender-tags">Tags: ${escapeHtml(tags.join(', '))}</p>` : ''}
      ${summary ? `<p class="prerender-summary">${summary}</p>` : ''}
      <a href="/blogs/${post.slug}" class="prerender-link">Read article</a>
    </article>`;
    })
    .join('\n');

  return `
<main data-prerender="true" class="prerender-shell">
  <h1 class="text-3xl font-bold mb-4">Blog</h1>
  <section class="prerender-grid">
${items}
  </section>
</main>`;
};

const injectIntoPage = async ({ route, markup, dataKey, data, baseHtml }) => {
  const routeDir = path.join(DIST_DIR, route);
  const targetPath = path.join(routeDir, 'index.html');

  await fs.mkdir(routeDir, { recursive: true });

  try {
    let html;
    try {
      html = await fs.readFile(targetPath, 'utf8');
    } catch (readError) {
      if (readError.code !== 'ENOENT') {
        throw readError;
      }
      html = baseHtml;
    }

    // Replace root container content
    const rootPattern = /<div id="root">[\s\S]*?<\/div>/;
    if (!rootPattern.test(html)) {
      console.warn(`⚠️  Unable to locate root container in ${targetPath}. Skipping prerender injection.`);
      return;
    }

    html = html.replace(rootPattern, `<div id="root">${markup}\n</div>`);

    // Remove existing prerender script if present
    html = html.replace(/<script>window\.__PRERENDERED_DATA__[\s\S]*?<\/script>\s*/g, '');

    const dataScript = `<script>window.__PRERENDERED_DATA__ = window.__PRERENDERED_DATA__ || {}; window.__PRERENDERED_DATA__["${dataKey}"] = ${serialise(data)};</script>`;
    html = html.replace('</body>', `${dataScript}\n</body>`);

    await fs.writeFile(targetPath, html, 'utf8');
    console.log(`✅ Prerendered content injected into ${route}/index.html`);
  } catch (error) {
    console.error(`❌ Failed to inject prerender content for ${route}:`, error);
  }
};

const ensureDistExists = async () => {
  try {
    await fs.access(DIST_DIR);
    return true;
  } catch {
    console.warn('⚠️  Dist directory not found. Run `vite build` before prerendering.');
    return false;
  }
};

async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('id,title,description,full_description,tech_tags,created_at')
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Failed to fetch projects for prerendering:', error);
    return [];
  }

  return data ?? [];
}

async function fetchPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('id,title,slug,excerpt,body,tags,published_date,read_time')
    .order('published_date', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Failed to fetch posts for prerendering:', error);
    return [];
  }

  return data ?? [];
}

async function main() {
  if (!(await ensureDistExists())) {
    return;
  }

  console.log('🛠️  Starting prerender pass for key routes...');

  let baseHtml;
  try {
    baseHtml = await fs.readFile(path.join(DIST_DIR, 'index.html'), 'utf8');
  } catch (error) {
    console.error('❌ Unable to read dist/index.html. Ensure the Vite build completed successfully.', error);
    return;
  }

  const [projects, posts] = await Promise.all([fetchProjects(), fetchPosts()]);

  await injectIntoPage({
    route: 'projects',
    markup: renderProjectsMarkup(projects),
    dataKey: 'projects',
    data: projects,
    baseHtml,
  });

  await injectIntoPage({
    route: 'blogs',
    markup: renderPostsMarkup(posts),
    dataKey: 'posts',
    data: posts,
    baseHtml,
  });

  console.log('✨ Prerender completed.');
}

main().catch((error) => {
  console.error('Unhandled error during prerender:', error);
  process.exitCode = 1;
});
