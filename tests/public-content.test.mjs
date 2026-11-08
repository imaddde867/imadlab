import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  STATIC_ROUTES, buildPublicContentInventory, fetchPublicContent,
  toAbsolutePublicImageUrl
} from '../scripts/public-content.js';

const post = (i) => ({
  id: 'post-' + i,
  slug: 'article-' + i,
  title: 'Article ' + i,
  published_date: '2026-01-01T12:00:00Z',
  updated_at: '2026-01-02T12:00:00Z',
  tags: i === 1 ? ['Machine Learning', '!!!', 'machine-learning'] : [],
  body: 'Research text'
});
const project = (i, published = true) => ({
  id: 'project-' + i,
  title: 'Project ' + i,
  created_at: '2026-01-01T12:00:00Z',
  updated_at: '2026-01-02T12:00:00Z',
  tech_tags: i === 1 ? ['Machine Learning'] : [],
  published
});

function fakeClient(tables, { failTable, failOffset = 0, missingData = false } = {}) {
  const calls = [];
  return {
    calls,
    from(table) {
      const info = { table, filters: [], order: [], offset: null, size: null };
      const query = {
        select() { return query; },
        eq(field, value) { info.filters.push([field, value]); return query; },
        order(field) { info.order.push(field); return query; },
        async range(from, to) {
          info.offset = from;
          info.size = to - from + 1;
          calls.push(info);
          if (table === failTable && from === failOffset) {
            return missingData ? { data: null, error: null } :
              { data: null, error: { message: 'Simulated database outage' } };
          }
          let values = tables[table] || [];
          if (table === 'projects' && info.filters.some(([field, value]) =>
              field === 'published' && value === true)) {
            values = values.filter((p) => p.published === true);
          }
          return { data: values.slice(from, to + 1), error: null };
        }
      };
      return query;
    }
  };
}

test('more than 1,000 posts are fetched in bounded stable pages', async () => {
  const source = Array.from({ length: 1001 }, (_, i) => post(i + 1));
  const client = fakeClient({ posts: source, projects: [project(1), project(2, false)] });
  const inventory = await fetchPublicContent(client, { pageSize: 250 });
  assert.equal(inventory.posts.length, 1001);
  assert.equal(inventory.projects.length, 1);
  assert.equal(inventory.routes.length, STATIC_ROUTES.length + 1001 + 1 + 1);
  assert.deepEqual(
    client.calls.filter(({ table }) => table === 'posts').map(({ offset }) => offset),
    [0, 250, 500, 750, 1000]
  );
  assert.ok(client.calls.every(({ size }) => size <= 250));
  assert.ok(client.calls.filter(({ table }) => table === 'posts')
    .every(({ order }) => order.includes('id') && order.includes('published_date')));
  assert.ok(client.calls.filter(({ table }) => table === 'projects')
    .every(({ filters }) => filters.some(([key, value]) => key === 'published' && value === true)));
  assert.equal(inventory.tags.length, 1, 'normalized tag routes should be unique');
  assert.equal(inventory.routes.filter(({ route }) => route === '/tags/machine-learning/').length, 1);
});

test('exact page boundaries request the next empty page without dropping rows', async () => {
  const client = fakeClient({ posts: Array.from({ length: 500 }, (_, i) => post(i)), projects: [] });
  const inventory = await fetchPublicContent(client, { pageSize: 250 });
  assert.equal(inventory.posts.length, 500);
  assert.deepEqual(client.calls.filter(({ table }) => table === 'posts')
    .map(({ offset }) => offset), [0, 250, 500]);
});

test('database failures or malformed pages fail closed', async () => {
  for (const missingData of [false, true]) {
    const client = fakeClient({
      posts: Array.from({ length: 251 }, (_, i) => post(i)), projects: []
    }, { failTable: 'posts', failOffset: 250, missingData });
    await assert.rejects(fetchPublicContent(client, { pageSize: 250 }),
      /Failed to fetch posts|Invalid posts response/);
  }
  await assert.rejects(fetchPublicContent(fakeClient({ posts: [], projects: [] }),
    { pageSize: 1001 }), /pageSize/);
});

test('invalid dates, duplicate routes, unsafe slugs and missing titles fail', () => {
  assert.throws(() => buildPublicContentInventory([post(1), post(1)], []), /Duplicate public route/);
  assert.throws(() => buildPublicContentInventory([], [project(1), project(1)]),
    /Duplicate public route/);
  assert.throws(() => buildPublicContentInventory([{ ...post(1), slug: '../unsafe' }], []),
    /Unsafe or missing blog slug/);
  assert.throws(() => buildPublicContentInventory([{ ...post(1), updated_at: 'bad-date' }], []),
    /Invalid date/);
  assert.throws(() => buildPublicContentInventory([{ ...post(1), published_date: null }], []),
    /Missing date/);
  assert.throws(() => buildPublicContentInventory([{ ...post(1), title: '' }], []),
    /Missing blog title/);
  assert.throws(() => buildPublicContentInventory([], [{ ...project(1), created_at: 'bad-date' }]),
    /Invalid date/);
});

test('unpublished projects are excluded without inventing a post publication flag', () => {
  const inventory = buildPublicContentInventory([post(1)], [project(1, true), project(2, false)]);
  assert.equal(inventory.posts.length, 1);
  assert.equal(inventory.projects.length, 1);
  assert.ok(!inventory.routes.some(({ route }) => route.includes('project-2')));
  assert.ok(inventory.routes.some(({ route }) => route === '/blogs/article-1/'));
});

test('canonical sitemap image URLs agree with local and Supabase storage paths', () => {
  assert.equal(toAbsolutePublicImageUrl('public/images/photo.png'),
    'https://imadlab.com/images/photo.png');
  assert.equal(toAbsolutePublicImageUrl('/images/photo.png'),
    'https://imadlab.com/images/photo.png');
  assert.equal(toAbsolutePublicImageUrl('data:image/png;base64,AAA'), null);
  assert.equal(toAbsolutePublicImageUrl(null), null);
});
