import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isAllowed } from '@/lib/consent';
import { logger } from '@/lib/logger';
import { getAnalyticsMetadata, extractUTMParams, getTrafficSource } from '@/lib/analytics-utils';

const generateSessionId = (): string => {
  const stored = sessionStorage.getItem('analytics_session_id');
  if (stored) return stored;

  const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  sessionStorage.setItem('analytics_session_id', newId);
  return newId;
};

export const useAnalytics = () => {
  const location = useLocation();
  const sessionIdRef = useRef<string | null>(null);
  const sessionInitialized = useRef<boolean>(false);
  const sessionReadyRef = useRef<{ resolve: () => void; promise: Promise<void> } | null>(null);
  const pageViewIdRef = useRef<string | null>(null);
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

    // Create or update session
    const initSession = async () => {
      // Create the session-ready promise before any async work
      let resolveReady!: () => void;
      const readyPromise = new Promise<void>((resolve) => {
        resolveReady = resolve;
      });
      sessionReadyRef.current = { promise: readyPromise, resolve: resolveReady };

      const metadata = await getMetadata();

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
        logger.debug('✅ Analytics session created/updated:', sessionId);
        sessionInitialized.current = true;
        sessionReadyRef.current?.resolve();

        // Call geolocation edge function to enrich session with location data
        try {
          const { data: functionData, error: functionError } = await supabase.functions.invoke(
            'geolocation',
            {
              body: { session_id: sessionId },
            }
          );

          if (functionError) {
            logger.warn('⚠️ Geolocation function error:', functionError);
          } else if (functionData?.location) {
            logger.debug('✅ Geolocation data retrieved:', functionData.location);
          }
        } catch (geoError) {
          logger.warn('⚠️ Failed to fetch geolocation:', geoError);
        }
      }
    };

    initSession();
  }, [getMetadata, isProductionHost]);

  useEffect(() => {
    if (!isProductionHost || !isAllowed('analytics')) return;

    const sessionId = sessionIdRef.current ?? generateSessionId();
    sessionIdRef.current = sessionId;
    const startTime = Date.now();
    pageViewIdRef.current = null;

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

      const { data: insertedId, error } = await supabase.rpc('track_page_view', {
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
        pageViewIdRef.current = insertedId ?? null;
        logger.debug('✅ Page view tracked:', location.pathname, { trafficSource, ...utmParams });
      }
    };

    trackPageView();

    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      if (duration > 0 && isAllowed('analytics') && pageViewIdRef.current) {
        supabase
          .rpc('set_page_view_duration', { p_id: pageViewIdRef.current, p_duration: duration })
          .then(({ error }) => {
            if (error) {
              logger.error('❌ Duration update error:', error);
            } else {
              logger.debug('✅ Duration updated:', duration, 's');
            }
          });
      }
    };
  }, [getMetadata, isProductionHost, location.pathname]);
};
