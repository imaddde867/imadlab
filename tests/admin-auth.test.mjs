import assert from 'node:assert/strict';
import test from 'node:test';
import { isAdmin } from '../src/lib/admin-auth.ts';

test('admin authorization ignores self-assigned metadata and accepts server-controlled authorization', () => {
  assert.equal(isAdmin(null), false);
  assert.equal(
    isAdmin({ id: 'ordinary', app_metadata: {}, user_metadata: { role: 'admin' } }),
    false
  );
  assert.equal(isAdmin({ id: 'ordinary', app_metadata: {} }), false);
  assert.equal(isAdmin({ id: 'admin', app_metadata: { role: 'admin' } }), true);
  assert.equal(isAdmin({ id: 'cd614e51-7734-4685-b021-d27a24b1655e', app_metadata: {} }), true);
});
