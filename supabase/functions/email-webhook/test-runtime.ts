export let handleRequest: (request: Request) => Promise<Response>

export function serve(handler: typeof handleRequest) {
  handleRequest = handler
}

export const updates: Record<string, unknown>[] = []

const query = {
  error: null as { message: string } | null,
  select: (_fields: string) => query,
  eq: (_field: string, _value: unknown) => query,
  not: (_field: string, _operator: string, _value: unknown) => query,
  is: (_field: string, _value: unknown) => query,
  order: (_field: string, _options: unknown) => query,
  limit: (_count: number) => query,
  maybeSingle: () => Promise.resolve({ data: { id: 'test-analytics' }, error: null }),
  update: (values: Record<string, unknown>) => {
    updates.push(values)
    return query
  },
}

export function createClient(_url: string, _key: string) {
  return { from: (_table: string) => query }
}
