import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://mpkgugcasxpanhrkpkhs.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wa2d1Z2Nhc3hwYW5ocmtwa2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3OTU4NTEsImV4cCI6MjA2NzM3MTg1MX0.sn9HyUjNlKHrTGEpD-33bl0NfTwVz02ljAtR92YP3hI';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const SITEMAP_PATH = './public/sitemap.xml';
const SITE_URL = 'https://imadlab.me';

async function generateSitemap() {
  // Generate sitemap from database content

  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('slug, published_date');

  if (postsError) {
    console.error('Error fetching posts:', postsError);
    return;
  }

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, created_at');

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
    return;
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/projects</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blogs</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ${posts
    .map(
      (post) => `
  <url>
    <loc>${SITE_URL}/blogs/${post.slug}</loc>
    <lastmod>${new Date(post.published_date).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('')}
  ${projects
    .map(
      (project) => `
  <url>
    <loc>${SITE_URL}/projects/${project.id}</loc>
    <lastmod>${new Date(project.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, sitemap);
  // Sitemap generated successfully
}

generateSitemap();
