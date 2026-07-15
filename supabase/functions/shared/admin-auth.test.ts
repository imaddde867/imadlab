import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { requireAdminOrJobSecret } from './admin-auth.ts';

// Bearer-token paths (invalid/expired token, non-admin, admin) call
// supabase.auth.getUser() and need a live Supabase instance, so they're
// not covered here.

const withJobSecret = (fn: () => Promise<void>) => async () => {
  Deno.env.set('NEWSLETTER_JOB_SECRET', 'test-secret');
  try {
    await fn();
  } finally {
    Deno.env.delete('NEWSLETTER_JOB_SECRET');
  }
};

Deno.test("rejects requests with no auth header and no job secret", async () => {
  const req = new Request('https://example.com', { method: 'POST' });
  const result = await requireAdminOrJobSecret(req);

  assertEquals(result.authorized, false);
  if (!result.authorized) assertEquals(result.status, 401);
});

Deno.test("rejects a malformed authorization header", async () => {
  const req = new Request('https://example.com', {
    method: 'POST',
    headers: { authorization: 'Basic not-a-bearer-token' },
  });
  const result = await requireAdminOrJobSecret(req);

  assertEquals(result.authorized, false);
  if (!result.authorized) assertEquals(result.status, 401);
});

Deno.test(
  "authorizes a request carrying the correct x-job-secret",
  withJobSecret(async () => {
    const req = new Request('https://example.com', {
      method: 'POST',
      headers: { 'x-job-secret': 'test-secret' },
    });
    const result = await requireAdminOrJobSecret(req);

    assertEquals(result.authorized, true);
  })
);

Deno.test(
  "rejects a request carrying the wrong x-job-secret and no bearer token",
  withJobSecret(async () => {
    const req = new Request('https://example.com', {
      method: 'POST',
      headers: { 'x-job-secret': 'wrong-secret' },
    });
    const result = await requireAdminOrJobSecret(req);

    assertEquals(result.authorized, false);
    if (!result.authorized) assertEquals(result.status, 401);
  })
);
