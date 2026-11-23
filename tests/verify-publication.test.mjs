import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyPublication } from '../scripts/verify-publication.js';

test('a new deployment waits through an old build and an unavailable Pages response', async () => {
  const responses = [new Response('100-1'), new Response('unavailable', { status: 503 }), new Response('101-1\n')];
  let waits = 0;
  await verifyPublication('101-1', {
    attempts: 3,
    fetchMarker: async (attempt) => responses[attempt - 1],
    wait: async () => { waits += 1; },
  });
  assert.equal(waits, 2);
});

test('an older successful attempt cannot satisfy a retry', async () => {
  let probes = 0;
  await assert.rejects(verifyPublication('101-2', {
    attempts: 3,
    fetchMarker: async () => {
      probes += 1;
      return new Response('101-1');
    },
    wait: async () => {},
  }), /Build 101-2 was not observed/);
  assert.equal(probes, 3);
});
