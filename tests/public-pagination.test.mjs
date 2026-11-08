import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fetchAllById } from '../src/lib/public-pagination.js';

const rows = (n) => Array.from({ length: n }, (_, id) => ({
  id: String(id).padStart(5, '0'),
}));

const makePage = (records, { cap = Infinity, onFirstPage, failPage = -1 } = {}) => {
  let calls = 0;
  const loadPage = async (cursor, size) => {
    const eligible = records.filter(({ id }) => cursor === null || id > cursor);
    const count = eligible.length;
    const data = eligible.slice(0, Math.min(size, cap));
    if (calls === 0) onFirstPage?.(records);
    if (calls++ === failPage) return { data: null, count, error: { message: 'unavailable' } };
    return { data, count, error: null };
  };
  const loadTotal = async () => ({ count: records.length, error: null });
  return { loadPage, loadTotal };
};

test('count-verified cursor pagination survives an API cap lower than requested range', async () => {
  const source = rows(1001);
  const result = await fetchAllById(...Object.values(makePage(source, { cap: 37 })),
    { pageSize: 250, label: 'posts' });
  assert.equal(result.length, 1001);
  assert.equal(new Set(result.map((x) => x.id)).size, 1001);
  assert.equal(result[0].id, '00000');
  assert.equal(result.at(-1).id, '01000');
});

test('empty lists and exact page boundaries are accepted', async () => {
  for (const n of [0, 250, 500]) {
    const { loadPage, loadTotal } = makePage(rows(n));
    assert.equal((await fetchAllById(loadPage, loadTotal)).length, n);
  }
});

test('deleting an earlier record midway through pagination fails the total-count check', async () => {
  const source = rows(300);
  const { loadPage, loadTotal } = makePage(source, {
    onFirstPage: (records) => { records.shift(); },
  });
  await assert.rejects(fetchAllById(loadPage, loadTotal), /count changed during pagination/);
});

test('missing counts, failed queries and duplicate cursor rows are rejected', async () => {
  const { loadPage, loadTotal } = makePage(rows(300), { failPage: 1 });
  await assert.rejects(fetchAllById(loadPage, loadTotal), /Failed to fetch/);
  await assert.rejects(fetchAllById(async () => ({
    data: [{ id: 'a' }], count: null, error: null,
  }), async () => ({ count: 1, error: null })), /exact count unavailable/);
  await assert.rejects(fetchAllById(async () => ({
    data: [{ id: 'b' }, { id: 'a' }], count: 2, error: null,
  }), async () => ({ count: 2, error: null })), /non-increasing or missing ID/);
  await assert.rejects(fetchAllById(async () => ({
    data: [], count: 2, error: null,
  }), async () => ({ count: 2, error: null })), /incomplete or oversized page/);
});
