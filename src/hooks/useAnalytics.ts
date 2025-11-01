import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getConsent } from '@/lib/consent';

const generateSessionId = (): string => {
  const stored = sessionStorage.getItem('analytics_session_id');
  if (stored) return stored;
  
  const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('analytics_session_id', newId);
  return newId;
};

export const useAnalytics = () => {
  const location = useLocation();
  const sessionIdRef = useRef<string>(generateSessionId());
  const pageStartTime = useRef<number>(Date.now());
  const sessionInitialized = useRef<boolean>(false);

  useEffect(() => {
    const consent = getConsent();
    if (!consent || !consent.analytics) return;

    const sessionId = sessionIdRef.current;

    // Create or update session
    const initSession = async () => {
      const { error } = await supabase
        .from('visitor_sessions')
        .upsert({
          session_id: sessionId,
          last_activity: new Date().toISOString(),
          user_agent: navigator.userAgent,
        }, { onConflict: 'session_id' });

      if (error) {
        console.error('Analytics session error:', error);
      } else {
        sessionInitialized.current = true;
      }
    };

    initSession();
  }, []);

  useEffect(() => {
    const consent = getConsent();
    if (!consent || !consent.analytics) return;

    const sessionId = sessionIdRef.current;
    const startTime = Date.now();
    pageStartTime.current = startTime;

    // Track page view - ensure session exists first
    const trackPageView = async () => {
      // Wait for session to be initialized if not ready yet
      let attempts = 0;
      while (!sessionInitialized.current && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      const { error } = await supabase
        .from('page_views')
        .insert({
          session_id: sessionId,
          path: location.pathname,
          referrer: document.referrer || null,
        });

      if (error) console.error('Analytics tracking error:', error);
    };

    trackPageView();

    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      if (duration > 0 && consent.analytics) {
        supabase
          .from('page_views')
          .update({ duration })
          .eq('session_id', sessionId)
          .eq('path', location.pathname)
          .order('viewed_at', { ascending: false })
          .limit(1);
      }
    };
  }, [location.pathname]);
};
