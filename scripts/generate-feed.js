import { writeFile } from 'node:fs/promises';
import { stripMarkdown } from './utils/markdown.js';
import { SITE_URL } from './utils/site.js';
import { readPublicContent } from './public-content.js';

const escapeXml = (value) =>
  String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const escapeCdata = (value) => String(value ?? '').replace(/]]>/g, ']]]]><![CDATA[>');

const inventory = await readPublicContent();
const items = inventory.posts.map((post) => {
  const url = SITE_URL + '/blogs/' + encodeURIComponent(post.slug) + '/';
  const plainBody = stripMarkdown(post.body || '');
  const summary = typeof post.excerpt === 'string' && post.excerpt.trim()
    ? post.excerpt.trim()
    : plainBody.slice(0, 220);
  return {
    ...post, url, summary, plainBody,
    publishedISO: new Date(post.published_date).toISOString(),
    updatedISO: post.updated_at ? new Date(post.updated_at).toISOString() : undefined
  };
});

const rssItems = items.map((item) => {
  const categories = Array.isArray(item.tags)
    ? item.tags.filter((tag) => typeof tag === 'string' && tag.trim())
      .map((tag) => '    <category>' + escapeXml(tag) + '</category>').join('\n')
    : '';
  return [
    '  <item>',
    '    <title>' + escapeXml(item.title) + '</title>',
    '    <link>' + escapeXml(item.url) + '</link>',
    '    <guid>' + escapeXml(item.url) + '</guid>',
    '    <description><![CDATA[' + escapeCdata(item.summary) + ']]></description>',
    '    <pubDate>' + new Date(item.publishedISO).toUTCString() + '</pubDate>',
    categories,
    '  </item>'
  ].filter(Boolean).join('\n');
}).join('\n');

const rss = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
  '<channel>',
  '  <title>Imadlab Blog</title>',
  '  <link>' + SITE_URL + '</link>',
  '  <description>Technical notes on industrial AI systems, procedural extraction, architecture, and evaluation.</description>',
  '  <language>en-us</language>',
  '  <lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>',
  '  <atom:link href="' + SITE_URL + '/feed.xml" rel="self" type="application/rss+xml" />',
  rssItems,
  '</channel>',
  '</rss>',
  ''
].join('\n');

const jsonFeed = {
  version: 'https://jsonfeed.org/version/1.1',
  title: 'Imadlab Blog',
  home_page_url: SITE_URL,
  feed_url: SITE_URL + '/feed.json',
  description: 'Technical notes on industrial AI systems, procedural extraction, architecture, and evaluation.',
  items: items.map((item) => ({
    id: item.url,
    url: item.url,
    title: item.title,
    summary: item.summary,
    tags: Array.isArray(item.tags)
      ? item.tags.filter((tag) => typeof tag === 'string' && tag.trim())
      : undefined,
    date_published: item.publishedISO,
    date_modified: item.updatedISO || item.publishedISO,
    content_text: item.plainBody
  }))
};

await writeFile('public/feed.xml', rss, 'utf8');
await writeFile('public/feed.json', JSON.stringify(jsonFeed, null, 2), 'utf8');
console.log('Feeds generated with ' + items.length + ' canonical blog URLs.');
