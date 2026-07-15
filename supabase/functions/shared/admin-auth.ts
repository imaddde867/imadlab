import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export type AuthResult =
  | { authorized: true }
  | { authorized: false; status: 401 | 403; message: string }

export async function requireAdminOrJobSecret(req: Request): Promise<AuthResult> {
  const jobSecret = Deno.env.get('NEWSLETTER_JOB_SECRET')
  if (jobSecret && req.headers.get('x-job-secret') === jobSecret) {
    return { authorized: true }
  }

  const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { authorized: false, status: 401, message: 'Missing authorization' }
  }

  const jwt = authHeader.slice(7)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await supabase.auth.getUser(jwt)
  if (error || !data.user) {
    return { authorized: false, status: 401, message: 'Invalid or expired token' }
  }

  const appMeta = data.user.app_metadata as Record<string, unknown>
  const isAdmin = appMeta?.role === 'admin'
  if (!isAdmin) {
    return { authorized: false, status: 403, message: 'Admin access required' }
  }

  return { authorized: true }
}
