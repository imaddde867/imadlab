import fs from 'fs';
import { stripMarkdown } from './utils/markdown.js';
import { SITE_URL } from './utils/site.js';
import { createSupabaseClient } from './utils/supabase.js';

const FEED_PATH_RSS = './public/feed.xml';
const FEED_PATH_JSON = './public/feed.json';

const supabase = createSupabaseClient();

const escapeXml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

async function generateFeed() {
  console.log('Generating content feeds...');

  const { data: posts, error } = await supabase
    .from('posts')
    .select('title,slug,excerpt,body,tags,published_date,updated_at')
    .order('published_date', { ascending: false });

  if (error) {
    console.error('Failed to fetch posts for feed generation:', error);
    return;
  }

  const items = (posts ?? []).map((post) => {
    const itemUrl = `${SITE_URL}/blogs/${post.slug}`;
    const plainBody = stripMarkdown(post.body || '');
    const summary = post.excerpt && post.excerpt.trim().length > 0
      ? post.excerpt.trim()
      : plainBody.slice(0, 220);

    return {
      ...post,
      url: itemUrl,
      summary,
      plainBody,
      publishedISO: post.published_date ? new Date(post.published_date).toISOString() : undefined,
      updatedISO: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
    };
  });

  const rssItems = items
    .map((item) => {
      const categories = Array.isArray(item.tags)
        ? item.tags
            .filter((tag) => typeof tag === 'string' && tag.trim().length > 0)
            .map((tag) => `    <category>${escapeXml(tag)}</category>`)
            .join('\n')
        : '';

      return `  <item>
    <title>${escapeXml(item.title)}</title>
    <link>${item.url}</link>
    <guid>${item.url}</guid>
    <description><![CDATA[${item.summary}]]></description>
    <pubDate>${item.publishedISO ? new Date(item.publishedISO).toUTCString() : new Date().toUTCString()}</pubDate>
${categories}
  </item>`;
    })
    .join('\n');

  const now = new Date().toUTCString();
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Imadlab Blog</title>
  <link>${SITE_URL}</link>
  <description>Latest writing from Imadlab on data engineering, AI, and machine learning.</description>
  <language>en-us</language>
  <lastBuildDate>${now}</lastBuildDate>
  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${rssItems}
</channel>
</rss>`;

  fs.writeFileSync(FEED_PATH_RSS, rss);

  const jsonFeed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Imadlab Blog',
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.json`,
    description: 'Latest writing from Imadlab on data engineering, AI, and machine learning.',
    items: items.map((item) => ({
      id: item.url,
      url: item.url,
      title: item.title,
      summary: item.summary,
      tags: Array.isArray(item.tags) ? item.tags.filter((tag) => typeof tag === 'string' && tag.trim().length > 0) : undefined,
      date_published: item.publishedISO,
      date_modified: item.updatedISO || item.publishedISO,
      content_text: item.plainBody
    }))
  };

  fs.writeFileSync(FEED_PATH_JSON, JSON.stringify(jsonFeed, null, 2));

  console.log(`Feed generated with ${items.length} items`);
}

generateFeed().catch((err) => {
  console.error('Unhandled error during feed generation:', err);
  process.exitCode = 1;
});
