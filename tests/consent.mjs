import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  console.log('Testing consent transitions...\n');

  // Test 1: Initial opt-in
  console.log('Test 1: Initial opt-in from no consent');
  const context1 = await browser.newContext();
  const calls1 = [];
  await context1.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname.endsWith('.supabase.co')) {
      if (url.pathname.includes('/rpc/')) calls1.push(url.pathname.split('/').at(-1));
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
  const page1 = await context1.newPage();
  page1.setDefaultTimeout(10000);
  await page1.goto('https://imadlab.com/');
  await page1.getByRole('heading', { name: 'Research interests' }).waitFor();
  assert.deepEqual(calls1, [], 'no telemetry without initial consent');
  // Simulate user accepting analytics
  await page1.evaluate(async () => {
    const consent = await import('/src/lib/consent.ts');
    consent.acceptAll();
  });
  await page1.waitForTimeout(200); // Wait for consent change to propagate
  const before1 = calls1.length;
  await page1.getByRole('link', { name: 'Projects', exact: true }).first().click();
  await page1.getByRole('heading', { name: 'Projects', exact: true }).waitFor();
  assert.ok(calls1.length > before1, 'telemetry starts after opt-in');
  assert.ok(calls1.includes('track_session'));
  assert.ok(calls1.includes('track_page_view'));
  await context1.close();
  console.log('✓ Initial opt-in works correctly\n');

  // Test 2: Withdrawal (script removal)
  console.log('Test 2: Withdrawal removes analytics script');
  const context2 = await browser.newContext();
  await context2.addInitScript(() => {
    localStorage.setItem(
      'imadlab_consent',
      encodeURIComponent(
        JSON.stringify({
          version: 1,
          timestamp: Date.now(),
          essential: true,
          analytics: true,
          marketing: false,
          functional: true,
        })
      )
    );
  });
  const calls2 = [];
  await context2.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname.endsWith('.supabase.co')) {
      if (url.pathname.includes('/rpc/')) calls2.push(url.pathname.split('/').at(-1));
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
  const page2 = await context2.newPage();
  page2.setDefaultTimeout(10000);
  await page2.goto('https://imadlab.com/');
  await page2.getByRole('heading', { name: 'Research interests' }).waitFor();
  assert.ok(calls2.includes('track_session'), 'session tracked with consent');
  // Check for Cloudflare Analytics script
  const hasBeaconBefore = await page2.evaluate(() => {
    return document.querySelector('script[src*="cloudflareinsights.com"]') !== null;
  });
  assert.ok(hasBeaconBefore, 'Cloudflare Analytics script loaded with consent');
  // Revoke consent
  await page2.evaluate(async () => {
    const consent = await import('/src/lib/consent.ts');
    consent.rejectAll();
  });
  await page2.waitForTimeout(200);
  const hasBeaconAfter = await page2.evaluate(() => {
    return document.querySelector('script[src*="cloudflareinsights.com"]') !== null;
  });
  assert.ok(!hasBeaconAfter, 'Cloudflare Analytics script removed after withdrawal');
  const before2 = calls2.length;
  await page2.getByRole('link', { name: 'Projects', exact: true }).first().click();
  await page2.getByRole('heading', { name: 'Projects', exact: true }).waitFor();
  assert.equal(calls2.length, before2, 'no further telemetry after withdrawal');
  await context2.close();
  console.log('✓ Withdrawal removes script and stops telemetry\n');

  // Test 3: Preference changes preserve functional
  console.log('Test 3: Preference changes preserve functional consent');
  const context3 = await browser.newContext();
  await context3.addInitScript(() => {
    localStorage.setItem(
      'imadlab_consent',
      encodeURIComponent(
        JSON.stringify({
          version: 1,
          timestamp: Date.now(),
          essential: true,
          analytics: false,
          marketing: false,
          functional: true,
        })
      )
    );
  });
  const page3 = await context3.newPage();
  page3.setDefaultTimeout(10000);
  await page3.goto('https://imadlab.com/');
  // Reject all (should preserve functional)
  await page3.evaluate(async () => {
    const consent = await import('/src/lib/consent.ts');
    consent.rejectAll();
  });
  const consentAfter = await page3.evaluate(() => {
    const raw = localStorage.getItem('imadlab_consent');
    return raw ? JSON.parse(decodeURIComponent(raw)) : null;
  });
  assert.ok(consentAfter, 'consent state exists');
  assert.ok(consentAfter.functional, 'functional preference preserved after rejectAll');
  await context3.close();
  console.log('✓ Functional preferences preserved\n');

  // Test 4: Persistence across page loads
  console.log('Test 4: Consent persists across page loads');
  const context4 = await browser.newContext();
  const page4 = await context4.newPage();
  page4.setDefaultTimeout(10000);
  await page4.goto('https://imadlab.com/');
  // Set consent
  await page4.evaluate(async () => {
    const consent = await import('/src/lib/consent.ts');
    consent.setConsent({ analytics: true, marketing: false, functional: true });
  });
  await page4.waitForTimeout(100);
  // Reload page
  await page4.reload();
  await page4.getByRole('heading', { name: 'Research interests' }).waitFor();
  const consentAfterReload = await page4.evaluate(() => {
    const raw = localStorage.getItem('imadlab_consent');
    return raw ? JSON.parse(decodeURIComponent(raw)) : null;
  });
  assert.ok(consentAfterReload, 'consent persists after reload');
  assert.ok(consentAfterReload.analytics, 'analytics consent persists');
  await context4.close();
  console.log('✓ Consent persists across page loads\n');

  console.log('PASS all consent transition tests');
} finally {
  await browser.close();
}
