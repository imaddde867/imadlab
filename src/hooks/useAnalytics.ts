import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isAllowed } from '@/lib/consent';
import { logger } from '@/lib/logger';
import { getAnalyticsMetadata, extractUTMParams, getTrafficSource } from '@/lib/analytics-utils';

const generateSessionId = (): string => {
  const stored = sessionStorage.getItem('analytics_session_id');
  if (stored) return stored;

  const newId = crypto.randomUUID();
  sessionStorage.setItem('analytics_session_id', newId);
  return newId;
};

export const useAnalytics = () => {
  const location = useLocation();
  const sessionIdRef = useRef<string | null>(null);
  const sessionReadyRef = useRef<{ resolve: () => void; promise: Promise<void> } | null>(null);
  const metadataRef = useRef<Awaited<ReturnType<typeof getAnalyticsMetadata>> | null>(null);
  const isProductionHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'imadlab.com' || window.location.hostname === 'www.imadlab.com');

  const getMetadata = useCallback(async () => {
    if (metadataRef.current) return metadataRef.current;
    const metadata = await getAnalyticsMetadata();
    metadataRef.current = metadata;
    return metadata;
  }, []);

  useEffect(() => {
    if (!isProductionHost || !isAllowed('analytics')) return;

    const sessionId = sessionIdRef.current ?? generateSessionId();
    sessionIdRef.current = sessionId;

    // Register the session without changing an existing record.
    const initSession = async () => {
      // Create the session-ready promise before any async work
      let resolveReady!: () => void;
      const readyPromise = new Promise<void>((resolve) => {
        resolveReady = resolve;
      });
      sessionReadyRef.current = { promise: readyPromise, resolve: resolveReady };

      const metadata = await getMetadata();
      if (!isAllowed('analytics')) {
        sessionReadyRef.current?.resolve();
        return;
      }

      logger.debug('📊 Analytics metadata collected:', metadata);

      const { error } = await supabase.rpc('track_session', {
        p_session_id: sessionId,
        p_user_agent: metadata.user_agent,
        p_device_type: metadata.device_type,
        p_browser: metadata.browser,
        p_os: metadata.os,
        p_screen_resolution: metadata.screen_resolution,
        p_language: metadata.language,
        p_timezone: metadata.timezone,
      });

      if (error) {
        logger.error('❌ Analytics session error:', error);
        sessionReadyRef.current?.resolve();
      } else {
        logger.debug('✅ Analytics session registered:', sessionId);
        sessionReadyRef.current?.resolve();
      }
    };

    initSession();
  }, [getMetadata, isProductionHost]);

  useEffect(() => {
    if (!isProductionHost || !isAllowed('analytics')) return;

    const sessionId = sessionIdRef.current ?? generateSessionId();
    sessionIdRef.current = sessionId;

    // Track page view - ensure session exists first
    const trackPageView = async () => {
      // Wait for session to be initialized
      await sessionReadyRef.current?.promise;

      // Get analytics metadata
      const metadata = await getMetadata();

      // Extract UTM parameters from current URL
      const utmParams = extractUTMParams(window.location.href);

      // Determine traffic source
      const referrer = document.referrer || null;
      const trafficSource = getTrafficSource(referrer, utmParams.utm_source);

      logger.debug('Page view data:', {
        path: location.pathname,
        trafficSource,
        device: metadata.device_type,
        browser: metadata.browser,
        os: metadata.os,
        referrer,
        ...utmParams,
      });

      if (!isAllowed('analytics')) return;
      const { error } = await supabase.rpc('track_page_view', {
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
      });

      if (error) {
        logger.error('❌ Analytics page view error:', error);
      } else {
        logger.debug('✅ Page view tracked:', location.pathname, { trafficSource, ...utmParams });
      }
    };

    trackPageView();
  }, [getMetadata, isProductionHost, location.pathname]);
};
