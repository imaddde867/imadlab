import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { SITE_URL } from './utils/site.js';
import { readPublicContent } from './public-content.js';

const inventory = await readPublicContent();
const dist = path.resolve('dist');
const expected = inventory.routes.map(({ route }) => SITE_URL + route);
const expectedSet = new Set(expected);
assert.equal(expectedSet.size, expected.length, 'duplicate inventory route');

const xml = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
const actual = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1].replace(/&amp;/g, '&'));
assert.equal(actual.length, expected.length, 'sitemap URL count mismatch');
assert.equal(new Set(actual).size, actual.length, 'duplicate sitemap URL');
assert.deepEqual(new Set(actual), expectedSet, 'sitemap URLs differ from public inventory');

const feed = JSON.parse(await readFile(path.join(dist, 'feed.json'), 'utf8'));
const feedUrls = feed.items.map((item) => item.url);
const postUrls = inventory.posts.map(({ slug }) => SITE_URL + '/blogs/' + slug + '/');
assert.equal(new Set(feedUrls).size, feedUrls.length, 'duplicate feed URL');
assert.deepEqual(new Set(feedUrls), new Set(postUrls), 'JSON feed differs from public posts');
const rss = await readFile(path.join(dist, 'feed.xml'), 'utf8');
const rssUrls = [...rss.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g)].map((match) => match[1]);
assert.deepEqual(new Set(rssUrls), new Set(postUrls), 'RSS feed differs from public posts');

const titles = new Set();
for (const url of expected) {
  const route = new URL(url).pathname;
  const file = path.join(dist, route.slice(1), 'index.html');
  const html = await readFile(file, 'utf8');
  assert.ok(html.includes('<link rel="canonical" href="' + url + '"'),
    'missing or incorrect canonical: ' + route);
  assert.match(html, /<div id="root">[\s\S]*?<main data-prerender="true"[\s\S]*?<h1\b/,
    'missing visible static HTML content: ' + route);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(title && title.trim(), 'missing title: ' + route);
  assert.ok(!titles.has(title), 'duplicate SEO title: ' + title);
  titles.add(title);
}

async function listHtmlIndexes(dir, files = []) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) await listHtmlIndexes(fullPath, files);
    else if (item.isFile() && item.name === 'index.html') {
      files.push(path.relative(dist, fullPath).split(path.sep).join('/'));
    }
  }
  return files;
}

const excludedHtml = new Set(['resume/index.html']); // Public resume wrapper intentionally not indexed.
const actualHtml = (await listHtmlIndexes(dist))
  .filter((file) => !excludedHtml.has(file))
  .map((file) => SITE_URL + (file === 'index.html' ? '/' : '/' + file.slice(0, -'index.html'.length)));
assert.deepEqual(new Set(actualHtml), expectedSet, 'generated HTML routes differ from sitemap');
assert.equal(actualHtml.length, expected.length, 'unindexed or duplicate generated HTML');
console.log('PASS sitemap/static HTML and JSON/RSS feed parity: ' +
  expected.length + ' routes, ' + inventory.posts.length + ' posts.');
