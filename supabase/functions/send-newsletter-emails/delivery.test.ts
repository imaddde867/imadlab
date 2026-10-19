import { handleRequest, queueUpdates } from './test-runtime.ts'
import './index.ts'

Deno.test('paces newsletter sends below Resend’s ten requests per second limit', async () => {
  Deno.env.set('RESEND_API_KEY', 'test-key')
  Deno.env.set('NEWSLETTER_FROM', 'imadlab <newsletter@imadlab.com>')
  Deno.env.set('SUPABASE_URL', 'https://example.supabase.co')
  const originalFetch = globalThis.fetch
  const calls: number[] = []
  queueUpdates.length = 0
  globalThis.fetch = (_input, _init) => {
    const now = performance.now()
    const recent = calls.filter(time => now - time < 1000).length
    calls.push(now)
    return Promise.resolve(recent >= 10
      ? new Response(JSON.stringify({ name: 'rate_limit_exceeded' }), { status: 429 })
      : new Response(JSON.stringify({ id: `email-${calls.length}` }), { status: 200 }))
  }
  try {
    const response = await handleRequest(new Request('https://example.com/send', { method: 'POST' }))
    const body = await response.json()
    if (body.results?.[0]?.successCount !== 12 || queueUpdates.at(-1)?.status !== 'sent') {
      throw new Error(`Expected all 12 emails accepted, got ${body.results?.[0]?.successCount}`)
    }
  } finally {
    globalThis.fetch = originalFetch
    for (const name of ['RESEND_API_KEY', 'NEWSLETTER_FROM', 'SUPABASE_URL']) Deno.env.delete(name)
  }
})

Deno.test('rejects missing sender configuration before attempting subscriber sends', async () => {
  Deno.env.set('RESEND_API_KEY', 'test-key')
  Deno.env.delete('NEWSLETTER_FROM')
  Deno.env.set('SUPABASE_URL', 'https://example.supabase.co')
  const originalFetch = globalThis.fetch
  let sends = 0
  globalThis.fetch = () => {
    sends++
    return Promise.resolve(new Response(JSON.stringify({ id: 'test-email' }), { status: 200 }))
  }
  try {
    const response = await handleRequest(new Request('https://example.com/send', { method: 'POST' }))
    const body = await response.json()
    if (response.status !== 500 || !body.error?.includes('NEWSLETTER_FROM') || sends !== 0) {
      throw new Error(`Expected configuration error before sending; got ${response.status}, ${sends} sends`)
    }
  } finally {
    globalThis.fetch = originalFetch
    for (const name of ['RESEND_API_KEY', 'SUPABASE_URL']) Deno.env.delete(name)
  }
})
