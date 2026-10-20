import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
const user = {
  id: 'cd614e51-7734-4685-b021-d27a24b1655e',
  email: 'admin@example.test',
  app_metadata: {},
  user_metadata: {},
};
let denyWrite = false;
const projects = ['a', 'b', 'c', 'd'].map((title, i) => ({
  id: `00000000-0000-0000-0000-00000000000${i + 1}`,
  title: `Synthetic ${title}`,
  featured: false,
  created_at: `2026-01-0${i + 1}T00:00:00Z`,
  description: 'Synthetic fixture',
  full_description: 'Full fixture',
  tech_tags: [],
}));
const token = `${Buffer.from('{"alg":"HS256"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: user.id, exp: 4000000000 })).toString('base64url')}.synthetic`;
await page.addInitScript(
  ({ user, token, initialProjects }) => {
    window.__PRERENDERED_DATA__ = { projects: initialProjects };
    localStorage.setItem(
      'sb-mpkgugcasxpanhrkpkhs-auth-token',
      JSON.stringify({
        access_token: token,
        refresh_token: 'synthetic',
        expires_at: 4000000000,
        user,
      })
    );
  },
  { user, token, initialProjects: projects }
);
await page.route('https://*.supabase.co/**', async (route) => {
  const req = route.request();
  const url = new URL(req.url());
  if (url.pathname === '/auth/v1/user') return route.fulfill({ json: user });
  if (url.pathname.endsWith('/projects')) {
    if (req.method() === 'PATCH') {
      if (denyWrite)
        return route.fulfill({
          status: 403,
          json: { code: '42501', message: 'Synthetic authorization denied' },
        });
      const id = url.searchParams.get('id').replace('eq.', '');
      const item = projects.find((p) => p.id === id);
      Object.assign(item, req.postDataJSON());
      return route.fulfill({ json: item });
    }
    if (req.method() === 'POST') {
      const body = req.postDataJSON();
      const item = {
        ...(Array.isArray(body) ? body[0] : body),
        id: '00000000-0000-0000-0000-000000000005',
        created_at: '2026-02-01T00:00:00Z',
      };
      projects.push(item);
      return route.fulfill({ json: item });
    }
    const id = url.searchParams.get('id')?.replace('eq.', '');
    return route.fulfill({ json: id ? projects.find((p) => p.id === id) : projects });
  }
  return route.fulfill({ json: [] });
});
try {
  await page.goto('http://127.0.0.1:8080/');
  await page.getByRole('heading', { name: 'Research and projects' }).waitFor();
  await page.evaluate(() => {
    history.pushState({}, '', '/admin/projects');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await page.getByRole('button', { name: 'New Project' }).waitFor();
  await page.getByRole('button', { name: 'New Project' }).click();
  const featured = page.getByRole('switch', { name: 'Featured on homepage' });
  await featured.waitFor({ timeout: 5000 });
  assert.equal(await featured.getAttribute('aria-checked'), 'false');
  console.log('PASS project create flow exposes featured control');
  await page.getByPlaceholder('Enter project title').fill('Synthetic created');
  await featured.click();
  await page.getByRole('button', { name: 'Create Project', exact: true }).click();
  await page.getByRole('button', { name: 'New Project' }).waitFor();
  assert.equal(projects.at(-1).featured, true);
  await page.getByRole('heading', { name: 'Synthetic created', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Edit', exact: true }).last().click();
  await page.getByText('Loading full content…', { exact: true }).waitFor({ state: 'hidden' });
  assert.equal(await featured.getAttribute('aria-checked'), 'true');
  await page.getByPlaceholder('Enter project title').fill('Synthetic edited');
  await page.getByRole('button', { name: 'Update Project', exact: true }).click();
  await page.getByRole('button', { name: 'New Project' }).waitFor();
  assert.equal(projects.at(-1).featured, true);
  assert.equal(projects.at(-1).created_at, '2026-02-01T00:00:00Z');
  await page.getByRole('link', { name: 'Imad Eddine El Mouss', exact: true }).first().click();
  await page.getByRole('heading', { name: 'Research and projects' }).waitFor();
  await page
    .getByRole('link', { name: 'Synthetic edited', exact: true })
    .waitFor({ timeout: 5000 });
  const links = page
    .getByRole('heading', { name: 'Research and projects' })
    .locator('..')
    .getByRole('link')
    .filter({ hasText: 'Synthetic' });
  assert.deepEqual(await links.allTextContents(), [
    'Synthetic edited',
    'Synthetic d',
    'Synthetic c',
  ]);
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
      false
    );
  }
  console.log(
    'PASS create/edit preserves featured and timestamp; homepage cache refresh and responsive rendering'
  );
  for (const path of [
    '/admin',
    '/admin/posts',
    '/admin/projects',
    '/admin/emails',
    '/admin/analytics',
  ]) {
    user.id = '00000000-0000-0000-0000-000000000099';
    user.user_metadata = { role: 'admin' };
    await page.goto('http://127.0.0.1:8080' + path);
    await page
      .getByRole('alert')
      .filter({ hasText: 'Administrator access required' })
      .waitFor({ timeout: 5000 });
  }
  console.log('PASS ordinary authenticated user cannot open any admin route');
  user.id = 'cd614e51-7734-4685-b021-d27a24b1655e';
  await page.goto('http://127.0.0.1:8080/admin/projects');
  await page.getByRole('heading', { name: 'Synthetic edited', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Edit', exact: true }).last().click();
  await page.getByText('Loading full content…', { exact: true }).waitFor({ state: 'hidden' });
  denyWrite = true;
  await page.getByPlaceholder('Enter project title').fill('Denied edit');
  await page.getByRole('button', { name: 'Update Project', exact: true }).click();
  await page.getByText('Synthetic authorization denied', { exact: true }).waitFor();
  assert.equal(projects.at(-1).title, 'Synthetic edited');
  console.log('PASS denied saves display an authorization error and preserve content');
} finally {
  await browser.close();
}
