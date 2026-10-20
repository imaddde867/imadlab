import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const analytics of [false, true]) {
    const context = await browser.newContext();
    await context.addInitScript((analytics) => {
      localStorage.setItem(
        'imadlab_consent',
        encodeURIComponent(
          JSON.stringify({
            version: 1,
            timestamp: Date.now(),
            essential: true,
            analytics,
            marketing: false,
            functional: true,
          })
        )
      );
    }, analytics);
    const calls = [];
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.hostname.endsWith('.supabase.co')) {
        if (url.pathname.includes('/rpc/')) calls.push(url.pathname.split('/').at(-1));
        return route.fulfill({
          json: url.pathname.includes('/rpc/track_page_view')
            ? '00000000-0000-0000-0000-000000000001'
            : url.pathname.includes('/rpc/')
              ? null
              : [],
        });
      }
      if (url.hostname === 'imadlab.com') {
        if (url.pathname === '/@vite/client')
          return route.fulfill({
            body: 'export function createHotContext(){return {accept(){},dispose(){},on(){},prune(){},invalidate(){}}} export const updateStyle=()=>{}; export const removeStyle=()=>{}; export const injectQuery=u=>u;',
            contentType: 'application/javascript',
          });
        return route.fulfill({
          response: await route.fetch({ url: 'http://127.0.0.1:8080' + url.pathname + url.search }),
        });
      }
      return route.fulfill({ body: '', contentType: 'application/javascript' });
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const tracked = analytics
      ? page.waitForResponse((r) => r.url().includes('/rpc/track_page_view'))
      : Promise.resolve();
    await page.goto('https://imadlab.com/');
    await page.getByRole('heading', { name: 'Research interests' }).waitFor();
    await tracked;
    assert.deepEqual(calls, analytics ? ['track_session', 'track_page_view'] : []);
    await page.evaluate(async () => {
      const consent = await import('/src/lib/consent.ts');
      consent.rejectAll();
    });
    const before = calls.length;
    await page.getByRole('link', { name: 'Projects', exact: true }).first().click();
    await page.getByRole('heading', { name: 'Projects', exact: true }).waitFor();
    assert.equal(calls.length, before, 'revocation prevents further telemetry');
    assert.ok(!calls.includes('set_page_view_duration'));
    await context.close();
  }
  console.log(
    'PASS no telemetry without consent, append-only RPCs with consent, no further writes after revocation'
  );
} finally {
  await browser.close();
}
