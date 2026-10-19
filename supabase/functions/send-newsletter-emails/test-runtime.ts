export let handleRequest: (request: Request) => Promise<Response>
export const queueUpdates: Record<string, unknown>[] = []

export function serve(handler: typeof handleRequest) {
  handleRequest = handler
}

export function requireAdminOrJobSecret(_request: Request) {
  return Promise.resolve({ authorized: true as const })
}

export function createClient(_url: string, _key: string) {
  return {
    from(table: string) {
      const data = table === 'email_queue'
        ? [{ id: 'test-queue', content_type: 'blog_post', content_id: 'test-post', retry_count: 0 }]
        : table === 'newsletter_subscribers'
        ? Array.from({ length: 12 }, (_, i) => ({
          id: `subscriber-${i}`, email: `reader-${i}@test.invalid`, status: 'active', unsubscribe_token: `token-${i}`,
        }))
        : table === 'posts'
        ? { id: 'test-post', title: 'Test post', slug: 'test-post', created_at: '2026-10-13' }
        : []
      const result = { data, error: null }
      const query = {
        select: (_fields: string) => query,
        eq: (_field: string, _value: unknown) => query,
        lt: (_field: string, _value: unknown) => query,
        in: (_field: string, _values: unknown[]) => query,
        or: (_expression: string) => query,
        order: (_field: string, _options: unknown) => query,
        limit: (_count: number) => query,
        single: () => Promise.resolve(result),
        insert: (_values: unknown) => query,
        update: (values: Record<string, unknown>) => {
          if (table === 'email_queue') queueUpdates.push(values)
          return query
        },
        then: (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve),
      }
      return query
    },
  }
}
