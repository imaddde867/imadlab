import { writeFile } from 'node:fs/promises';
import { SITE_URL } from './utils/site.js';
import { readPublicContent, toAbsolutePublicImageUrl } from './public-content.js';

const escapeXml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const inventory = await readPublicContent();
const sitemapItems = inventory.routes.map(({ route, lastmod, image_url }) => {
  const image = toAbsolutePublicImageUrl(image_url);
  return [
    '  <url>',
    '    <loc>' + escapeXml(SITE_URL + route) + '</loc>',
    lastmod ? '    <lastmod>' + lastmod + '</lastmod>' : null,
    image ? '    <image:image><image:loc>' + escapeXml(image) + '</image:loc></image:image>' : null,
    '  </url>'
  ].filter(Boolean).join('\n');
});
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ...sitemapItems,
  '</urlset>',
  ''
].join('\n');

await writeFile('public/sitemap.xml', sitemap, 'utf8');
console.log('Sitemap generated with ' + inventory.routes.length + ' canonical routes.');
