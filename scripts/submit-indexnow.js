import fs from 'fs/promises';

const SITE_URL = 'https://imadlab.com';
const HOST = 'imadlab.com';
const DEFAULT_INDEXNOW_KEY = '47bf4593ec4fc33700cda5cecf0d7fec';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const SITEMAP_PATH = './public/sitemap.xml';
const URL_BATCH_SIZE = 10000;

const getUrlsFromSitemap = async (sitemapPath) => {
  const xml = await fs.readFile(sitemapPath, 'utf8');
  const urls = [];
  const regex = /<loc>([^<]+)<\/loc>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const url = match[1]?.trim();
    if (url && url.startsWith(SITE_URL)) {
      urls.push(url);
    }
  }
  return Array.from(new Set(urls));
};

const postIndexNowBatch = async ({ key, keyLocation, urlList }) => {
  const payload = {
    host: HOST,
    key,
    keyLocation,
    urlList,
  };

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`IndexNow request failed (${res.status}): ${body}`);
  }
};

const chunk = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

async function main() {
  const key = (process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY).trim();
  const keyLocation = `${SITE_URL}/${key}.txt`;

  try {
    await fs.access(`./public/${key}.txt`);
  } catch {
    console.warn(`⚠️  IndexNow skipped: missing key file public/${key}.txt`);
    process.exit(0);
  }

  const urls = await getUrlsFromSitemap(SITEMAP_PATH);
  if (!urls.length) {
    console.warn('⚠️  IndexNow skipped: no URLs found in sitemap.');
    return;
  }

  const batches = chunk(urls, URL_BATCH_SIZE);
  for (const [index, urlList] of batches.entries()) {
    await postIndexNowBatch({ key, keyLocation, urlList });
    console.log(`✅ IndexNow batch ${index + 1}/${batches.length} submitted (${urlList.length} URLs).`);
  }
}

main().catch((error) => {
  console.error('❌ IndexNow submission failed:', error);
  process.exit(1);
});
