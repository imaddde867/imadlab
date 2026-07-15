import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { requireAdminOrJobSecret } from './admin-auth.ts';

// Bearer-token paths run against a local mock of Supabase's
// GET /auth/v1/user endpoint, keyed by the bearer token so each test
// controls exactly what "user" comes back.
const withMockAuthServer = (
  usersByToken: Record<string, { status: number; body: unknown }>,
  fn: () => Promise<void>,
) =>
  async () => {
    const server = Deno.serve({ port: 0 }, (req) => {
      const auth = req.headers.get('authorization') ?? '';
      const token = auth.replace(/^Bearer\s+/, '');
      const match = usersByToken[token];
      if (!match) {
        return new Response(JSON.stringify({ message: 'unknown token' }), { status: 401 });
      }
      return new Response(JSON.stringify(match.body), { status: match.status });
    });
    const { port } = server.addr as { port: number };

    Deno.env.set('SUPABASE_URL', `http://127.0.0.1:${port}`);
    Deno.env.set('SUPABASE_ANON_KEY', 'test-anon-key');
    try {
      await fn();
    } finally {
      Deno.env.delete('SUPABASE_URL');
      Deno.env.delete('SUPABASE_ANON_KEY');
      await server.shutdown();
    }
  };

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

Deno.test(
  "rejects an invalid or expired bearer token",
  withMockAuthServer(
    { 'good-token': { status: 200, body: { user: { id: '1', app_metadata: {}, user_metadata: {} } } } },
    async () => {
      const req = new Request('https://example.com', {
        method: 'POST',
        headers: { authorization: 'Bearer bad-token' },
      });
      const result = await requireAdminOrJobSecret(req);

      assertEquals(result.authorized, false);
      if (!result.authorized) assertEquals(result.status, 401);
    },
  ),
);

Deno.test(
  "rejects a valid token for a non-admin user",
  withMockAuthServer(
    {
      'user-token': {
        status: 200,
        body: { user: { id: '1', app_metadata: { role: 'member' }, user_metadata: {} } },
      },
    },
    async () => {
      const req = new Request('https://example.com', {
        method: 'POST',
        headers: { authorization: 'Bearer user-token' },
      });
      const result = await requireAdminOrJobSecret(req);

      assertEquals(result.authorized, false);
      if (!result.authorized) assertEquals(result.status, 403);
    },
  ),
);

Deno.test(
  "authorizes a valid token for an admin user via app_metadata",
  withMockAuthServer(
    {
      'admin-token': {
        status: 200,
        body: { user: { id: '1', app_metadata: { role: 'admin' }, user_metadata: {} } },
      },
    },
    async () => {
      const req = new Request('https://example.com', {
        method: 'POST',
        headers: { authorization: 'Bearer admin-token' },
      });
      const result = await requireAdminOrJobSecret(req);

      assertEquals(result.authorized, true);
    },
  ),
);

Deno.test(
  "rejects a token where only user_metadata claims admin (self-editable, not trusted)",
  withMockAuthServer(
    {
      'spoofed-token': {
        status: 200,
        body: { user: { id: '1', app_metadata: {}, user_metadata: { role: 'admin' } } },
      },
    },
    async () => {
      const req = new Request('https://example.com', {
        method: 'POST',
        headers: { authorization: 'Bearer spoofed-token' },
      });
      const result = await requireAdminOrJobSecret(req);

      assertEquals(result.authorized, false);
      if (!result.authorized) assertEquals(result.status, 403);
    },
  ),
);
