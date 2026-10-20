import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import '../supabase/functions/geolocation/index.ts';
import { handler } from './geolocation-runtime.ts';

Deno.test('geolocation denies public requests before enrichment', async () => {
  const response = await handler(
    new Request('http://localhost/geolocation', {
      method: 'POST',
      body: JSON.stringify({ session_id: 'synthetic' }),
    })
  );
  assertEquals(response.status, 401);
});

Deno.test('geolocation denies ordinary authenticated users before enrichment', async () => {
  const server = Deno.serve({ port: 0 }, () =>
    Response.json({ user: { id: 'synthetic', app_metadata: {}, user_metadata: { role: 'admin' } } })
  );
  Deno.env.set('SUPABASE_URL', `http://127.0.0.1:${(server.addr as Deno.NetAddr).port}`);
  Deno.env.set('SUPABASE_ANON_KEY', 'synthetic');
  try {
    const response = await handler(
      new Request('http://localhost/geolocation', {
        method: 'POST',
        headers: { authorization: 'Bearer synthetic' },
        body: JSON.stringify({ session_id: 'synthetic' }),
      })
    );
    assertEquals(response.status, 403);
  } finally {
    Deno.env.delete('SUPABASE_URL');
    Deno.env.delete('SUPABASE_ANON_KEY');
    await server.shutdown();
  }
});
