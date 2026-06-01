import fs from 'fs/promises';

const SITE_URL = 'https://imadlab.com';
const HOST = 'imadlab.com';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const SITEMAP_PATH = './public/sitemap.xml';
const URL_BATCH_SIZE = 10000;
const KEY_POLL_ATTEMPTS = 12;
const KEY_POLL_INTERVAL_MS = 10_000;
const SUBMIT_RETRY_ATTEMPTS = 3;
const SUBMIT_RETRY_DELAY_MS = 15_000;

const getUrlsFromSitemap = async (sitemapPath) => {
  const xml = await fs.readFile(sitemapPath, 'utf8');
  const urls = [];
  const regex = /<url>\s*<loc>([^<]+)<\/loc>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const url = match[1]?.trim();
    if (url && url.startsWith(SITE_URL)) {
      urls.push(url);
    }
  }
  return Array.from(new Set(urls));
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForPublishedKey = async ({ key, keyLocation }) => {
  for (let attempt = 1; attempt <= KEY_POLL_ATTEMPTS; attempt += 1) {
    const probeUrl = `${keyLocation}?v=${Date.now()}-${attempt}`;
    try {
      const res = await fetch(probeUrl, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const body = res.ok ? (await res.text()).trim() : '';
      if (res.ok && body === key) {
        console.log(`✅ IndexNow key file verified at ${keyLocation}`);
        return true;
      }
    } catch {
      // Ignore transient fetch errors while waiting for propagation.
    }

    if (attempt < KEY_POLL_ATTEMPTS) {
      console.log(
        `⏳ Waiting for key file publication (${attempt}/${KEY_POLL_ATTEMPTS})...`
      );
      await sleep(KEY_POLL_INTERVAL_MS);
    }
  }

  return false;
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
    const error = new Error(`IndexNow request failed (${res.status}): ${body}`);
    error.status = res.status;
    throw error;
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
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key) {
    console.warn('⚠️  IndexNow skipped: INDEXNOW_KEY not set.');
    process.exit(0);
  }

  const keyLocation = `${SITE_URL}/${key}.txt`;

  try {
    await fs.access(`./public/${key}.txt`);
  } catch {
    console.warn(`⚠️  IndexNow skipped: missing key file public/${key}.txt`);
    process.exit(0);
  }

  const keyReady = await waitForPublishedKey({ key, keyLocation });
  if (!keyReady) {
    console.warn(
      `⚠️  IndexNow skipped: key file not yet published at ${keyLocation}.`
    );
    process.exit(0);
  }

  const urls = await getUrlsFromSitemap(SITEMAP_PATH);
  if (!urls.length) {
    console.warn('⚠️  IndexNow skipped: no URLs found in sitemap.');
    return;
  }

  const batches = chunk(urls, URL_BATCH_SIZE);
  for (const [index, urlList] of batches.entries()) {
    for (let attempt = 1; attempt <= SUBMIT_RETRY_ATTEMPTS; attempt += 1) {
      try {
        await postIndexNowBatch({ key, keyLocation, urlList });
        break;
      } catch (error) {
        if (error?.status === 429) {
          console.warn(
            '⚠️  IndexNow rate-limited this request. Skipping for this deploy and trying again next deploy.'
          );
          return;
        }

        const shouldRetry = attempt < SUBMIT_RETRY_ATTEMPTS;
        if (!shouldRetry) throw error;
        console.warn(
          `⚠️  IndexNow batch ${index + 1} attempt ${attempt} failed. Retrying in ${SUBMIT_RETRY_DELAY_MS / 1000}s...`
        );
        await sleep(SUBMIT_RETRY_DELAY_MS);
      }
    }
    console.log(`✅ IndexNow batch ${index + 1}/${batches.length} submitted (${urlList.length} URLs).`);
  }
}

main().catch((error) => {
  console.warn(
    `⚠️  IndexNow submission skipped: ${error?.message || 'unexpected error'}`
  );
  process.exit(0);
});
