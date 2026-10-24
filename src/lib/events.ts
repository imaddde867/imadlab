import { supabase } from '@/integrations/supabase/client';
import { isAllowed, onConsentChange } from '@/lib/consent';

let controller = new AbortController();
let listening = false;

const listenForRevocation = () => {
  if (listening) return;
  listening = true;
  onConsentChange((state) => {
    if (state.analytics && isAllowed('analytics')) {
      if (controller.signal.aborted) controller = new AbortController();
      return;
    }
    // Cancel event inserts that were already in flight when consent changed.
    controller.abort();
  });
};

export async function logEvent(name: string, data: Record<string, unknown> = {}) {
  try {
    if (!isAllowed('analytics')) return;
    listenForRevocation();
    if (controller.signal.aborted) {
      if (isAllowed('analytics')) {
        controller = new AbortController();
      } else {
        return;
      }
    }
    let sessionId: string | null = null;
    try {
      sessionId = sessionStorage.getItem('analytics_session_id') || null;
    } catch {
      // Storage is optional in restricted browsing modes.
    }
    const path = typeof window !== 'undefined' ? window.location.pathname : null;
    await supabase
      .from('events')
      .insert({
        name,
        data,
        path,
        session_id: sessionId,
      } as unknown as Record<string, unknown>)
      .abortSignal(controller.signal);
  } catch {
    // Analytics must never break the page.
  }
}
