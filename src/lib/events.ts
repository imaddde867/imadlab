import { supabase } from '@/integrations/supabase/client';
import { isAllowed } from '@/lib/consent';

export async function logEvent(name: string, data: Record<string, unknown> = {}) {
  try {
    if (!isAllowed('analytics')) return;
    const sessionId = sessionStorage.getItem('analytics_session_id') || null;
    const path = typeof window !== 'undefined' ? window.location.pathname : null;
    await supabase.from('events').insert({
      name,
      data,
      path,
      session_id: sessionId,
    } as unknown as Record<string, unknown>);
  } catch {
    // ignore
  }
}
