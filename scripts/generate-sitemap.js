import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const SITEMAP_PATH = './public/sitemap.xml';
const SITE_URL = 'https://imadlab.me';

async function generateSitemap() {
  console.log('🚀 Generating enhanced sitemap...');

  // Fetch posts with updated_at for better lastmod
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('slug, published_date, updated_at')
    .order('published_date', { ascending: false });

  if (postsError) {
    console.error('Error fetching posts:', postsError);
    return;
  }

  // Fetch projects with updated_at for better lastmod
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, created_at, updated_at')
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
    { url: '/extras', priority: '0.7', changefreq: 'monthly', lastmod: today }
  ];

  // Derive unique tags from posts
  const tagSet = new Set();
  for (const p of posts ?? []) {
    if (Array.isArray(p.tags)) for (const t of p.tags) if (t && typeof t === 'string') tagSet.add(t);
  }
  const tagUrls = Array.from(tagSet).map((t) => ({
    url: `/tags/${encodeURIComponent(t)}`,
    priority: '0.6',
    changefreq: 'weekly',
    lastmod: today,
  }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
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
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, sitemap);
  console.log(`✅ Sitemap generated with ${staticPages.length + posts.length + projects.length} URLs`);
  console.log(`📊 Content: ${posts.length} blog posts, ${projects.length} projects`);
}

generateSitemap().catch(console.error);
