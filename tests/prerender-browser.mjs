import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import { chromium } from 'playwright';

// tests/build.mjs must run first to populate dist with synthetic routes.
const dist = path.resolve('dist');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(dist, '.' + pathname);
    if (file !== dist && !file.startsWith(dist + path.sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    const info = await stat(file);
    if (info.isDirectory()) file = path.join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
let browser;
const markers = {
  post: ['POST_BEGIN_MARKER', 'POST_MIDDLE_MARKER', 'POST_END_MARKER'],
  project: ['PROJECT_BEGIN_MARKER', 'PROJECT_MIDDLE_MARKER', 'PROJECT_END_MARKER'],
  fallback: ['FALLBACK_PROJECT_DESCRIPTION_MARKER'],
};
try {
  browser = await chromium.launch({ headless: true });
  for (const enabled of [false, true]) {
    const context = await browser.newContext({
      javaScriptEnabled: enabled,
      viewport: { width: 390, height: 844 },
    });
    // Synthetic data is embedded in dist; never contact external services.
    await context.route('**/*', (route) => {
      if (route.request().url().startsWith(origin + '/')) return route.continue();
      return route.abort();
    });
    for (const [kind, route, expected] of [
      ['post', '/blogs/synthetic-article/', markers.post],
      ['project', '/projects/00000000-0000-0000-0000-000000000001/', markers.project],
      ['fallback', '/projects/00000000-0000-0000-0000-000000000002/', markers.fallback],
    ]) {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(origin + route, { waitUntil: 'domcontentloaded' });
      const article = enabled
        ? page.locator('main#main article').last()
        : page.locator('#root [data-prerender="true"] article');
      await article.waitFor({ timeout: 20000 });
      for (const marker of expected) {
        await page.getByText(marker, { exact: false }).first().waitFor({ timeout: 20000 });
      }
      const articleText = await article.innerText();
      for (const marker of expected) {
        assert.ok(articleText.includes(marker), kind + ' (js=' + enabled + '): missing ' + marker);
      }
      if (kind === 'post') {
        const signedVideo = article.locator('video[src="https://example.org/demo.mp4?token=fixture#t=1"]');
        assert.equal(await signedVideo.count(), 1,
          'signed video must remain a video with JavaScript ' + enabled);
        const inline = article.locator('p:has(img[alt="inline icon"])');
        assert.equal(await inline.count(), 1, 'inline image must remain in its paragraph (js=' + enabled + ')');
        assert.match((await inline.textContent()) || '', /^Before\s+after$/);
        const linked = article.locator('p:has(a[href="https://example.org/icon"] img[alt="linked icon"])');
        assert.equal(await linked.count(), 1, 'linked inline image must remain in its paragraph (js=' + enabled + ')');
        assert.match((await linked.textContent()) || '', /^Before\s+after$/);
        assert.equal(await article.locator('figure:has(img[alt="Standalone icon"])').count(), 1,
          'standalone image retains its figure (js=' + enabled + ')');
        assert.equal(await article.locator('a[href="https://example.org/linked-icon"] figure:has(img[alt="Standalone linked icon"])').count(), 1,
          'standalone linked image retains its figure (js=' + enabled + ')');
      }
      if (enabled) {
        assert.equal(await page.locator('#root [data-prerender="true"]').count(), 0, 'React must replace the static root');
        assert.deepEqual(errors, [], kind + ': browser page errors');
      } else {
        const width = await article.evaluate((el) => el.getBoundingClientRect().width);
        assert.ok(width > 220 && width <= 390, kind + ': article overflows mobile viewport: ' + width);
        const list = page.locator('.prerender-content .article-body ul').first();
        if (await list.count()) {
          const marker = await list.evaluate((el) => getComputedStyle(el).listStyleType);
          assert.notEqual(marker, 'none', kind + ': no-JS list markers must remain visible');
        }
        const link = page.locator('.prerender-content .article-body a').first();
        if (await link.count()) {
          const decoration = await link.evaluate((el) => getComputedStyle(el).textDecorationLine);
          assert.ok(decoration.includes('underline'), kind + ': no-JS links must be recognizable');
        }
        if (kind === 'post') {
          const keyword = article.locator('pre code .hljs-keyword').first();
          assert.equal(await keyword.count(), 1, 'static JS block must contain highlighted keywords');
          const colors = await keyword.evaluate((el) => ({
            token: getComputedStyle(el).color,
            base: getComputedStyle(el.closest('code')).color,
          }));
          assert.notEqual(colors.token, colors.base,
            'highlight.js token colors must survive the production Tailwind build');
          assert.equal(await page.locator('.prerender-table').count(), 1, 'no-JS table must be present');
          assert.equal(await page.locator('.prerender-math .katex').count(), 1, 'fenced latex must render without JavaScript');
          assert.equal(await page.locator('.prerender-media video[controls]').count(), 2,
            'plain and signed Markdown videos should both retain native controls');
        }
      }
      await page.close();
    }
    await context.close();
  }
  console.log('PASS Chromium mobile no-JS CSS/content and JavaScript/React content parity');
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
