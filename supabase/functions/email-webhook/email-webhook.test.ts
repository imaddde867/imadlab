import { handleRequest, updates } from './test-runtime.ts'
import './index.ts'

// Import map replaces only the server and database boundaries; the real handler runs.
const secretBytes = new TextEncoder().encode('test-webhook-signing-key')
const secret = `whsec_${btoa(String.fromCharCode(...secretBytes))}`
const webhookId = 'msg_test_delivery'
const eventTime = '2026-10-13T00:00:00.000Z'
const payload = JSON.stringify({
  type: 'email.delivered',
  created_at: eventTime,
  data: { email_id: 'test-email', to: ['reader@example.com'] },
})

async function signedRequest(timestamp = String(Math.floor(Date.now() / 1000))) {
  const key = await crypto.subtle.importKey(
    'raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const digest = await crypto.subtle.sign(
    'HMAC', key, new TextEncoder().encode(`${webhookId}.${timestamp}.${payload}`)
  )
  return new Request('https://example.com/email-webhook', {
    method: 'POST',
    headers: {
      'svix-id': webhookId,
      'svix-timestamp': timestamp,
      'svix-signature': `v1,${btoa(String.fromCharCode(...new Uint8Array(digest)))}`,
    },
    body: payload,
  })
}

Deno.test('accepts a Resend-signed delivery webhook and records delivery', async () => {
  Deno.env.set('RESEND_WEBHOOK_SECRET', secret)
  updates.length = 0
  try {
    const response = await handleRequest(await signedRequest())
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}: ${await response.text()}`)
    }
    if (updates.length !== 1 || updates[0].delivered_at !== eventTime) {
      throw new Error('Delivery timestamp was not recorded')
    }
  } finally {
    Deno.env.delete('RESEND_WEBHOOK_SECRET')
  }
})

for (const [name, alter, expectedStatus] of [
  ['tampered body', (request: Request) => new Request(request, { body: `${payload} ` }), 401],
  ['tampered message ID', (request: Request) => {
    request.headers.set('svix-id', 'msg_other')
    return request
  }, 401],
  ['missing message ID', (request: Request) => {
    request.headers.delete('svix-id')
    return request
  }, 400],
  ['invalid timestamp', (request: Request) => {
    request.headers.set('svix-timestamp', 'not-a-number')
    return request
  }, 401],
] as const) {
  Deno.test(`rejects webhook with ${name}`, async () => {
    Deno.env.set('RESEND_WEBHOOK_SECRET', secret)
    updates.length = 0
    try {
      const response = await handleRequest(alter(await signedRequest()))
      if (response.status !== expectedStatus || updates.length !== 0) {
        throw new Error(`Expected ${expectedStatus} and no database writes, got ${response.status}`)
      }
    } finally {
      Deno.env.delete('RESEND_WEBHOOK_SECRET')
    }
  })
}

Deno.test('rejects a correctly signed but expired webhook', async () => {
  Deno.env.set('RESEND_WEBHOOK_SECRET', secret)
  updates.length = 0
  try {
    const timestamp = String(Math.floor(Date.now() / 1000) - 301)
    const response = await handleRequest(await signedRequest(timestamp))
    if (response.status !== 401 || updates.length !== 0) {
      throw new Error(`Expected 401 and no database writes, got ${response.status}`)
    }
  } finally {
    Deno.env.delete('RESEND_WEBHOOK_SECRET')
  }
})

Deno.test('accepts a matching signature during signing-key rotation', async () => {
  Deno.env.set('RESEND_WEBHOOK_SECRET', secret)
  updates.length = 0
  try {
    const request = await signedRequest()
    request.headers.set('svix-signature', `v1,${btoa('other-signature')} ${request.headers.get('svix-signature')}`)
    const response = await handleRequest(request)
    if (response.status !== 200 || updates.length !== 1) {
      throw new Error(`Expected 200 and one database write, got ${response.status}`)
    }
  } finally {
    Deno.env.delete('RESEND_WEBHOOK_SECRET')
  }
})
