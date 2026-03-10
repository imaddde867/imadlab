import fs from 'fs';
import { SITE_URL } from './utils/site.js';
import { createSupabaseClient } from './utils/supabase.js';

const SITEMAP_PATH = './public/sitemap.xml';
const supabase = createSupabaseClient();
const ABSOLUTE_PREFIXES = ['http://', 'https://'];

const escapeXml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toAbsoluteImageUrl = (value) => {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (ABSOLUTE_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) return trimmed;
  if (trimmed.startsWith('/')) return `${SITE_URL}${trimmed}`;
  return `${SITE_URL}/${trimmed}`;
};

const renderImageTag = (imageUrl) => {
  const absoluteImageUrl = toAbsoluteImageUrl(imageUrl);
  if (!absoluteImageUrl) return '';
  return `\n    <image:image>\n      <image:loc>${escapeXml(absoluteImageUrl)}</image:loc>\n    </image:image>`;
};

async function generateSitemap() {
  console.log('🚀 Generating enhanced sitemap...');

  // Fetch posts with updated_at for better lastmod
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('slug, published_date, updated_at, tags, image_url')
    .order('published_date', { ascending: false });

  if (postsError) {
    console.error('Error fetching posts:', postsError);
    return;
  }

  // Fetch projects with updated_at for better lastmod
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, created_at, updated_at, tech_tags, image_url')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  // Static pages with their priorities and change frequencies
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily', lastmod: today },
    { url: '/about', priority: '0.9', changefreq: 'monthly', lastmod: today },
    { url: '/projects', priority: '0.8', changefreq: 'weekly', lastmod: today },
    { url: '/blogs', priority: '0.8', changefreq: 'weekly', lastmod: today },
    { url: '/tags', priority: '0.7', changefreq: 'weekly', lastmod: today },
    { url: '/extras', priority: '0.7', changefreq: 'monthly', lastmod: today }
  ];

  const slugify = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  // Derive unique tags from posts
  const tagSet = new Set();
  for (const p of posts ?? []) {
    if (Array.isArray(p.tags)) for (const t of p.tags) if (t && typeof t === 'string') tagSet.add(slugify(t));
  }
  for (const pr of projects ?? []) {
    if (Array.isArray(pr.tech_tags)) for (const t of pr.tech_tags) if (t && typeof t === 'string') tagSet.add(slugify(t));
  }
  const tagUrls = Array.from(tagSet).map((slug) => ({
    url: `/tags/${encodeURIComponent(slug)}`,
    priority: '0.6',
    changefreq: 'weekly',
    lastmod: today,
  }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...staticPages, ...tagUrls]
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
${posts
  .map(
    (post) => `  <url>
    <loc>${SITE_URL}/blogs/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at || post.published_date).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    ${renderImageTag(post.image_url)}
  </url>`
  )
  .join('\n')}
${projects
  .map(
    (project) => `  <url>
    <loc>${SITE_URL}/projects/${project.id}</loc>
    <lastmod>${new Date(project.updated_at || project.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    ${renderImageTag(project.image_url)}
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, sitemap);
  console.log(
    `✅ Sitemap generated with ${staticPages.length + tagUrls.length + posts.length + projects.length} URLs`
  );
  console.log(`📊 Content: ${posts.length} blog posts, ${projects.length} projects`);
}

generateSitemap().catch(console.error);
