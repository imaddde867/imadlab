import assert from 'node:assert/strict';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const BASE_URL = 'https://imadlab.com';
const LOCAL_URL = 'http://127.0.0.1:8080';

// All requests are intercepted. In particular, no test may reach the live website
// or write to the real analytics backend.
async function fixture(initialConsent = null, options = {}) {
  const context = await browser.newContext();
  const calls = [];
  const eventWrites = [];
  const beaconRequests = [];
  let beaconLoads = 0;
  let releaseSession;
  let sessionStarted;
  const sessionStartedPromise = new Promise((resolve) => {
    sessionStarted = resolve;
  });

  if (initialConsent) {
    // Seed the initial cookie exactly once. An addInitScript would reapply the
    // original opt-in after withdrawal and silently invalidate the reload test.
    await context.addCookies([
      {
        name: 'imadlab_consent',
        value: encodeURIComponent(
          JSON.stringify({
            version: 1,
            timestamp: Date.now(),
            essential: true,
            marketing: false,
            ...initialConsent,
          })
        ),
        domain: 'imadlab.com',
        path: '/',
        sameSite: 'Lax',
        expires: Math.floor(Date.now() / 1000) + 86400,
      },
    ]);
  }

  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === 'imadlab.com') {
      if (url.pathname === '/@vite/client') {
        return route.fulfill({
          contentType: 'application/javascript',
          body: 'export function createHotContext(){return {accept(){},dispose(){},on(){},prune(){},invalidate(){}}} export const updateStyle=()=>{}; export const removeStyle=()=>{}; export const injectQuery=u=>u;',
        });
      }
      return route.fulfill({
        response: await route.fetch({
          url: LOCAL_URL + url.pathname + url.search,
        }),
      });
    }
    if (url.hostname.endsWith('.supabase.co')) {
      if (url.pathname.includes('/rpc/')) {
        const rpc = url.pathname.split('/').at(-1);
        calls.push(rpc);
        if (rpc === 'track_session') {
          sessionStarted();
          if (options.holdSession) {
            await new Promise((resolve) => {
              releaseSession = resolve;
            });
          }
        }
        return route.fulfill({
          json: rpc === 'track_page_view' ? '00000000-0000-0000-0000-000000000001' : null,
        });
      }
      if (url.pathname.includes('/rest/v1/events')) {
        eventWrites.push(route.request().postDataJSON());
        return route.fulfill({ status: 201, json: null });
      }
      // Content reads must look like Supabase REST responses. Returning null
      // makes list pages fail before the consent assertions run.
      return route.fulfill({ json: [] });
    }
    if (url.hostname === 'static.cloudflareinsights.com' && url.pathname === '/beacon.min.js') {
      beaconLoads++;
      // A deliberately active SPA beacon: deleting its <script> cannot undo the
      // already-installed History API interception; a document reload can.
      return route.fulfill({
        contentType: 'application/javascript',
        body: `
        window.__fakeBeaconReady = true;
        const previousPushState = history.pushState;
        history.pushState = function (...args) {
          const result = previousPushState.apply(this, args);
          fetch('https://cloudflareinsights.com/cdn-cgi/rum', {method: 'POST', body: 'test'});
          return result;
        };
      `,
      });
    }
    if (url.hostname === 'cloudflareinsights.com' && url.pathname === '/cdn-cgi/rum') {
      beaconRequests.push(url.pathname);
      return route.fulfill({ status: 204, body: '' });
    }
    // Block every other external request, including fonts and third-party scripts.
    return route.fulfill({ status: 204, body: '' });
  });

  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  return {
    page,
    calls,
    eventWrites,
    beaconRequests,
    sessionStartedPromise,
    releaseSession: () => releaseSession?.(),
    beaconLoads: () => beaconLoads,
    close: () => context.close(),
  };
}

const storedConsent = (page) =>
  page.evaluate(() => {
    const raw = localStorage.getItem('imadlab_consent');
    return raw ? JSON.parse(decodeURIComponent(raw)) : null;
  });

