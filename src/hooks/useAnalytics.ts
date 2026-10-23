import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isAllowed, onConsentChange } from '@/lib/consent';
import { logger } from '@/lib/logger';
import { getAnalyticsMetadata, extractUTMParams, getTrafficSource } from '@/lib/analytics-utils';

const ANALYTICS_SESSION_KEY = 'analytics_session_id';

const clearAnalyticsSession = () => {
  try {
    sessionStorage.removeItem(ANALYTICS_SESSION_KEY);
  } catch {
    // Storage is optional in restricted browsing modes.
  }
};

const generateSessionId = (): string => {
  try {
    const stored = sessionStorage.getItem(ANALYTICS_SESSION_KEY);
    if (stored) return stored;
  } catch {
    // Fall through and use an in-memory ID when storage is blocked.
  }

  const newId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `analytics-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  try {
    sessionStorage.setItem(ANALYTICS_SESSION_KEY, newId);
  } catch {
    // The session ID still works for this page view without persistence.
  }
  return newId;
};

export const useAnalytics = () => {
  const location = useLocation();
  const sessionIdRef = useRef<string | null>(null);
  const sessionReadyRef = useRef<Promise<boolean> | null>(null);
  const metadataRef = useRef<Awaited<ReturnType<typeof getAnalyticsMetadata>> | null>(null);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(() => isAllowed('analytics'));
  const isProductionHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'imadlab.com' || window.location.hostname === 'www.imadlab.com');

  const getMetadata = useCallback(async () => {
    if (metadataRef.current) return metadataRef.current;
    const metadata = await getAnalyticsMetadata();
    metadataRef.current = metadata;
    return metadata;
  }, []);

  // React to an actual permission change, not merely a route change.
  useEffect(() => {
    const sync = () => setAnalyticsAllowed(isAllowed('analytics'));
    const unsubscribe = onConsentChange(sync);
    // Catch a change that landed between render and subscription.
    sync();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isProductionHost || !analyticsAllowed) {
      sessionReadyRef.current = null;
      sessionIdRef.current = null;
      // A later opt-in must not reuse the session from before withdrawal.
      clearAnalyticsSession();
      return;
    }

    const controller = new AbortController();
    const sessionId = sessionIdRef.current ?? generateSessionId();
    sessionIdRef.current = sessionId;

    const initSession = async (): Promise<boolean> => {
      try {
        const metadata = await getMetadata();
        if (controller.signal.aborted || !isAllowed('analytics')) return false;

        const { error } = await supabase
          .rpc('track_session', {
            p_session_id: sessionId,
            p_user_agent: metadata.user_agent,
            p_device_type: metadata.device_type,
            p_browser: metadata.browser,
            p_os: metadata.os,
            p_screen_resolution: metadata.screen_resolution,
            p_language: metadata.language,
            p_timezone: metadata.timezone,
          })
          .abortSignal(controller.signal);

        if (controller.signal.aborted || !isAllowed('analytics')) return false;
        if (error) {
          logger.error('Analytics session error:', error);
          return false;
        }
        return true;
      } catch (error) {
        if (!controller.signal.aborted) logger.error('Analytics session error:', error);
        return false;
      }
    };

    sessionReadyRef.current = initSession();
    return () => {
      controller.abort();
      sessionReadyRef.current = null;
    };
  }, [analyticsAllowed, getMetadata, isProductionHost]);

  useEffect(() => {
    if (!isProductionHost || !analyticsAllowed) return;

    const controller = new AbortController();
    const sessionId = sessionIdRef.current ?? generateSessionId();
    sessionIdRef.current = sessionId;

    const trackPageView = async () => {
      try {
        const ready = await sessionReadyRef.current;
        if (!ready || controller.signal.aborted || !isAllowed('analytics')) return;

        const metadata = await getMetadata();
        if (controller.signal.aborted || !isAllowed('analytics')) return;

        const utmParams = extractUTMParams(window.location.href);
        const referrer = document.referrer || null;
        const trafficSource = getTrafficSource(referrer, utmParams.utm_source);

        const { error } = await supabase
          .rpc('track_page_view', {
            p_session_id: sessionId,
            p_path: location.pathname,
            p_referrer: referrer,
            p_traffic_source: trafficSource,
            p_utm_source: utmParams.utm_source || null,
            p_utm_medium: utmParams.utm_medium || null,
            p_utm_campaign: utmParams.utm_campaign || null,
            p_utm_term: utmParams.utm_term || null,
            p_utm_content: utmParams.utm_content || null,
            p_device_type: metadata.device_type,
            p_browser: metadata.browser,
            p_os: metadata.os,
          })
          .abortSignal(controller.signal);

        if (controller.signal.aborted) return;
        if (error) logger.error('Analytics page view error:', error);
      } catch (error) {
        if (!controller.signal.aborted) logger.error('Analytics page view error:', error);
      }
    };

    void trackPageView();
    return () => controller.abort();
  }, [analyticsAllowed, getMetadata, isProductionHost, location.pathname]);
};
