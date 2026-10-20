import assert from 'node:assert/strict';
import test from 'node:test';
import { selectHomeProjects } from '../src/lib/home-projects.js';

test('homepage selects at most three, featured first, newest then stable ID, filling from the archive', () => {
  const project = (id, featured, created_at = '2026-01-01T00:00:00Z') => ({
    id,
    featured,
    created_at,
  });
  const fixtures = [
    [[], []],
    [
      [project('b', false), project('a', true)],
      ['a', 'b'],
    ],
    [
      [project('d', true), project('b', true), project('c', true), project('a', true)],
      ['a', 'b', 'c'],
    ],
    [
      [project('b', false), project('a', false), project('z', false, '2026-02-01T00:00:00Z')],
      ['z', 'a', 'b'],
    ],
    [
      [project('a', true), project('b', false), project('c', false), project('d', false)],
      ['a', 'b', 'c'],
    ],
  ];
  for (const [input, expected] of fixtures) {
    const original = structuredClone(input);
    assert.deepEqual(
      selectHomeProjects(input).map((p) => p.id),
      expected
    );
    assert.deepEqual(
      selectHomeProjects([...input].reverse()).map((p) => p.id),
      expected
    );
    assert.deepEqual(input, original);
  }
});
