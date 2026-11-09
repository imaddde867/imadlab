import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  STATIC_ROUTES, buildPublicContentInventory, fetchPublicContent, toAbsolutePublicImageUrl,
} from '../scripts/public-content.js';

const post = (i) => ({
  id: 'post-' + String(i).padStart(6, '0'),
  slug: 'article-' + i,
  title: 'Article ' + i,
  published_date: '2026-01-01T12:00:00Z',
  updated_at: '2026-01-02T12:00:00Z',
  tags: i === 1 ? ['Machine Learning', '!!!', 'machine-learning'] : [],
  body: 'Research text',
});
const project = (i, published = true) => ({
  id: 'project-' + String(i).padStart(6, '0'),
  title: 'Project ' + i,
  created_at: '2026-01-01T12:00:00Z',
  updated_at: '2026-01-02T12:00:00Z',
  tech_tags: i === 1 ? ['Machine Learning'] : [],
  published,
});
function fakeClient(tables, { cap = Infinity, failTable, failPage = 1, missingData = false,
  mutateAfterFirstPage = false } = {}) {
  const calls = [];
  const pageNumbers = { posts: 0, projects: 0 };
  const from = (table) => {
    const filters = [];
    let head = false;
    const matches = () => (tables[table] || []).filter((row) =>
      filters.every(([field, operator, value]) =>
        operator === 'eq' ? row[field] === value : String(row[field]) > String(value))
    ).sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const query = {
      select(_fields, options = {}) { head = Boolean(options.head); return query; },
      eq(field, value) { filters.push([field, 'eq', value]); return query; },
      gt(field, value) { filters.push([field, 'gt', value]); return query; },
      order() { return query; },
      then(resolve, reject) {
        return Promise.resolve({ data: head ? null : matches(), count: matches().length, error: null })
          .then(resolve, reject);
      },
      async range(start, end) {
        const index = pageNumbers[table]++;
        const filtered = matches();
        calls.push({ table, cursor: filters.find(([f, op]) => f === 'id' && op === 'gt')?.[2] ?? null,
          count: filtered.length, limit: end - start + 1, filters: [...filters] });
        if (table === failTable && index === failPage) {
          return missingData ? { data: null, error: null, count: filtered.length } :
            { data: null, error: { message: 'Simulated database outage' }, count: null };
        }
        const data = filtered.slice(start, start + Math.min(cap, end - start + 1));
        if (mutateAfterFirstPage && table === 'posts' && index === 0) tables.posts.shift();
        return { data, count: filtered.length, error: null };
      },
    };
    return query;
  };
  return { calls, from };
}

test('1,001 posts and 250-row boundaries paginate without omissions', async () => {
  const posts = Array.from({ length: 1001 }, (_, i) => post(i + 1));
  const client = fakeClient({ posts, projects: [project(1), project(2, false)] });
  const inv = await fetchPublicContent(client, { pageSize: 250 });
  assert.equal(inv.posts.length, 1001);
  assert.equal(new Set(inv.posts.map((p) => p.id)).size, 1001);
  assert.equal(inv.projects.length, 1);
  assert.equal(inv.routes.length, STATIC_ROUTES.length + 1001 + 1 + 1);
  assert.deepEqual(client.calls.filter(({ table }) => table === 'posts').map(({ count }) => count),
    [1001, 751, 501, 251, 1]);
  assert.ok(client.calls.every(({ limit }) => limit === 250));
  assert.ok(client.calls.filter(({ table }) => table === 'projects')
    .every(({ filters }) => filters.some(([key, op, value]) =>
      key === 'published' && op === 'eq' && value === true)));
  assert.equal(inv.tags.length, 1);
  assert.equal(inv.routes.filter(({ route }) => route === '/tags/machine-learning/').length, 1);
});

test('exact page boundaries end after the final counted page', async () => {
  const client = fakeClient({ posts: Array.from({ length: 500 }, (_, i) => post(i)), projects: [] });
  assert.equal((await fetchPublicContent(client, { pageSize: 250 })).posts.length, 500);
  assert.deepEqual(client.calls.filter(({ table }) => table === 'posts').map(({ count }) => count),
    [500, 250]);
});

test('server cap below requested page size cannot truncate the public inventory', async () => {
  const client = fakeClient({
    posts: Array.from({ length: 401 }, (_, i) => post(i)), projects: [project(1)],
  }, { cap: 37 });
  const inv = await fetchPublicContent(client, { pageSize: 250 });
  assert.equal(inv.posts.length, 401);
  assert.equal(client.calls.filter(({ table }) => table === 'posts').length, 11);
  assert.ok(client.calls.some(({ table, count }) => table === 'posts' && count === 364));
});

test('query failures, malformed responses, invalid page sizes and changes fail closed', async () => {
  for (const missingData of [false, true]) {
    const client = fakeClient({ posts: Array.from({ length: 251 }, (_, i) => post(i)), projects: [] },
      { failTable: 'posts', failPage: 1, missingData });
    await assert.rejects(fetchPublicContent(client, { pageSize: 250 }),
      /Failed to fetch posts|Invalid posts response/);
  }
  await assert.rejects(fetchPublicContent(fakeClient({ posts: [], projects: [] }),
    { pageSize: 1001 }), /pageSize/);
  const source = { posts: Array.from({ length: 300 }, (_, i) => post(i)), projects: [] };
  await assert.rejects(fetchPublicContent(fakeClient(source, { mutateAfterFirstPage: true }),
    { pageSize: 250 }), /count changed during pagination/);
});

test('invalid dates, duplicate routes, unsafe slugs and missing titles fail', () => {
  assert.throws(() => buildPublicContentInventory([post(1), post(1)], []), /Duplicate public route/);
  assert.throws(() => buildPublicContentInventory([], [project(1), project(1)]), /Duplicate public route/);
  assert.throws(() => buildPublicContentInventory([{ ...post(1), slug: '../unsafe' }], []), /Unsafe/);
  assert.throws(() => buildPublicContentInventory([{ ...post(1), updated_at: 'bad-date' }], []),
    /Invalid date/);
  assert.throws(() => buildPublicContentInventory([{ ...post(1), published_date: null }], []),
    /Missing date/);
  assert.throws(() => buildPublicContentInventory([{ ...post(1), title: '' }], []), /Missing blog title/);
  assert.throws(() => buildPublicContentInventory([], [{ ...project(1), created_at: 'bad-date' }]),
    /Invalid date/);
});
test('unpublished projects excluded, posts unchanged and image URLs normalized', () => {
  const inv = buildPublicContentInventory([post(1)], [project(1), project(2, false)]);
  assert.equal(inv.posts.length, 1);
  assert.equal(inv.projects.length, 1);
  assert.equal(toAbsolutePublicImageUrl('public/images/photo.png'), 'https://imadlab.com/images/photo.png');
  assert.equal(toAbsolutePublicImageUrl('data:image/png;base64,AAA'), null);
});
