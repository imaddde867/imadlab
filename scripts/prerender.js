import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SITE_URL = 'https://imadlab.me';
const SITE_NAME = 'Imadlab';
const DEFAULT_TITLE = `${SITE_NAME} | Data Engineer & AI/ML Portfolio`;
const DEFAULT_IMAGE = `${SITE_URL}/images/hero-moon.png`;
const DEFAULT_TWITTER = '@imadlab';
const SEO_BLOCK_PATTERN = /<!-- prerender-seo:start -->[\s\S]*?<!-- prerender-seo:end -->/;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const SEO_TITLE_MAP = {
  Explainium: 'Explainium: Local LLM Procedural Knowledge Extraction',
  InfiniteChessAI: 'InfiniteChessAI: Self-Improving Chess Engine in SwiftUI',
  'Spiral Untangler ANN': 'Neural Network for Nonlinear Classification (NumPy)',
};

const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const serialise = (data) => JSON.stringify(data).replace(/</g, '\\u003C');
const getSeoTitle = (title) => {
  if (!title || typeof title !== 'string') return title;
  const trimmed = title.trim();
  return SEO_TITLE_MAP[trimmed] || trimmed;
};

const toAbsoluteUrl = (value) => {
  if (!value || typeof value !== 'string') return DEFAULT_IMAGE;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

const stripMarkdown = (value = '') =>
  value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/[#>*_~`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getFullTitle = (title) => {
  const trimmed = typeof title === 'string' ? title.trim() : '';
  return trimmed ? `${trimmed} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
};

const buildSeoBlock = ({
  title,
  description,
  canonicalUrl,
  image,
  imageAlt,
  type = 'website',
  twitterHandle,
  structuredData,
}) => {
  const fullTitle = getFullTitle(title);
  const metaDescription = typeof description === 'string' ? description.trim() : '';
  const url = canonicalUrl || SITE_URL;
  const ogImage = toAbsoluteUrl(image);
  const alt = imageAlt || fullTitle;
  const twitter = twitterHandle || DEFAULT_TWITTER;

  const jsonLd = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  const jsonLdScripts = jsonLd
    .map(
      (schema) =>
        `    <script type="application/ld+json">${serialise(schema)}</script>`
    )
    .join('\n');

  return `<!-- prerender-seo:start -->
    <link rel="canonical" href="${escapeHtml(url)}" />
    <meta property="og:title" content="${escapeHtml(fullTitle)}" />
    <meta property="og:description" content="${escapeHtml(metaDescription)}" />
    <meta property="og:type" content="${escapeHtml(type)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta property="og:image:alt" content="${escapeHtml(alt)}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="${escapeHtml(twitter)}" />
    <meta name="twitter:creator" content="${escapeHtml(twitter)}" />
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(metaDescription)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(alt)}" />
${jsonLdScripts ? `${jsonLdScripts}\n` : ''}    <!-- prerender-seo:end -->`;
};

const applySeoToHtml = (html, seo) => {
  if (!seo) return html;

  const title = getFullTitle(seo.title);
  const description = typeof seo.description === 'string' ? seo.description.trim() : '';

  let output = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  output = output.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  const block = buildSeoBlock(seo);
  if (SEO_BLOCK_PATTERN.test(output)) {
    output = output.replace(SEO_BLOCK_PATTERN, block);
  } else if (output.includes('</head>')) {
    output = output.replace('</head>', `${block}\n  </head>`);
  }

  return output;
};

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

const renderProjectDetailMarkup = (project) => {
  const descriptiveTitle = escapeHtml(getSeoTitle(project.title));
  const detailSource = project.full_description || project.description || '';
  const summary =
    detailSource.length > 420 ? `${detailSource.slice(0, 417)}...` : detailSource;
  const safeSummary = escapeHtml(summary);
  const tags = Array.isArray(project.tech_tags)
    ? project.tech_tags.filter(Boolean).slice(0, 6)
    : [];
  const published = project.created_at
    ? new Date(project.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return `
<main data-prerender="true" class="prerender-shell">
  <article class="prerender-article">
    <p class="prerender-meta text-sm text-white/60">${escapeHtml(published)}</p>
    <h1 class="text-3xl font-bold mb-4">${descriptiveTitle}</h1>
    ${tags.length ? `<p class="prerender-tags">Tech: ${escapeHtml(tags.join(', '))}</p>` : ''}
    ${
      project.image_url
        ? `<div class="prerender-image"><img src="${escapeHtml(
            project.image_url
          )}" alt="${descriptiveTitle}" loading="lazy" decoding="async" /></div>`
        : ''
    }
    ${
      safeSummary
        ? `<p class="prerender-summary leading-relaxed">${safeSummary}</p>`
        : '<p class="prerender-summary">Full project details will load after hydration.</p>'
    }
    ${
      project.repo_url
        ? `<p class="prerender-meta mt-4">Source: <a class="prerender-link inline" href="${escapeHtml(project.repo_url)}" rel="noopener">View repository</a></p>`
        : ''
    }
    <a class="prerender-link mt-6 inline-flex" href="/projects/${project.id}">Continue exploring</a>
  </article>
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
      const cover = post.image_url
        ? `<div class="prerender-image"><img src="${escapeHtml(post.image_url)}" alt="${escapeHtml(post.title)}" loading="lazy" decoding="async" /></div>`
        : '';

      return `
    <article class="prerender-card">
      ${cover}
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

const renderPostDetailMarkup = (post) => {
  const headline = escapeHtml(post.title || 'Blog post');
  const summarySource = post.excerpt || stripMarkdown(post.body || '');
  const summary = escapeHtml(summarySource.length > 420 ? `${summarySource.slice(0, 417)}...` : summarySource);
  const published = post.published_date
    ? new Date(post.published_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
  const tags = Array.isArray(post.tags) ? post.tags.filter(Boolean).slice(0, 6) : [];

  return `
<main data-prerender="true" class="prerender-shell">
  <article class="prerender-article">
    ${published ? `<p class="prerender-meta text-sm text-white/60">${escapeHtml(published)}</p>` : ''}
    <h1 class="text-3xl font-bold mb-4">${headline}</h1>
    ${tags.length ? `<p class="prerender-tags">Tags: ${escapeHtml(tags.join(', '))}</p>` : ''}
    ${summary ? `<p class="prerender-summary leading-relaxed">${summary}</p>` : ''}
    <a class="prerender-link mt-6 inline-flex" href="/blogs">Back to Blog</a>
  </article>
</main>`;
};

const injectIntoPage = async ({ route, markup, dataKey, data, baseHtml, seo }) => {
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

    html = applySeoToHtml(html, seo);

    // Replace root container content
    const rootPattern = /<div id="root">[\s\S]*?<\/div>/;
    if (!rootPattern.test(html)) {
      console.warn(`⚠️  Unable to locate root container in ${targetPath}. Skipping prerender injection.`);
      return;
    }

    html = html.replace(rootPattern, `<div id="root">${markup}\n</div>`);

    // Remove existing prerender script if present
    html = html.replace(/<script>window\.__PRERENDERED_DATA__[\s\S]*?<\/script>\s*/g, '');

    if (dataKey && data !== undefined) {
      const dataScript = `<script>window.__PRERENDERED_DATA__ = window.__PRERENDERED_DATA__ || {}; window.__PRERENDERED_DATA__["${dataKey}"] = ${serialise(data)};</script>`;
      html = html.replace('</body>', `${dataScript}\n</body>`);
    }

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
    .select(
      'id,title,description,full_description,tech_tags,created_at,updated_at,image_url,repo_url,demo_url,featured'
    )
    .order('featured', { ascending: false })
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
    .select('id,title,slug,excerpt,body,tags,published_date,updated_at,read_time,image_url')
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
    seo: {
      title: 'Projects',
      description:
        'Explore a collection of my projects in data engineering, AI, and machine learning.',
      canonicalUrl: `${SITE_URL}/projects`,
      image: DEFAULT_IMAGE,
      type: 'website',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Projects',
        url: `${SITE_URL}/projects`,
      },
    },
  });

  await injectIntoPage({
    route: 'blogs',
    markup: renderPostsMarkup(posts),
    dataKey: 'posts',
    data: posts,
    baseHtml,
    seo: {
      title: 'Blog',
      description: 'Latest writing from Imadlab on data engineering, AI, and machine learning.',
      canonicalUrl: `${SITE_URL}/blogs`,
      image: DEFAULT_IMAGE,
      type: 'website',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Blog',
        url: `${SITE_URL}/blogs`,
      },
    },
  });

  for (const project of projects) {
    if (!project?.id) continue;
    const seoTitle = getSeoTitle(project.title);
    const descriptionSource = project.description || project.full_description || '';
    const description = descriptionSource
      ? stripMarkdown(descriptionSource).slice(0, 180) + (stripMarkdown(descriptionSource).length > 180 ? '...' : '')
      : 'Explore a highlighted data or AI project delivered by Imad Eddine El Mouss.';
    const canonicalUrl = `${SITE_URL}/projects/${project.id}`;
    const image = project.image_url ? toAbsoluteUrl(project.image_url) : DEFAULT_IMAGE;
    await injectIntoPage({
      route: path.join('projects', project.id),
      markup: renderProjectDetailMarkup(project),
      dataKey: `project:${project.id}`,
      data: project,
      baseHtml,
      seo: {
        title: seoTitle,
        description,
        canonicalUrl,
        image,
        imageAlt: seoTitle,
        type: 'website',
        structuredData: {
          '@context': 'https://schema.org',
          '@type': project.repo_url ? 'SoftwareApplication' : 'CreativeWork',
          name: seoTitle,
          description,
          url: canonicalUrl,
          image,
          codeRepository: project.repo_url || undefined,
          sameAs: [project.repo_url, project.demo_url].filter(Boolean),
          datePublished: project.created_at,
          dateModified: project.updated_at ?? project.created_at,
          author: {
            '@type': 'Person',
            name: 'Imad Eddine El Mouss',
            url: `${SITE_URL}/about`,
          },
        },
      },
    });
  }

  for (const post of posts) {
    if (!post?.slug) continue;
    const descriptionSource = post.excerpt || stripMarkdown(post.body || '');
    const description = descriptionSource.length > 155 ? `${descriptionSource.slice(0, 152)}...` : descriptionSource;
    const canonicalUrl = `${SITE_URL}/blogs/${post.slug}`;
    const image = post.image_url ? toAbsoluteUrl(post.image_url) : DEFAULT_IMAGE;
    await injectIntoPage({
      route: path.join('blogs', post.slug),
      markup: renderPostDetailMarkup(post),
      dataKey: `post:${post.slug}`,
      data: post,
      baseHtml,
      seo: {
        title: post.title,
        description,
        canonicalUrl,
        image,
        imageAlt: post.title,
        type: 'article',
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          name: post.title,
          description,
          url: canonicalUrl,
          image,
          datePublished: post.published_date,
          dateModified: post.updated_at ?? post.published_date,
          author: {
            '@type': 'Person',
            name: 'Imad Eddine El Mouss',
            url: `${SITE_URL}/about`,
          },
          publisher: {
            '@type': 'Person',
            name: 'Imad Eddine El Mouss',
            url: `${SITE_URL}/about`,
          },
          keywords: Array.isArray(post.tags) ? post.tags.filter(Boolean).join(', ') : undefined,
          mainEntityOfPage: canonicalUrl,
        },
      },
    });
  }

  console.log('✨ Prerender completed.');
}

main().catch((error) => {
  console.error('Unhandled error during prerender:', error);
  process.exitCode = 1;
});
