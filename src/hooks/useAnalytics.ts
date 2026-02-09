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
  const sessionIdRef = useRef<string>(generateSessionId());
  const sessionInitialized = useRef<boolean>(false);
  const pageViewIdRef = useRef<string | null>(null);
  const metadataRef = useRef<Awaited<ReturnType<typeof getAnalyticsMetadata>> | null>(null);
  const isProductionHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'imadlab.me' || window.location.hostname === 'www.imadlab.me');

  const getMetadata = useCallback(async () => {
    if (metadataRef.current) return metadataRef.current;
    const metadata = await getAnalyticsMetadata();
    metadataRef.current = metadata;
    return metadata;
  }, []);

  useEffect(() => {
    if (!isProductionHost || !isAllowed('analytics')) return;

    const sessionId = sessionIdRef.current;

    // Create or update session
    const initSession = async () => {
      const metadata = await getMetadata();

      logger.debug('📊 Analytics metadata collected:', metadata);

      const { error } = await supabase.from('visitor_sessions').upsert(
        {
          session_id: sessionId,
          last_activity: new Date().toISOString(),
          user_agent: metadata.user_agent,
          device_type: metadata.device_type,
          browser: metadata.browser,
          os: metadata.os,
          screen_resolution: metadata.screen_resolution,
          language: metadata.language,
          timezone: metadata.timezone,
        },
        { onConflict: 'session_id' }
      );

      if (error) {
        logger.error('❌ Analytics session error:', error);
      } else {
        logger.debug('✅ Analytics session created/updated:', sessionId);
        sessionInitialized.current = true;

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

    const sessionId = sessionIdRef.current;
    const startTime = Date.now();
    pageViewIdRef.current = null;

    // Track page view - ensure session exists first
    const trackPageView = async () => {
      // Wait for session to be initialized if not ready yet
      let attempts = 0;
      while (!sessionInitialized.current && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

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

      const { data: inserted, error } = await supabase
        .from('page_views')
        .insert({
          session_id: sessionId,
          path: location.pathname,
          referrer: referrer,
          traffic_source: trafficSource,
          utm_source: utmParams.utm_source || null,
          utm_medium: utmParams.utm_medium || null,
          utm_campaign: utmParams.utm_campaign || null,
          utm_term: utmParams.utm_term || null,
          utm_content: utmParams.utm_content || null,
          device_type: metadata.device_type,
          browser: metadata.browser,
          os: metadata.os,
        })
        .select('id')
        .single();

      if (error) {
        logger.error('❌ Analytics page view error:', error);
      } else {
        pageViewIdRef.current = inserted?.id ?? null;
        logger.debug('✅ Page view tracked:', location.pathname, { trafficSource, ...utmParams });
      }
    };

    trackPageView();

    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      if (duration > 0 && isAllowed('analytics') && pageViewIdRef.current) {
        supabase
          .from('page_views')
          .update({ duration })
          .eq('id', pageViewIdRef.current)
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