try {
  // No consent -> no telemetry. Clicking the actual UI enables a session and a
  // page view, in that order, without accidentally enabling marketing.
  {
    const f = await fixture();
    try {
      await f.page.goto(BASE_URL);
      await f.page.getByRole('heading', { name: 'Research interests' }).waitFor();
      assert.deepEqual(f.calls, []);
      await f.page.getByRole('button', { name: 'Privacy choices' }).click();
      const disclosure = await f.page.getByRole('dialog').innerText();
      assert.match(disclosure, /session ID/i);
      assert.match(disclosure, /searches/i);
      assert.match(disclosure, /approximate location/i);
      const pageView = f.page.waitForResponse((r) => r.url().includes('/rpc/track_page_view'));
      await f.page.getByRole('button', { name: 'Allow analytics' }).click();
      await pageView;
      assert.deepEqual(f.calls.slice(0, 2), ['track_session', 'track_page_view']);
      const consent = await storedConsent(f.page);
      assert.equal(consent.analytics, true);
      assert.equal(consent.marketing, false);
      assert.equal(consent.functional, false);

      // Interaction events are also consent-gated analytics data.
      await f.page.goto(`${BASE_URL}/search`);
      const eventWrite = f.page.waitForResponse(
        (r) => r.url().includes('/rest/v1/events') && r.request().method() === 'POST'
      );
      await f.page.getByRole('textbox', { name: 'Search posts and projects' }).fill('ai');
      await eventWrite;
      assert.equal(f.eventWrites.at(-1)?.name, 'search_query');
      assert.equal(f.eventWrites.at(-1)?.data?.q, 'ai');
    } finally {
      await f.close();
    }
  }

  // Withdrawal must shut down an already-executed SPA beacon, not merely remove
  // its script node. The reload clears the beacon's History API patch.
  {
    const f = await fixture({ analytics: true, functional: true });
    try {
      await f.page.goto(BASE_URL);
      await f.page.waitForFunction(() => window.__fakeBeaconReady === true);
      const beaconResponse = f.page.waitForResponse((r) => r.url().includes('/cdn-cgi/rum'));
      await f.page.getByRole('link', { name: 'Projects', exact: true }).first().click();
      await beaconResponse;
      await f.page.getByRole('heading', { name: 'Projects', exact: true }).waitFor();
      assert.ok(f.beaconRequests.length > 0, 'beacon active before withdrawal');
      const oldSessionId = await f.page.evaluate(() =>
        sessionStorage.getItem('analytics_session_id')
      );
      assert.ok(oldSessionId, 'analytics session ID exists before withdrawal');
      await f.page.getByRole('button', { name: 'Cookie settings' }).click();
      await Promise.all([
        f.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        f.page.getByRole('button', { name: 'Essential only' }).click(),
      ]);
      await f.page.getByRole('heading', { name: 'Projects', exact: true }).waitFor();
      assert.equal(await f.page.evaluate(() => !!window.__fakeBeaconReady), false);
      assert.equal(
        await f.page.evaluate(() => sessionStorage.getItem('analytics_session_id')),
        null,
        'revocation clears the analytics session ID'
      );
      const before = f.beaconRequests.length;
      const beforeSupabase = f.calls.length;
      await f.page.getByRole('link', { name: 'Imad Eddine El Mouss', exact: true }).first().click();
      await f.page.getByRole('heading', { name: 'Research interests' }).waitFor();
      await f.page.waitForTimeout(50);
      assert.equal(f.beaconRequests.length, before, 'no beacon requests after withdrawal');
      assert.equal(f.calls.length, beforeSupabase, 'no Supabase requests after withdrawal');
      assert.equal((await storedConsent(f.page)).functional, false);

      // Event inserts must stop too, even after navigating to an interactive page.
      const beforeEvents = f.eventWrites.length;
      await f.page.goto(`${BASE_URL}/search`);
      await f.page
        .getByRole('textbox', { name: 'Search posts and projects' })
        .fill('private query');
      await f.page.waitForTimeout(500);
      assert.equal(f.eventWrites.length, beforeEvents, 'no event writes after withdrawal');

      // A later opt-in must restart both pipelines with a fresh session ID.
      await f.page.getByRole('button', { name: 'Cookie settings' }).click();
      const pageViewAfterOptIn = f.page.waitForResponse((r) =>
        r.url().includes('/rpc/track_page_view')
      );
      await f.page.getByRole('button', { name: 'Allow analytics' }).click();
      await pageViewAfterOptIn;
      await f.page.waitForFunction(() => window.__fakeBeaconReady === true);
      const newSessionId = await f.page.evaluate(() =>
        sessionStorage.getItem('analytics_session_id')
      );
      assert.ok(newSessionId, 're-opt-in creates a session ID');
      assert.notEqual(newSessionId, oldSessionId, 're-opt-in does not reuse the withdrawn session');
      const beaconAfterOptIn = f.page.waitForResponse((r) => r.url().includes('/cdn-cgi/rum'));
      await f.page.getByRole('link', { name: 'Projects', exact: true }).first().click();
      await beaconAfterOptIn;
      await f.page.getByRole('heading', { name: 'Projects', exact: true }).waitFor();
      assert.ok(f.beaconRequests.length > before, 'beacon resumes after re-opt-in');
      assert.ok(f.calls.length > beforeSupabase, 'Supabase resumes after re-opt-in');
    } finally {
      await f.close();
    }
  }

  // Legacy functional=false must survive a new analytics opt-in, and rejection
  // must disable optional categories even for a legacy functional=true visitor.
  {
    const f = await fixture({ analytics: false, functional: false });
    try {
      await f.page.goto(BASE_URL);
      await f.page.getByRole('button', { name: 'Cookie settings' }).click();
      await f.page.getByRole('button', { name: 'Allow analytics' }).click();
      assert.equal((await storedConsent(f.page)).functional, false);
    } finally {
      await f.close();
    }
  }

  // A legacy functional=true preference must survive analytics opt-in.
  {
    const f = await fixture({ analytics: false, functional: true });
    try {
      await f.page.goto(BASE_URL);
      await f.page.getByRole('button', { name: 'Cookie settings' }).click();
      await f.page.getByRole('button', { name: 'Allow analytics' }).click();
      const consent = await storedConsent(f.page);
      assert.equal(consent.analytics, true);
      assert.equal(consent.functional, true, 'functional preference preserved on opt-in');
      assert.equal(consent.marketing, false);
    } finally {
      await f.close();
    }
  }

  // Withdrawal in one tab must stop telemetry in every open tab.
  {
    const f = await fixture({ analytics: true, functional: true });
    try {
      const other = await f.page.context().newPage();
      other.setDefaultTimeout(10000);
      await f.page.goto(BASE_URL);
      await other.goto(BASE_URL);
      await f.page.waitForFunction(() => window.__fakeBeaconReady === true);
      await other.waitForFunction(() => window.__fakeBeaconReady === true);
      await f.page.waitForTimeout(100);
      const beforeCalls = f.calls.length;
      const beforeBeacon = f.beaconRequests.length;
      await other.getByRole('button', { name: 'Cookie settings' }).click();
      const otherNavigation = other.waitForNavigation({ waitUntil: 'domcontentloaded' });
      const firstNavigation = f.page.waitForNavigation({ waitUntil: 'domcontentloaded' });
      await other.getByRole('button', { name: 'Essential only' }).click();
      await Promise.all([otherNavigation, firstNavigation]);
      await f.page.getByRole('heading', { name: 'Research interests' }).waitFor();
      assert.equal(await f.page.evaluate(() => !!window.__fakeBeaconReady), false);
      assert.equal((await storedConsent(f.page)).analytics, false);
      await f.page.getByRole('link', { name: 'Projects', exact: true }).first().click();
      await f.page.getByRole('heading', { name: 'Projects', exact: true }).waitFor();
      await f.page.waitForTimeout(50);
      assert.equal(f.beaconRequests.length, beforeBeacon, 'cross-tab withdrawal stops beacon');
      assert.equal(f.calls.length, beforeCalls, 'cross-tab withdrawal stops Supabase');
    } finally {
      await f.close();
    }
  }

  // First-time 'Essential only' persists with every optional category off.
  {
    const f = await fixture();
    try {
      await f.page.goto(BASE_URL);
      await f.page.getByRole('button', { name: 'Privacy choices' }).click();
      await f.page.getByRole('button', { name: 'Essential only' }).click();
      const consent = await storedConsent(f.page);
      assert.equal(consent.analytics, false);
      assert.equal(consent.functional, false);
      assert.equal(consent.marketing, false);
      await f.page.reload();
      await f.page.getByRole('heading', { name: 'Research interests' }).waitFor();
      assert.equal(await f.page.getByRole('button', { name: 'Privacy choices' }).count(), 0);
      assert.equal((await storedConsent(f.page)).analytics, false);
    } finally {
      await f.close();
    }
  }

  // A delayed session registration must not produce a page-view write once
  // permission is withdrawn, even if the pending network response later returns.
  {
    const f = await fixture(null, { holdSession: true });
    try {
      await f.page.goto(BASE_URL);
      await f.page.getByRole('button', { name: 'Privacy choices' }).click();
      await f.page.getByRole('button', { name: 'Allow analytics' }).click();
      await f.sessionStartedPromise;
      await f.page.getByRole('button', { name: 'Cookie settings' }).click();
      await Promise.all([
        f.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        f.page.getByRole('button', { name: 'Essential only' }).click(),
      ]);
      f.releaseSession();
      await f.page.getByRole('heading', { name: 'Research interests' }).waitFor();
      assert.ok(!f.calls.includes('track_page_view'), 'no page view after abort');
    } finally {
      f.releaseSession();
      await f.close();
    }
  }

  // Expired localStorage fallback must not revive analytics after the cookie expires.
  {
    const f = await fixture();
    try {
      await f.page.addInitScript(() => {
        localStorage.setItem(
          'imadlab_consent',
          encodeURIComponent(
            JSON.stringify({
              version: 1,
              timestamp: Date.now() - 181 * 86400000,
              essential: true,
              analytics: true,
              marketing: false,
              functional: true,
            })
          )
        );
      });
      await f.page.goto(BASE_URL);
      await f.page.getByRole('heading', { name: 'Research interests' }).waitFor();
      assert.deepEqual(f.calls, [], 'expired decision must not enable tracking');
      await f.page.getByRole('button', { name: 'Privacy choices' }).waitFor();
    } finally {
      await f.close();
    }
  }

  console.log('PASS consent UI, opt-in, withdrawal, preferences, expiry and races');
} finally {
  await browser.close();
}
